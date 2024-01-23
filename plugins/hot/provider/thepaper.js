import fetch from 'node-fetch'

class Thepaper {
  constructor () {
    /** 接口信息 */
    this.info = {
      name: 'thepaper',
      title: '澎湃新闻',
      subtitle: '热榜'
    }
    /** 更新时间 */
    this.updateTime = new Date().getTime()
    /** 缓存键名 */
    this.cacheKey = 'Server:api:hot:thepaperData'
  }

  async get (options) {
    try {
      /** 从缓存中获取数据 */
      let data = !options.isNew && JSON.parse(await redis.get(this.cacheKey))
      let from = data ? 'cache' : 'server'
      if (!data) {
        /** 从服务器拉取数据 */
        let requestParams = [
          'https://cache.thepaper.cn/contentapi/wwwIndex/rightSidebar',
          {
            headers: { 'User-Agent': 'Mozilla/5.0' }
          }
        ]
        let res = await (await fetch(...requestParams)).json()
        data = this.ranListMap(res.data.hotNews)
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
      id: v.contId,
      title: v.name,
      pic: v.pic,
      hot: v.praiseTimes,
      time: v.pubTime,
      url: `https://www.thepaper.cn/newsDetail_forward_${v.contId}`,
      mobileUrl: `https://m.thepaper.cn/newsDetail_forward_${v.contId}`
    }))
  }
}

export default new Thepaper()
