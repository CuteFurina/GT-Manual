import fetch from 'node-fetch'

class LOL {
  constructor () {
    /** 接口信息 */
    this.info = {
      name: 'lol',
      title: '英雄联盟',
      subtitle: '更新公告'
    }
    /** 更新时间 */
    this.updateTime = new Date().getTime()
    /** 缓存键名 */
    this.cacheKey = 'Server:api:hot:lolData'
  }

  async get (options) {
    try {
      /** 从缓存中获取数据 */
      let data = !options.isNew && JSON.parse(await redis.get(this.cacheKey))
      let from = data ? 'cache' : 'server'
      if (!data) {
        /** 从服务器拉取数据 */
        let requestParams = [
          'https://apps.game.qq.com/cmc/zmMcnTargetContentList?r0=jsonp&page=1&num=16&target=24&source=web_pc',
          {
            headers: { 'User-Agent': 'Mozilla/5.0' }
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
    let match = data.match(/callback\((.*)\)/)
    let jsonObject = JSON.parse(match[1]).data.result
    jsonObject.forEach((v) => {
      dataList.push({
        title: v.sTitle,
        desc: v.sAuthor,
        pic: `https:${v.sIMG}`,
        hot: Number(v.iTotalPlay),
        url: `https://lol.qq.com/news/detail.shtml?docid=${encodeURIComponent(v.iDocID)}`,
        mobileUrl: `https://lol.qq.com/news/detail.shtml?docid=${encodeURIComponent(v.iDocID)}`
      })
    })
    return dataList
  }
}

export default new LOL()
