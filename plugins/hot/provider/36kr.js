import fetch from 'node-fetch'

class Kr {
  constructor () {
    /** 接口信息 */
    this.info = {
      name: '36kr',
      title: '36氪',
      subtitle: '热榜'
    }
    /** 更新时间 */
    this.updateTime = new Date().getTime()
    /** 缓存键名 */
    this.cacheKey = 'Server:api:hot:krData'
  }

  async get (options) {
    try {
      /** 从缓存中获取数据 */
      let data = !options.isNew && JSON.parse(await redis.get(this.cacheKey))
      let from = data ? 'cache' : 'server'
      if (!data) {
        /** 从服务器拉取数据 */
        let requestParams = [
          'https://gateway.36kr.com/api/mis/nav/home/nav/rank/hot',
          {
            method: 'POST',
            headers: { 'User-Agent': 'Mozilla/5.0', 'Content-Type': 'application/json' },
            body: JSON.stringify({
              partner_id: 'wap',
              param: {
                siteId: 1,
                platformId: 2
              },
              timestamp: new Date().getTime()
            })
          }
        ]
        let res = await (await fetch(...requestParams)).json()
        data = this.ranListMap(res.data.hotRankList)
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
      id: v.itemId,
      title: v.templateMaterial.widgetTitle,
      pic: v.templateMaterial.widgetImage,
      owner: v.templateMaterial.authorName,
      hot: v.templateMaterial.statRead,
      data: v.templateMaterial,
      url: `https://www.36kr.com/p/${v.itemId}`,
      mobileUrl: `https://www.36kr.com/p/${v.itemId}`
    }))
  }
}

export default new Kr()
