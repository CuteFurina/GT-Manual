import { resolve } from 'node:path'

export class example extends plugin {
  constructor () {
    super({
      /** 插件名称 */
      name: 'HomePage',
      rule: [
        {
          /** 请求方法 */
          method: 'get',
          /** 请求路径 */
          path: '/hello',
          /** 执行方法 */
          fnc: 'hello'
        }
      ]
    })
  }

  /** 请求处理 */
  hello () {
    let i = Math.floor(Math.random() * 11 + 1)
    /** 随机返回一张背景图 */
    this.res.sendFile(resolve(`./public/images/background${i}.jpg`))
  }
}
