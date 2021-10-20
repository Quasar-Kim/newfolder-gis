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
    async init({ dataDir, remoteDB: remoteDBConfig }) {
        // 필터링용 js 모듈 로드
        return Promise.all([
            import(dataDir + '/placeList.js').then(exports => {
                this.placeList = exports.default
            }),
            this.replicate(remoteDBConfig)
        ])
    }

    async replicate(remoteDBConfig) {
        const replicated = await this.checkIsReplicated()
        if (!navigator.onLine && replicated) return
        
        try {
            const remoteDB = new PouchDB(remoteDBConfig.url, {
                auth: { 
                    username: remoteDBConfig.username, 
                    password: remoteDBConfig.password
                },
                skip_setup: true
            })
            await this.db.replicate.from(remoteDB, { timeout: 1000 })
        } catch(err) {
            if (replicated) {
                console.log('서버에 연결할 수 없음. 저장된 DB 사용중.')
            } else {
                throw err
            }
        }
    }

    filter(filters) {
        return filterShops(this.placeList, filters)
    }

    async checkIsReplicated() {
        const info = await this.db.info()
        return info.doc_count > 0
    }

    async getDetail(id) {
        return await this.db.get(id)
    }
}

console.log('worker installed')
Comlink.expose(DBService)