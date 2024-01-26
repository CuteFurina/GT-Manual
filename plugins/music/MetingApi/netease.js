export default class Netease {
  constructor ({ netEaseApi }) {
    this.netEaseApi = netEaseApi
  }

  get (type, id) {
    let ret
    switch (type) {
      case 'lrc':
        ret = this.getLyric(id)
        break
      case 'url':
        ret = this.getSongUrl(id)
        break
      case 'song':
        ret = this.getSongInfo(id)
        break
      case 'album':
        ret = this.getAlbum(id)
        break
      case 'playlist':
        ret = this.getPlaylist(id)
        break
      case 'artist':
        ret = this.getArtists(id)
        break
      case 'search':
        ret = this.getSearch(id)
        break
    }
    return ret
  }

  async getLyric (id) {
    let { body } = await this.netEaseApi.lyric({ id })
    return {
      lyric: body.lrc?.lyric || '',
      tlyric: body.tlyric?.lyric || ''
    }
  }

  async getSongUrl (id) {
    let { body } = await this.netEaseApi.song_url_v1({ id, level: 'standard' })
    let url = body.data?.[0]?.url?.replace('http://', 'https://')
    return url || `https://music.163.com/song/media/outer/url?id=${id}.mp3`
  }

  async getSongInfo (ids) {
    let { body } = await this.netEaseApi.song_detail({ ids })
    return this.songListMap(body)
  }

  async getArtists (id) {
    let { body } = await this.netEaseApi.artist_top_song({ id })
    return this.songListMap(body)
  }

  async getAlbum (id) {
    let { body } = await this.netEaseApi.album({ id })
    return this.songListMap(body)
  }

  async getPlaylist (id) {
    let { body } = await this.netEaseApi.playlist_detail({ id })
    let trackIds = body.playlist.trackIds.slice(0, 50)
    let ids = trackIds.map(v => v.id).join(',')
    let res = await this.netEaseApi.song_detail({ ids })
    return this.songListMap(res.body)
  }

  async getSearch (keywords) {
    let { body } = await this.netEaseApi.cloudsearch({ keywords, limit: 50 })
    return this.songListMap(body.result)
  }

  songListMap (list) {
    return list.songs.map(song => ({
      title: song.name,
      author: song.ar.reduce((i, v) => ((i ? i + ' / ' : i) + v.name), ''),
      pic: song.al.picUrl || list.album?.picUrl || list.album?.blurPicUrl || 'https://s4.music.126.net/style/web2/img/default/default_album.jpg',
      url: song.id,
      lrc: song.id,
      songmid: song.id
    }))
  }
}
