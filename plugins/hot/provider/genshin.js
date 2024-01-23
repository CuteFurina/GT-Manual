import fetch from 'node-fetch'

class Genshin {
  constructor () {
    /** 接口信息 */
    this.info = {
      name: 'genshin',
      title: '原神',
      subtitle: '最新信息'
    }
    /** 更新时间 */
    this.updateTime = new Date().getTime()
    /** 缓存键名 */
    this.cacheKey = 'Server:api:hot:genshinData'
  }

  async get (options) {
    try {
      /** 从缓存中获取数据 */
      let data = !options.isNew && JSON.parse(await redis.get(this.cacheKey))
      let from = data ? 'cache' : 'server'
      if (!data) {
        /** 从服务器拉取数据 */
        let requestParams = ['https://content-static.mihoyo.com/content/ysCn/getContentList?pageSize=50&pageNum=1&channelId=10']
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
      id: v.id,
      title: v.title,
      pic: v.ext[1]?.value[0]?.url,
      start_time: v?.start_time,
      url: `https://ys.mihoyo.com/main/news/detail/${v.id}`,
      mobileUrl: `https://ys.mihoyo.com/main/m/news/detail/${v.id}`
    }))
  }
}

export default new Genshin()
