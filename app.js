import lodash from 'lodash'
import express from 'express'

/** 您的域名或IP地址 */
const Host = 'localhost'
/** 端口 */
const Port = 3000

let tmp = {}
let isRegister = {}
let result = {}

class example {
  constructor () {
    this.load(express())
    console.log(`Successfully started, port: \x1b[32m${Port}\x1b[0m`)
    console.log('\x1b[32m%s\x1b[0m', `POST: http://${Host}:${Port}/GTest/register`)
  }

  load (app) {
    app.listen(Port)
    app.use(express.static(process.cwd()))
    app.use(express.urlencoded({ extended: false }))
    app.use(express.json())
    app.get('/GTest/:key', this.index)
    app.post('/GTest/register', this.register)
    app.get('/GTest/register/:key', this.get_register)
    app.post('/GTest/validate/:key', this.validate)
    app.get('/GTest/validate/:key', this.get_validate)
    app.use(this.invalid)
    app.use(this.error)
  }

  index (req, res, next) {
    let { key } = req.params
    if (!key || !isRegister[key]) return next('验证信息不存在或已失效。')
    res.send(`<!DOCTYPE html>
<html>
  <head>
    <title>GTest</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no">
    <link rel="stylesheet" href="/style.css">
  </head>
  <body>
    <h1></h1><br>
    <div id="captcha" key="${key}">
      <button id="btn"><span>点击验证</span></button>
      <div id="wait" class="show">
        <div class="progress"></div>
      </div>
    </div>
    <footer id="footer">
      <p class="copyright">Copyright Miao-Yunzai</p>
    </footer>
    <script src="/jquery.min.js"></script>
    <script src="/gt.js"></script>
    <script src="/script.js"></script>
  </body>
</html>`)
  }

  /** 验证信息, post传mys接口res.data */
  register (req, res, next) {
    let key, { gt, challenge } = req.body || {}
    if (!gt || !challenge) return next('0')
    for (let i = 0; i < 10; i++) {
      key = lodash.sampleSize('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 6).join('')
      if (isRegister[key] || result[key]) continue
      break
    }
    tmp[key] = req.body
    isRegister[key] = 1
    /** 未点击2分钟后删除 */
    setTimeout(() => delete tmp[key] && delete isRegister[key], 120000)
    example.send(res, {
      link: `http://${Host}:${Port}/GTest/${key}`,
      result: `http://${Host}:${Port}/GTest/validate/${key}`
    })
  }

  /** 浏览器获取gt参数 */
  get_register (req, res, next) {
    let { key } = req.params
    if (!key || !tmp[key]) return next('该验证信息已被使用，若非本人操作请重新获取')
    res.send(tmp[key] || {})
    delete tmp[key]
  }

  /** 浏览器返回validate */
  validate (req, res, next) {
    let { key } = req.params
    if (!key || !req.body) return next('0')
    result[key] = req.body
    setTimeout(() => delete result[key], 30000)
    example.send(res, {})
    delete isRegister[key]
    console.log('[GeeTest] 验证成功, key:', key)
  }

  /** 获取验证结果validate */
  get_validate (req, res, next) {
    let { key } = req.params
    if (!key) return next('0')
    example.send(res, result[key] || null)
  }

  static send (res, data, message = 'OK') {
    res.send({
      status: Number(!data),
      message,
      data
    })
  }

  invalid (req, res) {
    if (!res.finished) res.status(404).end()
  }

  error (err, req, res, next) {
    let message = err?.message || (err && err !== '0' && `${err}`) || 'Invalid request'
    if (!res.finished) res.send({ status: 1, message })
  }
}

process.on('unhandledRejection', (error, promise) => console.log(error))
new example()