import fs from 'node:fs'
import lodash from 'lodash'

export class DailyHot extends plugin {
  constructor () {
    super({
      /** 插件名称 */
      name: 'DailyHot',
      route: '/hot',
      rule: [
        {
          method: 'get',
          path: '/',
          fnc: 'hotPage'
        },
        {
          method: ['get', 'post'],
          path: '/api/:key',
          fnc: 'hotApi'
        }
      ]
    })
    /* eslint-disable no-throw-literal */
    if (!global.redis) throw { stack: '未启用redis' }
  }

  async init () {
    if (!DailyHot.provider) {
      DailyHot.provider = {}
      let path = './plugins/hot/provider'
      let files = fs.readdirSync(path).filter(name => name.endsWith('.js') && name !== 'index.js')
      for (let file of files) {
        let module = (await import(`./provider/${file}`)).default
        if (!module.info) continue
        DailyHot.provider[module.info.name] = module
      }
    }
  }

  hotPage () {
    let cfg = Server.cfg.getConfig('page/home', false)
    this.render('hot', { cfg, _cfg_base64: Buffer.from(encodeURIComponent(JSON.stringify(cfg))).toString('base64') })
  }

  async hotApi () {
    await this.init()
    let { key } = this.params
    if (key === 'all') {
      await this.allInfo()
      return
    }
    let provider = DailyHot.provider[key]
    if (!provider) return this.next()
    let body = await provider.get(this.params)
    this.send({
      status: Number(body.code !== 200),
      message: body.message,
      data: {
        ...provider.info,
        updateTime: provider.updateTime,
        from: body.from,
        total: body.data.length || 0,
        list: body.data
      }
    }, body.code)
  }

  allInfo () {
    let data = []
    lodash.forEach(DailyHot.provider, (ds, name) => {
      data.push({
        ...ds.info,
        path: `/${name}`
      })
    })
    this.send({
      status: 0,
      message: '获取成功',
      data
    })
  }
}
