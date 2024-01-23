import fetch from 'node-fetch'

class Juejin {
  constructor () {
    /** 接口信息 */
    this.info = {
      name: 'juejin',
      title: '稀土掘金',
      subtitle: '热榜'
    }
    /** 更新时间 */
    this.updateTime = new Date().getTime()
    /** 缓存键名 */
    this.cacheKey = 'Server:api:hot:juejinData'
  }

  async get (options) {
    try {
      /** 从缓存中获取数据 */
      let data = !options.isNew && JSON.parse(await redis.get(this.cacheKey))
      let from = data ? 'cache' : 'server'
      if (!data) {
        /** 从服务器拉取数据 */
        let requestParams = ['https://api.juejin.cn/content_api/v1/content/article_rank?category_id=1&type=hot']
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
      id: v.content.content_id,
      title: v.content.title,
      hot: v.content_counter.hot_rank,
      url: `https://juejin.cn/post/${v.content.content_id}`,
      mobileUrl: `https://juejin.cn/post/${v.content.content_id}`
    }))
  }
}

export default new Juejin()
