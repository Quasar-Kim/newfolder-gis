import fs from 'fs'
import Hangul from 'hangul-js'
import { minify } from 'terser'

// placeList.json -> placeList.js 변환
const placeList = JSON.parse(fs.readFileSync('data/placeList.json'))

// 1. 한글 분해
for (let i = 0; i < placeList.length; i++) {
    const place = placeList[i]
    place.shopName = Hangul.disassemble(place.shopName).join('')
    placeList[i] = place
}

// 2. 재정렬
placeList.sort((a, b) => {
    if (a.shopName < b.shopName) return -1
    if (a.shopName > b.shopName) return 1
    return 0
})

// 3. js module로 변환
function transformPlaceEntry(place) {
    return `{
        "id": "${place.id}",
        "lat": ${place.lat},
        "lon": ${place.lon},
        "shopName": "${place.shopName}",
        "category": "${place.category}",
        "keywords": new Set(${place.keywords.length > 0 ? JSON.stringify(place.keywords) : ''})
    },`
}

let transformed = `
export default [
`
for (const place of placeList) {
    transformed += transformPlaceEntry(place)
}
transformed += ']'

// fs.writeFileSync('data/placeList.transformed.js', transformed)
const { code: minified } = await minify(transformed)
fs.writeFileSync('data/placeList.transformed.js', minified)