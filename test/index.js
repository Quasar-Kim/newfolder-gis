import * as Comlink from 'https://jspm.dev/comlink'
import WordCloud from 'https://jspm.dev/wordcloud'

const worker = new Worker('/src/worker.js', {
    type: 'module'
})
const DBService = Comlink.wrap(worker)
const db = await new DBService()
const dbReady = db.init({ dataDir: '/data/test', remoteDB: { url: 'http://localhost:5984/place-detrails', username: 'map-app', password: 'newfolder' } }).then(() => console.log('DBService initialized'))

let lastLocationInfo = {
    timestamp: 0,
    coords: {
        latitude: 0,
        longitude: 0
    }
}
function locate() {
    return new Promise((resolve, reject) => {
        const currentTimestamp = Date.now()

        // 캐시 1분
        if (currentTimestamp - lastLocationInfo.timestamp > 1000 * 60) {
            navigator.geolocation.getCurrentPosition(result => {
                lastLocationInfo = result
                resolve({
                    lat: result.coords.latitude,
                    lon: result.coords.longitude
                })
            }, reject)
        } else {
            resolve({
                lat: lastLocationInfo.coords.latitude,
                lon: lastLocationInfo.coords.longitude
            })
        }
    })
}

// 검색 컨트롤(테스트용)
L.Control.SearchBar = L.Control.extend({
    onAdd(map) {
        // 요소 추가
        const rootElem = document.createElement('div')
        rootElem.innerHTML = `
            <section id="filtersSection" class="card">
                <ul>
                    <li>shopName <input id="shopNameInput"></li>
                    <li>maxDistance(m) <input id="maxDistanceInput"></li>
                    <li>category <input id="categoryInput"></li>
                    <li>keywords <input id="keywordsInput"></li>
                </ul>
            </section>
            <section id="resultSection" class="card">
                검색 결과가 여기에 표시됩니다!
            </section>
        `

        const view = {
            filtersSection: rootElem.querySelector('#filtersSection'),
            resultSection: rootElem.querySelector('#resultSection'),
            maxDistanceInput: rootElem.querySelector('#maxDistanceInput'),
            shopNameInput: rootElem.querySelector('#shopNameInput'),
            categoryInput: rootElem.querySelector('#categoryInput'),
            keywordsInput: rootElem.querySelector('#keywordsInput')
        }

        // 검색 기능
        async function filter() {
            // 필터 값 가져오기
            const query = {
                maxDistance: Number(view.maxDistanceInput.value),
                shopName: view.shopNameInput.value,
                category: view.categoryInput.value,
                keywords: new Set(view.keywordsInput.value.split(',').map(t => t.trim()).filter(t => t.length > 0))
            }

            view.resultSection.classList.add('progressing')

            // 위치 정보 로드
            const currentPos = await locate()
            await dbReady
            const result = await db.filter({ currentPos, ...query })

            // console.log(result)

            // 검색 결과 표시
            if (result.length === 0) {
                view.resultSection.innerHTML = `검색 결과가 없어요...`
            } else {
                const listElem = document.createElement('ul')
                listElem.id = 'result'
                for (const place of result) {
                    const liElem = document.createElement('li')
                    liElem.innerHTML = `
                        <h3>${place.shopName}</h3>
                        ${place.distance} | ${place.category} | ${[...place.keywords].join(',')}
                    `
                    liElem.setAttribute('data-id', place.id)
                    listElem.append(liElem)
                }
                view.resultSection.innerHTML = ''
                view.resultSection.append(listElem)
            }

            setTimeout(() => view.resultSection.classList.remove('progressing'), 40)
        }
        view.shopNameInput.addEventListener('input', filter)
        view.maxDistanceInput.addEventListener('change', filter)
        view.categoryInput.addEventListener('change', filter)
        view.keywordsInput.addEventListener('change', filter)


        // 디테일 기능
        async function getDetail(e) {
            if (e.target.tagName !== 'H3') return
            const id = e.target.parentElement.getAttribute('data-id')

            // 검색창 숨기기
            view.filtersSection.hidden = true

            // console.log(id)
            await dbReady
            const detail = await db.getDetail(id)

            // 지도 포커스
            const marker = L.marker([detail.lat, detail.lon])
            marker.addTo(map)
            map.flyTo([detail.lat, detail.lon], 16)

            view.resultSection.innerHTML = `
                <p><button id="goBack">검색 결과로 돌아가기</button></p>
                <h2>${detail.name}</h2>
                <p><a href=tel:${detail.phone}>${detail.phone}</a></p>
                <canvas width="400" height="225"></canvas>
            `

            // 뒤로가기 버튼 매핑
            rootElem.querySelector('#goBack').addEventListener('click', () => {
                view.filtersSection.hidden = false
                map.removeLayer(marker)
                view.resultSection.innerHTML = ''
                filter()
            })

            // 워드클라우드 렌더링
            const renderingCanvas = document.createElement('canvas')
            renderingCanvas.width = 1280
            renderingCanvas.height = 720

            WordCloud(renderingCanvas, {
                list: detail.keywords,
                gridSize: 50,
                weightFactor: 16,
                fontFamily: 'Noto Sans KR',
                rotateRatio: 0,
                shape: 'square',
                color: (word, weight) => {
                    if (weight > 8) {
                        return '#00701a'
                    } else if (weight > 5) {
                        return '#43a047'
                    } else {
                        return '#76d275'
                    }
                }
            })

            let renderingDone = false

            // 작은 캔버스로 미러링
            const ctx = rootElem.querySelector('canvas').getContext('2d')
            function mirror() {
                ctx.drawImage(renderingCanvas, 0, 0, renderingCanvas.width, renderingCanvas.height, 0, 0, ctx.canvas.width, ctx.canvas.height)

                if (!renderingDone) requestAnimationFrame(mirror)
            }
            requestAnimationFrame(mirror)

            renderingCanvas.addEventListener('wordcloudstop', () => {
                renderingDone = true
                console.log('wordcloud rendering done')
            })
        }
        view.resultSection.addEventListener('click', getDetail)

        return rootElem
    }
})
L.control.searchBar = opts => new L.Control.SearchBar(opts)

// 지도 설정

const map = L.map('map', { zoomControl: false }).setView([36.02901093587494, 129.32806994448887], 14);
L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'pk.eyJ1Ijoia2ltanMzNTUwIiwiYSI6ImNqcWRlYXl0NTB6M2s0M253dTc0b2lnZmUifQ.RyACn_bFyprINnyG4E_OaQ'
}).addTo(map);
L.control.searchBar({ position: 'topleft' }).addTo(map)
L.control.zoom({ position: 'topright' }).addTo(map)

async function showPosMarker() {
    const userLocation = await locate()
    const pos = [userLocation.lat, userLocation.lon]
    L.circleMarker(pos).addTo(map)
    map.flyTo(pos)
}

showPosMarker()