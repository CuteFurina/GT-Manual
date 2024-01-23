import fetch from 'node-fetch'

class Bilibili {
  constructor () {
    /** 接口信息 */
    this.info = {
      name: 'bilibili',
      title: '哔哩哔哩',
      subtitle: '热门榜'
    }
    /** 更新时间 */
    this.updateTime = new Date().getTime()
    /** 缓存键名 */
    this.cacheKey = 'Server:api:hot:bilibiliData'
  }

  async get (options) {
    try {
      /** 从缓存中获取数据 */
      let data = !options.isNew && JSON.parse(await redis.get(this.cacheKey))
      let from = data ? 'cache' : 'server'
      if (!data) {
        /** 从服务器拉取数据 */
        let requestParams = [
          'https://api.bilibili.com/x/web-interface/ranking/v2',
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
      id: v.bvid,
      title: v.title,
      desc: v.desc,
      pic: v.pic.replace(/^http/, 'https'),
      owner: v.owner,
      data: v.stat,
      hot: v.stat.view,
      url: v.short_link_v2 || `https://b23.tv/${v.bvid}`,
      mobileUrl: `https://m.bilibili.com/video/${v.bvid}`
    }))
  }
}

export default new Bilibili()
