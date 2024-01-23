import fetch from 'node-fetch'

class Zhihu {
  constructor () {
    /** 接口信息 */
    this.info = {
      name: 'zhihu',
      title: '知乎',
      subtitle: '热榜'
    }
    /** 更新时间 */
    this.updateTime = new Date().getTime()
    /** 缓存键名 */
    this.cacheKey = 'Server:api:hot:zhihuData'
  }

  async get (options) {
    try {
      /** 从缓存中获取数据 */
      let data = !options.isNew && JSON.parse(await redis.get(this.cacheKey))
      let from = data ? 'cache' : 'server'
      if (!data) {
        /** 从服务器拉取数据 */
        let requestParams = [
          'https://www.zhihu.com/hot',
          {
            headers: { 'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1' }
          }
        ]
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
    let pattern = /<script id="js-initialData" type="text\/json">(.*?)<\/script>/
    let matchResult = data.match(pattern)
    let jsonObject = JSON.parse(matchResult[1]).initialState.topstory.hotList
    jsonObject.forEach((v) => {
      dataList.push({
        title: v.target.titleArea.text,
        desc: v.target.excerptArea.text,
        pic: v.target.imageArea.url,
        hot: parseInt(v.target.metricsArea.text.replace(/[^\d]/g, '')) * 10000,
        url: v.target.link.url,
        mobileUrl: v.target.link.url
      })
    })
    return dataList
  }
}

export default new Zhihu()
