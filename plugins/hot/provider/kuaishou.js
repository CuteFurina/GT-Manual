import fetch from 'node-fetch'

class Kuaishou {
  constructor () {
    /** 接口信息 */
    this.info = {
      name: 'kuaishou',
      title: '快手',
      subtitle: '热榜'
    }
    /** 更新时间 */
    this.updateTime = new Date().getTime()
    /** 缓存键名 */
    this.cacheKey = 'Server:api:hot:kuaishouData'
  }

  async get (options) {
    try {
      /** 从缓存中获取数据 */
      let data = !options.isNew && JSON.parse(await redis.get(this.cacheKey))
      let from = data ? 'cache' : 'server'
      if (!data) {
        /** 从服务器拉取数据 */
        let requestParams = [
          'https://www.kuaishou.com/?isHome=1',
          {
            headers: { 'User-Agent': 'Mozilla/5.0' }
          }
        ]
        let res = await (await fetch(...requestParams)).text()
        data = this.ranListMap(res)
        this.updateTime = new Date().getTime()
        /** 将数据写入缓存 */
        redis.set(this.cacheKey, JSON.stringify(data), { EX: 1800 })
      }
      return {
        code: 200,
        message: '获取成功',
        from,
        data
      }
    } catch (error) {
      return {
        code: 500,
        message: '获取失败',
        from: 'server',
        data: []
      }
    }
  }

  ranListMap (data) {
    let dataList = []
    let pattern = /window.__APOLLO_STATE__=(.*);\(function\(\)/s
    let idPattern = /clientCacheKey=([A-Za-z0-9]+)/s
    let matchResult = data.match(pattern)
    let jsonObject = JSON.parse(matchResult[1]).defaultClient
    let allItems = jsonObject['$ROOT_QUERY.visionHotRank({"page":"home"})'].items
    allItems.forEach((v) => {
      let image = jsonObject[v.id].poster
      let id = image.match(idPattern)[1]
      dataList.push({
        title: jsonObject[v.id].name,
        pic: image.replace(/\\u([\d\w]{4})/gi, (match, grp) => String.fromCharCode(parseInt(grp, 16))),
        hot: jsonObject[v.id].hotValue,
        url: `https://www.kuaishou.com/short-video/${id}`,
        mobileUrl: `https://www.kuaishou.com/short-video/${id}`
      })
    })
    return dataList
  }
}

export default new Kuaishou()
