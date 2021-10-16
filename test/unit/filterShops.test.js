import haversine from 'https://jspm.dev/haversine-distance'
import Hangul from 'https://jspm.dev/hangul-js'
import filter from '../../src/filterShops.js'
import placeList from '../../data/test/placeList.js'

describe('filter()', () => {
    it('가게 이름으로 필터링', () => {
        const result = filter(placeList, { shopName: 'ㄱ' })
        const expected = placeList.filter(entry => entry.shopName.startsWith('ㄱ')).map(entry => {
            return {
                ...entry,
                shopName: Hangul.assemble(entry.shopName)
            }
        })
        expect(result).to.deep.equal(expected)
    })
    it('거리로 필터링', () => {
        const testPos = { lat: 36.0290066, lon: 129.3258276 }
        const result = filter(placeList, { maxDistance: 10_000, currentPos: testPos })
        const expected = placeList.filter(entry => haversine(entry, testPos) <= 10_000).map(entry => {
            return {
                ...entry,
                shopName: Hangul.assemble(entry.shopName)
            }
        })
        expect(result).to.deep.equal(expected)
    })
    it('카테고리로 필터링', () => {
        const result = filter(placeList, { category: '자동차' })
        const expected = placeList.filter(entry => entry.category === '자동차').map(entry => {
            return {
                ...entry,
                shopName: Hangul.assemble(entry.shopName)
            }
        })
        expect(result).to.deep.equal(expected)
    })
    it('키워드로 필터링', () => {
        const result = filter(placeList, { keywords: new Set(['수리', '가고싶은곳']) })
        const expected = placeList.filter(entry => entry.keywords.has('수리') || entry.keywords.has('가고싶은곳')).map(entry => {
            return {
                ...entry,
                shopName: Hangul.assemble(entry.shopName)
            }
        })
        expect(result).to.deep.equal(expected)
    })
    it('아무 필터도 주어지지 않을 경우 모든 결과 출력', () => {
        const result = filter(placeList, {})
        expect(result).to.deep.equal(placeList.map(entry => {
            return {
                ...entry,
                shopName: Hangul.assemble(entry.shopName)
            }
        }))
    })
})