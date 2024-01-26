import Tencent from './tencent.js'
import Netease from './netease.js'
import lyricFormat from './Format.js'

class MetingAPI {
  create (netEaseApi) {
    this.netEaseApi = netEaseApi
    this.Providers = {
      tencent: new Tencent(this),
      netease: new Netease(this)
    }
    this.error = {
      status: 400,
      message: '参数不合法',
      body: {
        status: 1,
        message: '参数不合法'
      }
    }

    return {
      identifier: 'meting',
      route: '/meting',
      module: ({ server, type, id, cookie }) => {
        if (!(server && type && id && this.Providers[server])) throw this.error
        return this.getData(server, type, id, cookie)
      }
    }
  }

  async getData (server, type, id, cookie) {
    let provider = this.Providers[server]
    let body = await provider.get(type, id, cookie)
    if (!body) throw this.error
    return { body, type, server, handle: this.handle }
  }

  handle ({ req, res, error }, { type, body, server }) {
    if (type == 'lrc') {
      res.send(lyricFormat(body.lyric, body.tlyric || ''))
    } else if (['pic', 'url'].includes(type)) {
      res.redirect(body)
    } else {
      res.send(body.map(x => {
        for (let i of ['url', 'pic', 'lrc']) {
          let _ = String(x[i])
          if (!_.startsWith('http') && _.length > 0) {
            x[i] = `${Server.cfg.http.PUBLIC_ADDRESS}/music/api/meting?server=${server}&type=${i}&id=${_}`
          }
        }
        return x
      }))
    }
  }
}

export default new MetingAPI()
