import fetch from 'node-fetch'

class Netease {
  constructor () {
    /** 接口信息 */
    this.info = {
      name: 'netease',
      title: '网易新闻',
      subtitle: '热点榜'
    }
    /** 更新时间 */
    this.updateTime = new Date().getTime()
    /** 缓存键名 */
    this.cacheKey = 'Server:api:hot:neteaseData'
  }

  async get (options) {
    try {
      /** 从缓存中获取数据 */
      let data = !options.isNew && JSON.parse(await redis.get(this.cacheKey))
      let from = data ? 'cache' : 'server'
      if (!data) {
        /** 从服务器拉取数据 */
        let requestParams = [
          'https://m.163.com/fe/api/hot/news/flow',
          {
            headers: { 'User-Agent': 'Mozilla/5.0' }
          }
        ]
        let res = await (await fetch(...requestParams)).json()
        data = this.ranListMap(res.data.list)
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
    return data.map((v) => ({
      id: v.skipID,
      title: v.title,
      desc: v._keyword,
      pic: v.imgsrc,
      owner: v.source,
      url: `https://www.163.com/dy/article/${v.skipID}.html`,
      mobileUrl: v.url
    }))
  }
}

export default new Netease()
