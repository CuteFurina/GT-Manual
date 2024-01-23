import lodash from 'lodash'
import { GTest } from './GTest.js'

export class MysSign extends plugin {
  constructor () {
    super({
      name: 'mysSign',
      dsc: 'mys签到',
      route: '/mysSign',
      rule: [
        {
          method: 'get',
          path: '/:key',
          fnc: 'index'
        },
        {
          method: ['get', 'post'],
          path: '/:key/:uid',
          fnc: 'bbsSign'
        },
        {
          method: 'ws',
          path: '/',
          fnc: 'connection'
        }
      ]
    })
  }

  index () {
    let copyright = GTest.cfg.Copyright
    let { key } = this.params
    let user = this.getUser(key)
    if (!user) {
      this.error('UID列表不存在或已失效')
      return
    }
    this.render('mysSign', { key, user, copyright })
  }

  async bbsSign () {
    let { connect, id, key, uid, validate } = this.params
    if (!validate && this.params['validate[geetest_validate]']) {
      validate = {
        geetest_challenge: this.params['validate[geetest_challenge]'],
        geetest_validate: this.params['validate[geetest_validate]'],
        geetest_seccode: this.params['validate[geetest_seccode]']
      }
    }
    connect = GTest.clients[connect]
    let user = connect?.[key]
    let uidData = user?.uids.find(v => v.uid == uid)
    if (!uidData) {
      this.send({ msg: '签到失败：链接已失效，请重新获取' })
      return
    }
    let data = uidData.status || await connect.self.socketSend('doSign', { id, validate, ...uidData }, `${new Date().getTime()}${uid}`)
    if (!data) {
      data = { msg: '签到失败：请求超时' }
    } else if (data.retcode == 0) {
      uidData.status = { ...data, msg: data.msg.replace('签到成功', '今天已签到') }
      logger.info(`[mysSign] 签到成功, UID: ${uid}`)
    }
    this.send(data)
  }

  connection () {
    if (GTest.cfg.REGISTER_KEY && this.request.query.key !== GTest.cfg.REGISTER_KEY) return this.close()
    this._wait = this._wait || {}
    this._key = GTest.randomKey(10, GTest.clients)
    this.onClose(() => delete GTest.clients[this._key])
    this.onMessage((data) => {
      try {
        data = JSON.parse(data)
        let { id, cmd, payload } = data
        this._wait[id] ? this._wait[id](payload) : this[cmd] && this[cmd](payload, id)
      } catch (err) {
        logger.error(err)
      }
    })
  }

  async createUser (data, id) {
    let connect = GTest.clients[this._key]
    if (!connect.self) {
      connect.self = this
    }
    let key = this.hasUser(id)
    if (!key) {
      key = GTest.randomKey(6, connect, { connect: this._key, id, uids: data })
      /** uid缓存10分钟 */
      setTimeout(() => connect && delete connect[key], 600 * 1000)
    }
    let payload = { link: `${Server.cfg.http.PUBLIC_ADDRESS}${this.route}/${key}` }
    this.socketWrite('createUser', payload, id)
  }

  hasUser (id) {
    let ret = false
    lodash.forEach(GTest.clients, (connect) => {
      lodash.forEach(connect, (user, key) => {
        if (user.id == id) {
          ret = key
          return false
        }
      })
    })
    return ret
  }

  getUser (key) {
    let ret = false
    if (key) {
      lodash.forEach(GTest.clients, (connect) => {
        if (connect[key]) {
          ret = connect[key]
          return false
        }
      })
    }
    return ret
  }

  socketWrite (cmd, payload, id) {
    if (!id || (typeof id == 'number' && String(id).length == 13)) id = new Date().getTime()
    return this.socket.send(JSON.stringify({ id, cmd, payload, key: this._key }))
  }

  socketSend (cmd, payload, id) {
    return new Promise((resolve, reject) => {
      this.socketWrite(cmd, payload, `${id}`)
      this._wait[id] = resolve
      setTimeout(() => resolve(false) && delete this._wait[id], 5 * 1000)
    })
  }
}
