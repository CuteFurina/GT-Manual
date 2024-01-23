import lodash from 'lodash'

export class GTest extends plugin {
  constructor () {
    super({
      name: 'GTest',
      dsc: '手动过码',
      route: '/GTest',
      rule: [
        {
          method: 'get',
          path: '/:key',
          fnc: 'index'
        },
        {
          method: 'get',
          path: '/validate/:key',
          fnc: 'result'
        },
        {
          method: 'get',
          path: '/register/:key',
          fnc: 'get_register'
        },
        {
          method: 'post',
          path: '/register',
          fnc: 'register'
        },
        {
          method: 'post',
          path: '/validate/:key',
          fnc: 'validate'
        }
      ]
    })
  }

  index () {
    let copyright = GTest.cfg.Copyright
    let { key } = this.params
    if (!key || !GTest.users[key]) return this.error('验证信息不存在或已失效。')
    this.render('GTest', { key, copyright })
  }

  register () {
    let { gt, challenge, key } = this.params
    if (GTest.cfg.REGISTER_KEY && key !== GTest.cfg.REGISTER_KEY) return this._send(null, 'please enter the correct key')
    if (!(gt && challenge)) return this.error()
    key = GTest.randomKey(6, GTest.users, { register: this.params })
    setTimeout(() => delete GTest.users[key], 150000)
    this._send({
      link: `${Server.cfg.http.PUBLIC_ADDRESS}${this.route}/${key}`,
      result: `${Server.cfg.http.PUBLIC_ADDRESS}${this.route}/validate/${key}`
    })
  }

  async result () {
    let { key } = this.params
    if (!key) return this.error()
    let data = null
    if (GTest.users[key]) {
      for (let i = 0; i < 240; i++) {
        let result = GTest.users[key]?.result
        if (result) {
          data = result
          break
        }
        await this.sleep(500)
      }
      if (!data) data = {}
      delete GTest.users[key]
    }
    this._send(data)
  }

  /** 浏览器返回Validate */
  validate () {
    let { key } = this.params
    if (!key || !GTest.users[key]) return this.error()
    GTest.users[key].result = this.body
    setTimeout(() => delete GTest.users[key], 30000)
    this._send({})
    logger.info(`[GTest] 验证成功, KEY: ${key}`)
  }

  /** 浏览器获取gt参数 */
  get_register () {
    let { key } = this.params
    if (!key || !GTest.users[key]) return this.error()
    let info = GTest.users[key].register
    if (!info) return this._send(null, '该验证信息已被使用，若非本人操作请重新获取')
    this.send(info)
    delete GTest.users[key].register
  }

  _send (data, message = 'OK') {
    return this.send({
      status: Number(!data),
      message,
      data
    })
  }

  static get cfg () {
    if (!this.users) this.users = {}
    if (!this.clients) this.clients = {}
    return Server.cfg.getConfig('page/GTest', false)
  }

  static randomKey (length, checkObj, data) {
    let letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
    let key = lodash.sampleSize(letters, length).join('')
    while (checkObj[key]) {
      key = lodash.sampleSize(letters, length).join('')
    }
    checkObj[key] = data || {}
    return key
  }
}
