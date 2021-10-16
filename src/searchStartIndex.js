// 베이스 코드 출처: https://github.com/nolanlawson/pokedex.org/blob/e8cd6d128aedb0f8c4df53060be6260cb8b64002/src/js/worker/inMemoryDatabase.js

export default function searchStartIndex({ arr, target, key }) {
  let low = 0
  let high = arr.length
  let mid
  
  while (low < high) {
    mid = (low + high) >>> 1 // faster version of Math.floor((low + high) / 2)
    // arr[mid][key] < target ? low = mid + 1 : high = mid
    arr[mid][key] < target ? low = mid + 1 : high = mid
  }
  
  return low
}