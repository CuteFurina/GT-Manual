import fetch from 'node-fetch'

class Tieba {
  constructor () {
    /** 接口信息 */
    this.info = {
      name: 'tieba',
      title: '百度贴吧',
      subtitle: '热议榜'
    }
    /** 更新时间 */
    this.updateTime = new Date().getTime()
    /** 缓存键名 */
    this.cacheKey = 'Server:api:hot:tiebaData'
  }

  async get (options) {
    try {
      /** 从缓存中获取数据 */
      let data = !options.isNew && JSON.parse(await redis.get(this.cacheKey))
      let from = data ? 'cache' : 'server'
      if (!data) {
        /** 从服务器拉取数据 */
        let requestParams = [
          'https://tieba.baidu.com/hottopic/browse/topicList',
          {
            headers: { 'User-Agent': 'Mozilla/5.0' }
          }
        ]
        let res = await (await fetch(...requestParams)).json()
        data = this.ranListMap(res.data.bang_topic.topic_list)
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
      id: v.topic_id,
      title: v.topic_name,
      desc: v.topic_desc,
      pic: v.topic_pic,
      hot: v.discuss_num,
      url: v.topic_url,
      mobileUrl: v.topic_url
    }))
  }
}

export default new Tieba()
