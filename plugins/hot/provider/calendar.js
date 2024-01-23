import fetch from 'node-fetch'
import moment from 'moment'

class Calendar {
  constructor () {
    /** 接口信息 */
    this.info = { name: 'calendar', title: '历史上的今天' }
    /** 更新时间 */
    this.updateTime = new Date().getTime()
    /** 缓存键名 */
    this.cacheKey = 'Server:api:hot:calendarData'
  }

  async get (options) {
    try {
      /** 日期格式 0131 */
      let date = options.date || moment().format('MMDD')
      /** 从缓存中获取数据 */
      let data = !options.isNew && JSON.parse(await redis.get(`${this.cacheKey}:${date.slice(0, 2)}`))
      let from = data ? 'cache' : 'server'
      if (!data) {
        /** 从服务器拉取数据 */
        let requestParams = [`https://baike.baidu.com/cms/home/eventsOnHistory/${date.slice(0, 2)}.json`]
        let res = await (await fetch(...requestParams)).json()
        data = this.ranListMap(res[date.slice(0, 2)][date])
        this.updateTime = new Date().getTime()
        /** 将数据写入缓存 */
        redis.set(`${this.cacheKey}:${date.slice(0, 2)}`, JSON.stringify(data), { EX: 1800 })
      }
      this.info.subtitle = moment(date, 'MMDD').format('MM月DD日')
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
      year: v.year,
      title: v.title.replace(/<[^>]+>/g, ''),
      desc: v.desc.replace(/<[^>]+>/g, ''),
      pic: v?.pic_share || v?.pic_index,
      avatar: v?.pic_calendar,
      type: v.type,
      url: v.link,
      mobileUrl: v.link
    }))
  }
}

export default new Calendar()
