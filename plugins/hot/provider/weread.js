import fetch from 'node-fetch'
import crypto from 'node:crypto'

class Weread {
  constructor () {
    /** 接口信息 */
    this.info = {
      name: 'weread',
      title: '微信读书',
      subtitle: '飙升榜'
    }
    /** 更新时间 */
    this.updateTime = new Date().getTime()
    /** 缓存键名 */
    this.cacheKey = 'Server:api:hot:wereadData'
  }

  async get (options) {
    try {
      /** 从缓存中获取数据 */
      let data = !options.isNew && JSON.parse(await redis.get(this.cacheKey))
      let from = data ? 'cache' : 'server'
      if (!data) {
        /** 从服务器拉取数据 */
        let requestParams = [
          'https://weread.qq.com/web/bookListInCategory/rising?rank=1',
          {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36 Edg/114.0.1823.67' }
          }
        ]
        let res = await (await fetch(...requestParams)).json()
        data = this.ranListMap(res.books)
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
      id: v.bookInfo.bookId,
      title: v.bookInfo.title,
      desc: v.bookInfo.intro,
      pic: v.bookInfo.cover.replace('s_', 't9_'),
      hot: v.readingCount,
      author: v.bookInfo.author,
      url: `https://weread.qq.com/web/bookDetail/${this.getWereadID(v.bookInfo.bookId)}`,
      mobileUrl: `https://weread.qq.com/web/bookDetail/${this.getWereadID(v.bookInfo.bookId)}`
    }))
  }

  getWereadID (bookId) {
    let hash = crypto.createHash('md5')
    hash.update(bookId)
    let str = hash.digest('hex')
    let strSub = str.substring(0, 3)
    let fa
    if (/^\d*$/.test(bookId)) {
      let chunks = []
      for (let i = 0; i < bookId.length; i += 9) {
        let chunk = bookId.substring(i, i + 9)
        chunks.push(parseInt(chunk).toString(16))
      }
      fa = ['3', chunks]
    } else {
      let hexStr = ''
      for (let i = 0; i < bookId.length; i++) {
        hexStr += bookId.charCodeAt(i).toString(16)
      }
      fa = ['4', [hexStr]]
    }
    strSub += fa[0]
    strSub += '2' + str.substring(str.length - 2)
    for (let i = 0; i < fa[1].length; i++) {
      let sub = fa[1][i]
      let subLength = sub.length.toString(16)
      let subLengthPadded = subLength.length === 1 ? '0' + subLength : subLength
      strSub += subLengthPadded + sub
      if (i < fa[1].length - 1) {
        strSub += 'g'
      }
    }
    if (strSub.length < 20) {
      strSub += str.substring(0, 20 - strSub.length)
    }
    let finalHash = crypto.createHash('md5')
    finalHash.update(strSub)
    let finalStr = finalHash.digest('hex')
    strSub += finalStr.substring(0, 3)
    return strSub
  }
}

export default new Weread()
