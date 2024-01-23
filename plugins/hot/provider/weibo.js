import fetch from 'node-fetch'

class Weibo {
  constructor () {
    /** 接口信息 */
    this.info = {
      name: 'weibo',
      title: '微博',
      subtitle: '热搜榜'
    }
    /** 更新时间 */
    this.updateTime = new Date().getTime()
    /** 缓存键名 */
    this.cacheKey = 'Server:api:hot:weiboData'
  }

  async get (options) {
    try {
      /** 从缓存中获取数据 */
      let data = !options.isNew && JSON.parse(await redis.get(this.cacheKey))
      let from = data ? 'cache' : 'server'
      if (!data) {
        /** 从服务器拉取数据 */
        let requestParams = [
          'https://weibo.com/ajax/side/hotSearch',
          {
            headers: { 'User-Agent': 'Mozilla/5.0' }
          }
        ]
        let res = await (await fetch(...requestParams)).json()
        data = this.ranListMap(res.data.realtime)
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
    return data.map((v) => {
      let key = v.word_scheme ? v.word_scheme : `#${v.word}`
      return {
        title: v.word,
        desc: key,
        hot: v.raw_hot,
        url: `https://s.weibo.com/weibo?q=${encodeURIComponent(key)}&t=31&band_rank=1&Refer=top`,
        mobileUrl: `https://s.weibo.com/weibo?q=${encodeURIComponent(key)}&t=31&band_rank=1&Refer=top`
      }
    })
  }
}

export default new Weibo()
