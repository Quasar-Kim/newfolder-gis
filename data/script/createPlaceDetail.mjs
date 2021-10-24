import fs from 'fs'

const { data } = JSON.parse(fs.readFileSync('data/table.json'))

const processed = data.map(entry => {
    return {
        "_id": "#" + entry["level_0"],
        "name": entry.name,
        "pictures": ["https://via.placeholder.com/480x225.png?text=No+Image"],
        "lat": entry.lon, // ???
        "lon": entry.lat, // ??????
        "keywords": [],
        "reviews": [],
        "category": entry["cate_1"],
        "rating": entry["naver_star_point"]
    }
})

fs.writeFileSync('data/dev/placeDetail.json', JSON.stringify(processed))