import fetch from 'node-fetch'

class Douyin {
  constructor () {
    /** 接口信息 */
    this.info = {
      name: 'douyin',
      title: '抖音',
      subtitle: '热点榜'
    }
    /** 更新时间 */
    this.updateTime = new Date().getTime()
    /** 缓存键名 */
    this.cacheKey = 'Server:api:hot:douyinData'
    this.cacheCookieKey = 'Server:api:hot:douyinCookieData'
  }

  async get (options) {
    try {
      /** 从缓存中获取数据 */
      let data = !options.isNew && JSON.parse(await redis.get(this.cacheKey))
      let from = data ? 'cache' : 'server'
      if (!data) {
        /** 从服务器拉取数据 */
        let requestParams = [
          'https://www.douyin.com/aweme/v1/web/hot/search/list/?device_platform=webapp&aid=6383&channel=channel_pc_web&detail_list=1&round_trip_time=50',
          {
            headers: { 'User-Agent': 'Mozilla/5.0', Cookie: await this.getCookie() }
          }
        ]
        let res = await (await fetch(...requestParams)).json()
        data = this.ranListMap(res.data.word_list)
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
      title: v.word,
      pic: `${v.word_cover.url_list[0]}`,
      hot: Number(v.hot_value),
      url: `https://www.douyin.com/hot/${encodeURIComponent(v.sentence_id)}`,
      mobileUrl: `https://www.douyin.com/hot/${encodeURIComponent(v.sentence_id)}`
    }))
  }

  async getCookie () {
    let cookie = await redis.get(this.cacheCookieKey)
    if (!cookie) {
      let response = await fetch('https://www.douyin.com/passport/general/login_guiding_strategy/?aid=6383')
      cookie = response.headers.get('set-cookie').split(';')[0]
      redis.set(this.cacheCookieKey, cookie, { EX: 3600 })
    }
    return cookie
  }
}

export default new Douyin()
