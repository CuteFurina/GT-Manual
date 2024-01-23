import fetch from 'node-fetch'
import cheerio from 'cheerio'

class DoubanNew {
  constructor () {
    /** 接口信息 */
    this.info = {
      name: 'douban_new',
      title: '豆瓣',
      subtitle: '新片榜'
    }
    /** 更新时间 */
    this.updateTime = new Date().getTime()
    /** 缓存键名 */
    this.cacheKey = 'Server:api:hot:doubanNewData'
  }

  async get (options) {
    try {
      /** 从缓存中获取数据 */
      let data = !options.isNew && JSON.parse(await redis.get(this.cacheKey))
      let from = data ? 'cache' : 'server'
      if (!data) {
        /** 从服务器拉取数据 */
        let requestParams = [
          'https://movie.douban.com/chart/',
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
    $('.article .item').map((idx, item) => {
      let id = $(item).find('a').attr('href').split('/').at(-2) ?? ''
      let score = $(item).find('.rating_nums').text() ?? ''
      return dataList.push({
        title: this.replaceTitle($(item).find('a').text(), score),
        desc: $(item).find('p').text(),
        score,
        comments: $(item).find('span.pl').text().match(/\d+/)?.[0] ?? '',
        pic: $(item).find('img').attr('src') ?? '',
        url: $(item).find('a').attr('href') ?? '',
        mobileUrl: `https://m.douban.com/movie/subject/${id}`
      })
    })
    return dataList
  }

  replaceTitle (title, score) {
    return `[★${score}] ` + title.replace(/\n/g, '').replace(/ /g, '').replace(/\//g, ' / ').trim()
  }
}

export default new DoubanNew()
