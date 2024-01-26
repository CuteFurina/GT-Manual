module.exports = {
  toBoolean(val) {
    if (typeof val === 'boolean') return val
    if (val === '') return val
    return val === 'true' || val == '1'
  },
  cookieToJson(cookie) {
    if (!cookie) return {}
    let cookieArr = cookie.split(';')
    let obj = {}
    cookieArr.forEach((i) => {
      let arr = i.split('=')
      if (!arr[1]) return
      obj[arr[0].trim()] = arr[1].trim()
    })
    return obj
  },
  getRandom(num) {
    var random = Math.floor(
      (Math.random() + Math.floor(Math.random() * 9 + 1)) *
        Math.pow(10, num - 1),
    )
    return random
  },
}
