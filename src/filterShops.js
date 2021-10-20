import Hangul from 'https://jspm.dev/hangul-js'
import haversine from 'https://jspm.dev/haversine-distance'
import prettyMetric from 'https://jspm.dev/pretty-metric'
import searchStartIndex from './searchStartIndex.js'

function hasIntersection(set1, set2) {
    for (const elem of set1) {
        if (set2.has(elem)) return true
    }
}

export default function filterShops(placeList, { maxDistance = -1, currentPos = {}, shopName = '', category = '', keywords = new Set() }) {
    const disassembledShopName = Hangul.disassemble(shopName).join('')

    // shopName을 이용해 binarySearch 수행
    // placeList 는 shopName 순으로 정렬되어 있어야 함!
    const startIndex = shopName.length === 0 
        ? 0 
        : searchStartIndex({
            arr: placeList,
            target: disassembledShopName,
            key: 'shopName'
        })
    
    // shopName.startsWith가 false가 뜨면 그 뒤로부터는 전혀 확인해야 할 필요가 없으므로
    // 처음 false가 떴을때 이 변수에 기록
    let doesShopNameMatch = true 

    // 필터와 맞지 않을경우 false, 맞을 경우 distance(Number) 리턴 
    function doesPlaceMatchFilter(place) {
        if (!doesShopNameMatch) {
            return false
        }

        // 가게 이름 필터링
        // '고양이'.startsWith('') === true이므로 shopName 필터가 주어지지 않은 경우에는
        // 항상 이 블록이 건너뛰어짐
        if (!place.shopName.startsWith(disassembledShopName)) {
            doesShopNameMatch = false
            return false
        }
        
        // 거리 필터링
        // 나중에 쓰기 위해서 스코프가 여기로 되어있음
        let distance = NaN
        if ('lat' in currentPos && 'lon' in currentPos) {
            // distance는 미터단위
            distance = haversine(currentPos, place)
            if (maxDistance > 0 && distance > maxDistance) {
                return false
            }
        }

        // 카테고리 필터링
        // undefined > 0이므로 category가 
        if (category.length > 0 && place.category !== category) {
            return false
        }
    
        // 키워드 필터링
        if (keywords.size > 0 && !hasIntersection(place.keywords, keywords)) {
            return false
        }

        return distance
    }
 
    const filteredResult = []
    for (let i = 0; i < placeList.length; i++) {
        // startIndex까지 건너뛰기
        if (i < startIndex) {
            continue
        }

        const place = placeList[i]
        const distance = doesPlaceMatchFilter(place)
        if (typeof distance === 'number') {
            filteredResult.push({
                ...place,
                shopName: Hangul.assemble(place.shopName),
                distance: prettyMetric(distance).humanize()
            })
        }
    }

    return filteredResult
}
