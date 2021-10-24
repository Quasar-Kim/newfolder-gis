const fs = require("fs")
const path = require("path")

const getAllFiles = function(dirPath, arrayOfFiles) {
  files = fs.readdirSync(dirPath)

  arrayOfFiles = arrayOfFiles || []

  files.forEach(function(file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles)
    } else {
      arrayOfFiles.push(path.join(__dirname, dirPath, "/", file))
    }
  })

  return arrayOfFiles
}

const list = getAllFiles('data/tiles').map(dir => 'https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/' + dir.substring(47).replaceAll('\\', '/').split('.')[0] + '?access_token=pk.eyJ1Ijoia2ltanMzNTUwIiwiYSI6ImNqcWRlYXl0NTB6M2s0M253dTc0b2lnZmUifQ.RyACn_bFyprINnyG4E_OaQ')
fs.writeFileSync('./preFetchList.json', JSON.stringify(list))
