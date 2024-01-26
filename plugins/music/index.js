import meting from './MetingApi/index.js'
import netease from './NeteaseCloudMusicApi/index.js'
import multer from 'multer'
import md5 from 'md5'
import fs from 'node:fs'

export class NetEaseApi extends plugin {
  constructor () {
    super({
      name: 'HomePage',
      route: '/music',
      rule: [
        {
          method: 'get',
          path: '/',
          fnc: 'netEasePage'
        },
        {
          method: 'use',
          path: '/api',
          use: 'middleware',
          fnc: 'netEaseApi'
        }
      ]
    })
  }

  async init () {
    if (!NetEaseApi.moduleDefinitions) {
      NetEaseApi.moduleDefinitions = await netease.getModulesDefinitions()
      NetEaseApi.moduleDefinitions.push(await meting.create(netease))
      await netease.register_anonimous()
    }
  }

  netEasePage () {
    let cfg = Server.cfg.getConfig('page/music', false)
    this.render('music', { cfg, _cfg_base64: Buffer.from(encodeURIComponent(JSON.stringify(cfg))).toString('base64') })
  }

  async middleware () {
    let options = {
      /** 不写入磁盘 */
      storage: multer.memoryStorage(),
      limits: { fileSize: 10 * 1024 * 1024 }
    }
    /** 允许上传一个Field为`songFile`的文件 */
    let uploadFile = this.upload('', '', options).single('songFile')
    return [
      this.limiter(100, 10, {
        message: {
          code: 429,
          msg: 'Too Many Requests',
          data: null
        }
      }),
      netease.cacheMiddleware('2 minutes', (_, res) => res.statusCode === 200),
      (req, res, next) => uploadFile(req, res, (err) => {
        err ? res.status(400).send({ status: 1, message: err.message || 'Bad Request' }) : next()
      })
    ]
  }

  /**
   * 文档https://docs.neteasecloudmusicapi.binaryify.com/
   * 通过 '/music/api' + 接口地址进行访问netease接口
   * 通过 '/music/api/meting' 访问MetingAPI接口，接收server、type、id三个参数
   */
  async netEaseApi () {
    try {
      await this.init()
      let moduleDef = NetEaseApi.moduleDefinitions.find(v => this.req.path.replace(/\/$/, '').toLowerCase() == v.route)
      if (!moduleDef) return this.next()
      if (this.req.file) this.createFileObject(this.req.file)
      this.isModuleDef = true
      this.params.cookie = { ...this.cookie, ...netease.cookieToJson(this.params.cookie) }
      let moduleResponse = await moduleDef.module(this.params, (...params) => {
        let obj = [...params]
        let ip = this.req.ip
        if (ip.substr(0, 7) == '::ffff:') ip = ip.substr(7)
        obj[3] = { ...obj[3], ip }
        return netease.moduleRequest(...obj)
      })

      if (moduleResponse.handle) {
        return moduleResponse.handle(this, moduleResponse)
      }
      if (!this.params.noCookie) {
        let cookies = moduleResponse.cookie
        if (Array.isArray(cookies) && cookies.length > 0) {
          cookies = cookies.map((cookie) => {
            if (!/;$/.test(cookie.trim())) {
              cookie = cookie.trim() + ';'
            }
            cookie += ` Path=${this.route}`
            if (this.req.protocol === 'https') {
              cookie += '; SameSite=None; Secure'
            }
            return cookie
          })
          this.res.append('Set-Cookie', cookies)
        }
      }
      this.send(moduleResponse.body, moduleResponse.status)
    } catch (moduleResponse) {
      // logger.error(moduleResponse)
      if (!moduleResponse.body) {
        let code = this.isModuleDef ? 400 : 404
        let msg = this.isModuleDef ? 'Bad Request' : 'Not Found'
        this.send({
          code,
          msg,
          data: null
        }, code)
        return
      }

      if (moduleResponse.body.code == '301') moduleResponse.body.msg = '需要登录'
      if (!this.params.noCookie) this.res.append('Set-Cookie', moduleResponse.cookie)
      this.send(moduleResponse.body, moduleResponse.status)
    }
  }

  createFileObject (file) {
    let { fieldname, originalname, encoding, mimetype, size, buffer, path } = file
    this.params[fieldname] = {
      name: Buffer.from(originalname, 'latin1').toString('utf8'),
      data: buffer,
      size,
      encoding,
      tempFilePath: path || '',
      truncated: false,
      mimetype,
      md5: md5(buffer),
      mv: (filepath, callback) => fs.writeFile(filepath, buffer, callback)
    }
  }
}
