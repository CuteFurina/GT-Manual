import fetch from 'node-fetch'

class Newsqq {
  constructor () {
    /** 接口信息 */
    this.info = {
      name: 'newsqq',
      title: '腾讯新闻',
      subtitle: '热点榜'
    }
    /** 更新时间 */
    this.updateTime = new Date().getTime()
    /** 缓存键名 */
    this.cacheKey = 'Server:api:hot:newsqqData'
  }

  async get (options) {
    try {
      /** 从缓存中获取数据 */
      let data = !options.isNew && JSON.parse(await redis.get(this.cacheKey))
      let from = data ? 'cache' : 'server'
      if (!data) {
        /** 从服务器拉取数据 */
        let requestParams = [
          'https://r.inews.qq.com/gw/event/hot_ranking_list?page_size=50',
          {
            headers: { 'User-Agent': 'Mozilla/5.0' }
          }
        ]
        let res = await (await fetch(...requestParams)).json()
        data = this.ranListMap(res.idlist[0].newslist)
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
      desc: v.abstract,
      descSm: v.nlpAbstract,
      hot: v.readCount,
      pic: v.miniProShareImage,
      url: `https://new.qq.com/rain/a/${v.id}`,
      mobileUrl: `https://view.inews.qq.com/a/${v.id}`
    }))
  }
}

export default new Newsqq()
