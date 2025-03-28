module.exports = (query, request) => {
  return new Promise(async (resolve) => {
    const url = `https://music.163.com/login?codekey=${query.key}`
    return resolve({
      code: 200,
      status: 200,
      body: {
        code: 200,
        data: {
          qrurl: url,
          qrimg: query.qrimg ? Server.cfg.http.PUBLIC_ADDRESS + `/qrcode?text=${url}` : '',
        },
      },
    })
  })
}
