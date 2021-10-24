const data = [
    [36.05848881003674, 129.26497496549703],
    [36.05848881003674, 129.41538706613167],
    [35.971620244633044, 129.26497496549703],
    [35.971620244633044, 129.41538706613167]
]

const result = []

for (const [lat, lon] of data) {
    const x = lon
    const y = Math.log(Math.tan(lat) + (1 / Math.cos(lat)))
    result.push([x, y])
}


console.log(result)