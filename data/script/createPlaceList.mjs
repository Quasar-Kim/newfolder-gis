import fs from 'fs'

const data = JSON.parse(fs.readFileSync('data/dev/placeDetail.json'))

const processed = data.map(entry => {
    return {
        "id": entry["_id"],
        "lat": entry.lat,
        "lon": entry.lon,
        "shopName": entry.name,
        "category": entry.category,
        "keywords": entry.keywords
    }
})

fs.writeFileSync('data/dev/placeList.json', JSON.stringify(processed))