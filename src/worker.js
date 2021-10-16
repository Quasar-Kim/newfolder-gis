import * as Comlink from 'https://jspm.dev/comlink'
import PouchDB from 'https://jspm.dev/pouchdb'
import filterShops from './filterShops.js'

class DBService {
    constructor() {
        this.placeList = []
        this.db = new PouchDB('placeDetail')
    }
    
    // dataDir은 데이터가 위치한 디렉토리
    // test: /data/test
    // prod: /data/prod
    async init(dataDir) {
        // 필터링용 js 모듈 로드
        return Promise.all([
            import(dataDir + '/placeList.js').then(exports => {
                this.placeList = exports.default
            }),
            fetch(dataDir + '/placeDetail.json').then(res => res.json()).then(docs => this.db.bulkDocs(docs))
        ])
    }

    filter(filters) {
        return filterShops(this.placeList, filters)
    }

    async getDetail(id) {
        return await this.db.get(id)
    }
}

console.log('worker installed')
Comlink.expose(DBService)