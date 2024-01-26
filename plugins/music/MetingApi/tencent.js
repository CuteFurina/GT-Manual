import fetch from 'node-fetch'
import qs from 'node:querystring'
import url from 'node:url'

export default class TencentMusic {
  get (type, id) {
    let ret
    switch (type) {
      case 'lrc':
        ret = this.getLyric(id)
        break
      case 'pic':
        ret = this.getPic(id)
        break
      case 'url':
        ret = this.getSongUrl(id)
        break
      case 'song':
        ret = this.getSongInfo(id)
        break
      case 'playlist':
        ret = this.getPlaylist(id)
        break
      case 'search':
        ret = this.getSearch(id)
        break
    }
    return ret
  }

  async getLyric (id) {
    let data = {
      songmid: id,
      pcachetime: new Date().getTime(),
      g_tk: 5381,
      loginUin: 0,
      hostUin: 0,
      inCharset: 'utf8',
      outCharset: 'utf-8',
      notice: 0,
      platform: 'yqq',
      needNewCode: 0,
      format: 'json'
    }

    const url = this.changeUrlQuery(data, 'http://c.y.qq.com/lyric/fcgi-bin/fcg_query_lyric_new.fcg')
    let result = await (await fetch(url, { headers: { Referer: 'https://y.qq.com' } })).json()

    return {
      lyric: decodeURIComponent(escape(atob(result.lyric || ''))),
      tlyric: decodeURIComponent(escape(atob(result.trans || '')))
    }
  }

  async getSongUrl (id) {
    id = id.split(',')
    let guid = (Math.random() * 10000000).toFixed(0)
    let purl = ''
    let data = {
      req_0: {
        module: 'vkey.GetVkeyServer',
        method: 'CgiGetVkey',
        param: {
          guid,
          songmid: id,
          songtype: [0],
          uin: '',
          loginflag: 1,
          platform: '20'
        }
      },
      comm: {
        uin: '',
        format: 'json',
        ct: 19,
        cv: 0,
        authst: ''
      }
    }

    let params = {
      '-': 'getplaysongvkey',
      g_tk: 5381,
      loginUin: '',
      hostUin: 0,
      format: 'json',
      inCharset: 'utf8',
      outCharset: 'utf-8¬ice=0',
      platform: 'yqq.json',
      needNewCode: 0,
      data: JSON.stringify(data)
    }

    let url = this.changeUrlQuery(params, 'https://u.y.qq.com/cgi-bin/musicu.fcg')
    let result = await (await fetch(url)).json()

    if (result.req_0?.data?.midurlinfo) {
      purl = result.req_0.data.midurlinfo[0].purl
    }

    let domain = result.req_0.data.sip.find(i => !i.startsWith('http://ws')) || result.req_0.data.sip[0]
    return `${domain}${purl}`.replace('http://', 'https://')
  }

  async getSongInfo (id) {
    let data = {
      data: JSON.stringify({
        songinfo: {
          method: 'get_song_detail_yqq',
          module: 'music.pf_song_detail_svr',
          param: { song_mid: id }
        }
      })
    }

    let url = this.changeUrlQuery(data, 'http://u.y.qq.com/cgi-bin/musicu.fcg')
    let result = await (await fetch(url)).json()
    result = result.songinfo.data

    let songInfo = {
      author: result.track_info.singer.reduce((i, v) => ((i ? i + ' / ' : i) + v.name), ''),
      title: result.track_info.name,
      pic: `https://y.gtimg.cn/music/photo_new/T002R300x300M000${result.track_info.album.mid}.jpg`,
      url: id,
      lrc: id,
      songmid: id
    }
    return [songInfo]
  }

  async getPic (id) {
    let info = await this.getSongInfo(id)
    return info[0].pic
  }

  async getPlaylist (id) {
    let data = {
      type: 1,
      utf8: 1,
      disstid: id,
      loginUin: 0,
      format: 'json'
    }

    let url = this.changeUrlQuery(data, 'http://c.y.qq.com/qzone/fcg-bin/fcg_ucc_getcdinfo_byids_cp.fcg')
    let result = await (await fetch(url, { headers: { Referer: 'https://y.qq.com/n/yqq/playlist' } })).json()
    result = result.cdlist[0].songlist

    let res = await Promise.all(result.map(async song => {
      let songInfo = {
        author: song.singer.reduce((i, v) => ((i ? i + ' / ' : i) + v.name), ''),
        title: song.songname,
        pic: `https://y.gtimg.cn/music/photo_new/T002R300x300M000${song.albummid}.jpg`,
        url: song.songmid,
        lrc: song.songmid,
        songmid: song.songmid
      }
      return songInfo
    }))

    return res.slice(0, 50)
  }

  async getSearch (keyword) {
    let searchid = (Math.random() * 10000000).toFixed(0)
    let data = {
      req_0: {
        module: 'music.search.SearchCgiService',
        method: 'DoSearchForQQMusicDesktop',
        param: {
          searchid,
          remoteplace: 'txt.mqq.all',
          search_type: 0,
          query: keyword,
          page_num: 1,
          num_per_page: 50
        }
      },
      comm: {
        uin: '',
        format: 'json',
        ct: 23,
        cv: 0,
        authst: ''
      }
    }

    let params = {
      '-': 'getplaysongvkey',
      g_tk: 5381,
      loginUin: '',
      hostUin: 0,
      format: 'json',
      inCharset: 'utf8',
      outCharset: 'utf-8¬ice=0',
      platform: 'yqq.json',
      needNewCode: 0,
      data: JSON.stringify(data)
    }

    let url = this.changeUrlQuery(params, 'https://u.y.qq.com/cgi-bin/musicu.fcg')
    let result = await (await fetch(url)).json()
    result = result.req_0.data.body
    return result.song.list.map(song => {
      let songInfo = {
        author: song.singer.reduce((i, v) => ((i ? i + ' / ' : i) + v.name), ''),
        title: song.title,
        pic: `https://y.gtimg.cn/music/photo_new/T002R300x300M000${song.album.mid}.jpg`,
        url: song.mid,
        lrc: song.mid,
        songmid: song.mid
      }
      return songInfo
    })
  }

  changeUrlQuery (obj, baseUrl) {
    /* eslint-disable n/no-deprecated-api */
    let query = url.parse(baseUrl, true).query
    baseUrl = baseUrl.split('?')[0]
    return `${baseUrl}?${qs.stringify({ ...query, ...obj })}`
  }
}
