import fetch from 'node-fetch'

class Baidu {
  constructor () {
    /** 接口信息 */
    this.info = {
      name: 'baidu',
      title: '百度',
      subtitle: '热搜榜'
    }
    /** 更新时间 */
    this.updateTime = new Date().getTime()
    /** 缓存键名 */
    this.cacheKey = 'Server:api:hot:baiduData'
  }

  async get (options) {
    try {
      /** 从缓存中获取数据 */
      let data = !options.isNew && JSON.parse(await redis.get(this.cacheKey))
      let from = data ? 'cache' : 'server'
      if (!data) {
        /** 从服务器拉取数据 */
        let requestParams = ['https://top.baidu.com/board?tab=realtime']
        let res = await (await fetch(...requestParams)).text()
        data = this.ranListMap(res)
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
    let dataList = []
    let pattern = /<!--s-data:(.*?)-->/s
    let matchResult = data.match(pattern)
    let jsonObject = JSON.parse(matchResult[1]).data.cards[0].content
    jsonObject.forEach((v) => {
      dataList.push({
        title: v.query,
        desc: v.desc,
        pic: v.img,
        hot: Number(v.hotScore),
        url: `https://www.baidu.com/s?wd=${encodeURIComponent(v.query)}`,
        mobileUrl: v.url
      })
    })
    return dataList
  }
}

export default new Baidu()
