import template from 'express-art-template'
import { resolve } from 'node:path'
import util from 'node:util'
import url from 'node:url'

class ApplicationHandle {
  constructor () {
    this._events = {}
    this.handlers = ['WebSocketMethod', 'setViewEngine']
  }

  Handle (app) {
    this.handlers.forEach(handler => this[handler](app))
    return this
  }

  WebSocketMethod (app) {
    app.ws = (route, ...middlewares) => {
      let path = route
      if (typeof route == 'function') {
        path = '/'
        middlewares = [route, ...middlewares]
      }
      if (middlewares.length == 1 && Array.isArray(middlewares[0])) {
        middlewares = middlewares[0]
      }
      middlewares.forEach((middleware, idx) => {
        let fn = (socket, request, next) => {
          if (request.ws) {
            /* eslint-disable n/no-deprecated-api */
            let urlObj = url.parse(request.url, true)
            request.query = urlObj.query
            request.wsHandled = true
            try {
              middleware(socket, request, next)
            } catch (err) {
              next(err)
            }
          } else {
            next()
          }
        }
        /** 不走app.handle */
        this.add(this.WebSocketUrl(path), fn, idx)
      })
      return app
    }
  }

  setViewEngine (app) {
    app.engine('html', template)
    app.set('views', resolve('public'))
    app.set('view engine', 'html')
    app.set('x-powered-by', false)
  }

  WebSocketUrl (url) {
    if (url?.includes('?')) {
      let [baseUrl, query] = url.split('?')
      return `${baseUrl.replace(/\/$/, '')}.websocket?${query}`
    }
    return `${url.replace(/\/$/, '')}.websocket`
  }

  add (event, fn, id = 0) {
    if (!event || !fn) {
      return false
    }
    this.del(event, id)
    this._events[event] = this._events[event] || []
    this._events[event].push({ fn, id })
    return true
  }

  del (event, id = 0) {
    if (!this._events[event]) {
      return false
    } else if (id == 'all') {
      delete this._events[event]
      return true
    } else {
      let idx = this._events[event].findIndex(v => v.id == id)
      if (idx) {
        this._events[event].splice(idx, 1)
        return true
      }
    }
  }

  async call (key, args, callback) {
    let ret = false
    if (!this._events[key]) {
      callback(ret)
      return ret
    }
    for (let event of this._events[key]) {
      let fn = event.fn
      let done = true
      let reject = (msg = '') => {
        if (msg) {
          logger.error(new Error(msg))
          return
        }
        done = false
      }
      ret = fn(...args, reject)
      if (util.types.isPromise(ret)) {
        ret = await ret
      }
      if (done) {
        callback(ret)
        return ret
      }
    }
    callback(ret)
    return ret
  }

  has (key) {
    return !!this._events[key]
  }
}

export default new ApplicationHandle()
