import fetch from 'node-fetch'

class ShaoshuPai {
  constructor () {
    /** 接口信息 */
    this.info = {
      name: 'sspai',
      title: '少数派',
      subtitle: '热榜'
    }
    /** 更新时间 */
    this.updateTime = new Date().getTime()
    /** 缓存键名 */
    this.cacheKey = 'Server:api:hot:sspaiData'
  }

  async get (options) {
    try {
      /** 从缓存中获取数据 */
      let data = !options.isNew && JSON.parse(await redis.get(this.cacheKey))
      let from = data ? 'cache' : 'server'
      if (!data) {
        /** 从服务器拉取数据 */
        let requestParams = [
          'https://sspai.com/api/v1/article/tag/page/get?limit=40&tag=热门文章',
          {
            headers: { 'User-Agent': 'Mozilla/5.0' }
          }
        ]
        let res = await (await fetch(...requestParams)).json()
        data = this.ranListMap(res.data)
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
      id: v.id,
      title: v.title,
      desc: v.summary,
      pic: `https://cdn.sspai.com/${v.banner}`,
      owner: v.author,
      hot: v.like_count,
      url: `https://sspai.com/post/${v.id}`,
      mobileUrl: `https://sspai.com/post/${v.itemId}`
    }))
  }
}

export default new ShaoshuPai()
