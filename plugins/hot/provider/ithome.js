import fetch from 'node-fetch'
import cheerio from 'cheerio'

class IThome {
  constructor () {
    /** 接口信息 */
    this.info = {
      name: 'ithome',
      title: 'IT之家',
      subtitle: '热榜'
    }
    /** 更新时间 */
    this.updateTime = new Date().getTime()
    /** 缓存键名 */
    this.cacheKey = 'Server:api:hot:itHomeData'
  }

  async get (options) {
    try {
      /** 从缓存中获取数据 */
      let data = !options.isNew && JSON.parse(await redis.get(this.cacheKey))
      let from = data ? 'cache' : 'server'
      if (!data) {
        /** 从服务器拉取数据 */
        let requestParams = [
          'https://m.ithome.com/rankm/',
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
    let $ = cheerio.load(data)
    $('.rank-name').each((i, elem) => {
      let type = $(elem).data('rank-type')
      let newListHtml = $(elem).next('.rank-box').html()
      return cheerio.load(newListHtml)('.placeholder').get().map((v) => {
        return dataList.push({
          title: $(v).find('.plc-title').text(),
          img: $(v).find('img').attr('data-original'),
          time: $(v).find('.post-time').text(),
          type: $(elem).text(),
          typeName: type,
          hot: Number($(v).find('.review-num').text().replace(/\D/g, '')),
          url: this.replaceLink($(v).find('a').attr('href')),
          mobileUrl: $(v).find('a').attr('href')
        })
      })
    })
    return dataList
  }

  replaceLink (url) {
    let match = url.match(/[html|live]\/(\d+)\.htm/)[1]
    return `https://www.ithome.com/0/${match.slice(0, 3)}/${match.slice(3)}.htm`
  }
}

export default new IThome()
