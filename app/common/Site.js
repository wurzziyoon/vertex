const logger = require('../libs/logger');
const util = require('../libs/util');
const CronJob = require('cron').CronJob;
const moment = require('moment');
const redis = require('../libs/redis');
const { JSDOM } = require('jsdom');

class Site {
  constructor (site) {
    this.ssh = null;
    this.refreshWrapper = {
      HaresClub: this._haresclub,
      CHDBits: this._chdbits,
      LemonHD: this._lemonhd,
      HDChina: this._hdchina,
      HDSky: this._hdsky,
      HDHome: this._hdhome,
      PTerClub: this._pterclub,
      Audiences: this._audiences,
      OurBits: this._ourbits,
      SpringSunDay: this._springsunday,
      MTeam: this._mteam,
      U2: this._u2,
      OpenCD: this._opencd,
      BeiTai: this._beitai,
      TCCF: this._tccf,
      TLFBits: this._tlfbits,
      PTMSG: this._ptmsg,
      HDFans: this._hdfans,
      DICMusic: this._dicmusic,
      GPW: this._gpw
    };
    this.searchWrapper = {
      HaresClub: this._searchHaresclub
    };
    this.cookie = site.cookie;
    this.site = site.name;
    this.cron = site.cron || '0 */4 * * *';
    this.refreshJob = new CronJob(this.cron, () => this.refreshInfo());
    this.refreshJob.start();
    this._init();
  };

  async _init () {
    const record = await util.getRecord('select * from sites where site = ? order by id desc limit 1', [this.site]);
    this.info = {
      username: record.username,
      uid: record.uid,
      upload: record.upload,
      download: record.download,
      seedingSize: record.seeding_size,
      seeding: record.seeding_num,
      updateTime: record.update_time,
      leeching: 0
    };
  }

  async _getDocument (url) {
    const cache = await redis.get(`vertex:document:body:${url}`);
    if (!cache) {
      const html = (await util.requestPromise({
        url: url,
        headers: {
          cookie: this.cookie
        }
      })).body;
      await redis.setWithExpire(`vertex:document:body:${url}`, html, 600);
      const dom = new JSDOM(html);
      return dom.window.document;
    } else {
      const dom = new JSDOM(cache);
      return dom.window.document;
    }
  };

  // 白兔
  async _haresclub () {
    const info = {};
    const document = await this._getDocument('https://club.hares.top/');
    // 用户名
    info.username = document.querySelector('a[href^=userdetails] b,a[href^=userdetails] em').innerHTML;
    // 上传
    info.upload = document.querySelector('i[class="fa fa-arrow-up text-success fa-fw"]').nextElementSibling.innerHTML.trim().replace(/(\w)B/, '$1iB');
    info.upload = util.calSize(...info.upload.split(' '));
    // 下载
    info.download = document.querySelector('i[class="fa fa-arrow-down layui-font-orange fa-fw"]').nextElementSibling.innerHTML.trim().replace(/(\w)B/, '$1iB');
    info.download = util.calSize(...info.download.split(' '));
    // 做种
    info.seeding = +document.querySelector('i[class="fas fa-upload text-success fa-fw"]').nextElementSibling.innerHTML.trim();
    // 下载
    info.leeching = +document.querySelector('i[class="fas fa-download layui-font-red fa-fw"]').nextElementSibling.innerHTML.trim();
    return info;
  };

  // CHDBits
  async _chdbits () {
    const info = {};
    const document = await this._getDocument('https://chdbits.co/');
    // 用户名
    info.username = document.querySelector('a[href^=userdetails] b').innerHTML;
    // 上传
    info.upload = document.querySelector('font[class=color_uploaded]').nextSibling.nodeValue.trim().replace(/(\w)B/, '$1iB');
    info.upload = util.calSize(...info.upload.split(' '));
    // 下载
    info.download = document.querySelector('font[class=color_downloaded]').nextSibling.nodeValue.trim().replace(/(\w)B/, '$1iB');
    info.download = util.calSize(...info.download.split(' '));
    // 做种
    info.seeding = +document.querySelector('img[class=arrowup]').nextSibling.nodeValue.trim();
    // 下载
    info.leeching = +document.querySelector('img[class=arrowdown]').nextSibling.nodeValue.trim();
    return info;
  };

  // HDSky
  async _hdsky () {
    const info = {};
    const document = await this._getDocument('https://hdsky.me/');
    // 用户名
    info.username = document.querySelector('a[href^=userdetails] b').innerHTML;
    // 上传
    info.upload = document.querySelector('font[class=color_uploaded]').nextSibling.nodeValue.trim().replace(/(\w)B/, '$1iB');
    info.upload = util.calSize(...info.upload.split(' '));
    // 下载
    info.download = document.querySelector('font[class=color_downloaded]').nextSibling.nodeValue.trim().replace(/(\w)B/, '$1iB');
    info.download = util.calSize(...info.download.split(' '));
    // 做种
    info.seeding = +document.querySelector('img[class=arrowup]').nextSibling.nodeValue.trim();
    // 下载
    info.leeching = +document.querySelector('img[class=arrowdown]').nextSibling.nodeValue.trim();
    return info;
  };

  // PTerClub
  async _pterclub () {
    const info = {};
    const document = await this._getDocument('https://pterclub.com/');
    // 用户名
    info.username = document.querySelector('a[href^=userdetails] b').innerHTML;
    // 彩虹 ID
    if (info.username.indexOf('</span>') !== -1) {
      info.username = info.username.match(/">.*?<\/span/g).map(item => item.replace(/">(.*?)<\/span/, '$1')).join('');
    }
    // 上传
    info.upload = document.querySelector('font[class=color_uploaded]').nextSibling.nodeValue.trim().replace(/(\w)B/, '$1iB');
    info.upload = util.calSize(...info.upload.split(' '));
    // 下载
    info.download = document.querySelector('font[class=color_downloaded]').nextSibling.nodeValue.trim().replace(/(\w)B/, '$1iB');
    info.download = util.calSize(...info.download.split(' '));
    // 做种
    info.seeding = +document.querySelector('img[class=arrowup]').nextSibling.nodeValue.trim();
    // 下载
    info.leeching = +document.querySelector('img[class=arrowdown]').nextSibling.nodeValue.trim();
    return info;
  };

  // HDHome
  async _hdhome () {
    const info = {};
    const document = await this._getDocument('https://hdhome.org/');
    // 用户名
    info.username = document.querySelector('a[href^=userdetails] b').innerHTML;
    // 上传
    info.upload = document.querySelector('font[class=color_uploaded]').nextSibling.nodeValue.trim().replace(/(\w)B/, '$1iB');
    info.upload = util.calSize(...info.upload.split(' '));
    // 下载
    info.download = document.querySelector('font[class=color_downloaded]').nextSibling.nodeValue.trim().replace(/(\w)B/, '$1iB');
    info.download = util.calSize(...info.download.split(' '));
    // 做种
    info.seeding = +document.querySelector('img[class=arrowup]').nextSibling.nodeValue.trim();
    // 下载
    info.leeching = +document.querySelector('img[class=arrowdown]').nextSibling.nodeValue.trim();
    return info;
  };

  // Audiences
  async _audiences () {
    const info = {};
    const document = await this._getDocument('https://audiences.me/');
    // 用户名
    info.username = document.querySelector('a[href^=userdetails] b').innerHTML;
    // 上传
    info.upload = document.querySelector('font[class=color_uploaded]').nextSibling.nodeValue.trim().replace(/(\w)B/, '$1iB');
    info.upload = util.calSize(...info.upload.split(' '));
    // 下载
    info.download = document.querySelector('font[class=color_downloaded]').nextSibling.nodeValue.trim().replace(/(\w)B/, '$1iB');
    info.download = util.calSize(...info.download.split(' '));
    // 做种
    info.seeding = +document.querySelector('img[class=arrowup]').nextSibling.nodeValue.trim();
    // 下载
    info.leeching = +document.querySelector('img[class=arrowdown]').nextSibling.nodeValue.trim();
    return info;
  };

  // OurBits
  async _ourbits () {
    const info = {};
    const document = await this._getDocument('https://ourbits.club/');
    // 用户名
    info.username = document.querySelector('a[href^=userdetails] b').innerHTML;
    // 上传
    info.upload = document.querySelector('font[class=color_uploaded]').nextSibling.nodeValue.trim().replace(/(\w)B/, '$1iB');
    info.upload = util.calSize(...info.upload.split(' '));
    // 下载
    info.download = document.querySelector('font[class=color_downloaded]').nextSibling.nodeValue.trim().replace(/(\w)B/, '$1iB');
    info.download = util.calSize(...info.download.split(' '));
    // 做种
    info.seeding = +document.querySelector('img[class=arrowup]').nextSibling.nodeValue.trim();
    // 下载
    info.leeching = +document.querySelector('img[class=arrowdown]').nextSibling.nodeValue.trim();
    return info;
  };

  // MTeam
  async _mteam () {
    const info = {};
    const document = await this._getDocument('https://kp.m-team.cc/');
    // 用户名
    info.username = document.querySelector('a[href^=userdetails] b').innerHTML;
    // 上传
    info.upload = document.querySelector('font[class=color_uploaded]').nextSibling.nodeValue.trim().replace(/(\w)B/, '$1iB');
    info.upload = util.calSize(...info.upload.split(' '));
    // 下载
    info.download = document.querySelector('font[class=color_downloaded]').nextSibling.nodeValue.trim().replace(/(\w)B/, '$1iB');
    info.download = util.calSize(...info.download.split(' '));
    // 做种
    info.seeding = +document.querySelector('img[class=arrowup]').nextSibling.nodeValue.trim();
    // 下载
    info.leeching = +document.querySelector('img[class=arrowdown]').nextSibling.nodeValue.trim();
    return info;
  };

  // BeiTai
  async _beitai () {
    const info = {};
    const document = await this._getDocument('https://www.beitai.pt/');
    // 用户名
    info.username = document.querySelector('a[href^=userdetails] b').innerHTML;
    // 上传
    info.upload = document.querySelector('font[class=color_uploaded]').nextSibling.nodeValue.trim().replace(/(\w)B/, '$1iB');
    info.upload = util.calSize(...info.upload.split(' '));
    // 下载
    info.download = document.querySelector('font[class=color_downloaded]').nextSibling.nodeValue.trim().replace(/(\w)B/, '$1iB');
    info.download = util.calSize(...info.download.split(' '));
    // 做种
    info.seeding = +document.querySelector('img[class=arrowup]').nextSibling.nodeValue.trim();
    // 下载
    info.leeching = +document.querySelector('img[class=arrowdown]').nextSibling.nodeValue.trim();
    return info;
  };

  // TCCF
  async _tccf () {
    const info = {};
    const document = await this._getDocument('https://et8.org/');
    // 用户名
    info.username = document.querySelector('a[href^=userdetails] b').innerHTML;
    // 上传
    info.upload = document.querySelector('font[class=color_uploaded]').nextSibling.nodeValue.trim().replace(/(\w)B/, '$1iB');
    info.upload = util.calSize(...info.upload.split(' '));
    // 下载
    info.download = document.querySelector('font[class=color_downloaded]').nextSibling.nodeValue.trim().replace(/(\w)B/, '$1iB');
    info.download = util.calSize(...info.download.split(' '));
    // 做种
    info.seeding = +document.querySelector('img[class=arrowup]').nextSibling.nodeValue.trim();
    // 下载
    info.leeching = +document.querySelector('img[class=arrowdown]').nextSibling.nodeValue.trim();
    return info;
  };

  // TLFBits
  async _tlfbits () {
    const info = {};
    const document = await this._getDocument('https://pt.eastgame.org/');
    // 用户名
    info.username = document.querySelector('a[href^=userdetails] b').innerHTML;
    // 上传
    info.upload = document.querySelector('font[class=color_uploaded]').nextSibling.nodeValue.trim().replace(/(\w)B/, '$1iB');
    info.upload = util.calSize(...info.upload.split(' '));
    // 下载
    info.download = document.querySelector('font[class=color_downloaded]').nextSibling.nodeValue.trim().replace(/(\w)B/, '$1iB');
    info.download = util.calSize(...info.download.split(' '));
    // 做种
    info.seeding = +document.querySelector('img[class=arrowup]').nextSibling.nodeValue.trim();
    // 下载
    info.leeching = +document.querySelector('img[class=arrowdown]').nextSibling.nodeValue.trim();
    return info;
  };

  // PTMSG
  async _ptmsg () {
    const info = {};
    const document = await this._getDocument('https://pt.msg.vg/');
    // 用户名
    info.username = document.querySelector('a[href^=userdetails] b').innerHTML;
    // 上传
    info.upload = document.querySelector('font[class=color_uploaded]').nextSibling.nodeValue.trim().replace(/(\w)B/, '$1iB');
    info.upload = util.calSize(...info.upload.split(' '));
    // 下载
    info.download = document.querySelector('font[class=color_downloaded]').nextSibling.nodeValue.trim().replace(/(\w)B/, '$1iB');
    info.download = util.calSize(...info.download.split(' '));
    // 做种
    info.seeding = +document.querySelector('img[class=arrowup]').nextSibling.nodeValue.trim();
    // 下载
    info.leeching = +document.querySelector('img[class=arrowdown]').nextSibling.nodeValue.trim();
    return info;
  };

  // HDFans
  async _hdfans () {
    const info = {};
    const document = await this._getDocument('https://hdfans.org/');
    // 用户名
    info.username = document.querySelector('a[href^=userdetails] b').innerHTML;
    // 上传
    info.upload = document.querySelector('font[class=color_uploaded]').nextSibling.nodeValue.trim().replace(/(\w)B/, '$1iB');
    info.upload = util.calSize(...info.upload.split(' '));
    // 下载
    info.download = document.querySelector('font[class=color_downloaded]').nextSibling.nodeValue.trim().replace(/(\w)B/, '$1iB');
    info.download = util.calSize(...info.download.split(' '));
    // 做种
    info.seeding = +document.querySelector('img[class=arrowup]').nextSibling.nodeValue.trim();
    // 下载
    info.leeching = +document.querySelector('img[class=arrowdown]').nextSibling.nodeValue.trim();
    return info;
  };

  // OpenCD
  async _opencd () {
    const info = {};
    const document = await this._getDocument('https://open.cd/');
    // 用户名
    info.username = document.querySelector('a[href^=userdetails] b').innerHTML;
    // 上传
    info.upload = document.querySelector('font[class=color_uploaded]').nextSibling.nodeValue.trim().replace(/(\w)B/, '$1iB');
    info.upload = util.calSize(...info.upload.split(' '));
    // 下载
    info.download = document.querySelectorAll('font[class=color_downloaded]')[1].nextSibling.nodeValue.trim().replace(/(\w)B/, '$1iB');
    info.download = util.calSize(...info.download.split(' '));
    // 做种
    info.seeding = +document.querySelector('img[class=arrowup]').nextSibling.nodeValue.trim();
    // 下载
    info.leeching = +document.querySelector('img[class=arrowdown]').nextSibling.nodeValue.trim();
    return info;
  };

  // U2
  async _u2 () {
    const info = {};
    const document = await this._getDocument('https://u2.dmhy.org/');
    // 用户名
    info.username = document.querySelector('a[href^=userdetails] b bdo').innerHTML;
    // 上传
    info.upload = document.querySelector('span[class=color_uploaded]').nextSibling.nodeValue.trim();
    info.upload = util.calSize(...info.upload.split(' '));
    // 下载
    info.download = document.querySelector('span[class=color_downloaded]').nextSibling.nodeValue.trim();
    info.download = util.calSize(...info.download.split(' '));
    // 做种
    info.seeding = +document.querySelector('img[class=arrowup]').nextElementSibling.innerHTML.trim();
    // 下载
    info.leeching = +document.querySelector('img[class=arrowdown]').nextSibling.nodeValue.replace(')', '');
    return info;
  };

  // SpringSunDay
  async _springsunday () {
    const info = {};
    const document = await this._getDocument('https://springsunday.net/');
    // 用户名
    info.username = document.querySelector('a[href^=userdetails] b span').innerHTML;
    // 上传
    info.upload = document.querySelector('font[class=color_uploaded]').nextSibling.nodeValue.trim().replace(/(\w)B/, '$1iB');
    info.upload = util.calSize(...info.upload.split(' '));
    // 下载
    info.download = document.querySelector('font[class=color_downloaded]').nextSibling.nodeValue.trim().replace(/(\w)B/, '$1iB');
    info.download = util.calSize(...info.download.split(' '));
    // 做种
    info.seeding = +document.querySelector('img[class=arrowup]').nextSibling.nodeValue.trim();
    // 下载
    info.leeching = +document.querySelector('img[class=arrowdown]').nextSibling.nodeValue.trim();
    return info;
  };

  // LemonHD
  async _lemonhd () {
    const info = {};
    const document = await this._getDocument('https://lemonhd.org/');
    // 用户名
    info.username = document.querySelector('a[href^=userdetails] b').innerHTML;
    // 上传
    info.upload = document.querySelectorAll('td[class="bottom nowrap"]')[6].innerHTML.trim().replace(/(\w)B/, '$1iB');
    info.upload = util.calSize(...info.upload.split(' '));
    // 下载
    info.download = document.querySelectorAll('td[class="bottom nowrap"]')[22].innerHTML.trim().replace(/(\w)B/, '$1iB');
    info.download = util.calSize(...info.download.split(' '));
    // 做种
    info.seeding = +document.querySelectorAll('td[class="bottom nowrap"]')[8].innerHTML.split('<')[0];
    // 下载
    info.leeching = +document.querySelectorAll('td[class="bottom nowrap"]')[24].innerHTML.split('<')[0];
    return info;
  };

  // HDChina
  async _hdchina () {
    const info = {};
    const document = await this._getDocument('https://hdchina.org/');
    // 用户名
    info.username = document.querySelector('a[href^=userdetails] b').innerHTML;

    // 基本信息
    const baseInfo = document.querySelectorAll('div[class="userinfo"] p')[2].innerHTML;
    // 上传
    info.upload = baseInfo.match(/\d*\.\d* \wB/g)[0].replace(/(\w)B/, '$1iB');
    info.upload = util.calSize(...info.upload.split(' '));
    // 下载
    info.download = baseInfo.match(/\d*\.\d* \wB/g)[1].replace(/(\w)B/, '$1iB');
    info.download = util.calSize(...info.download.split(' '));
    // 做种
    info.seeding = +document.querySelector('i[class="fas fa-arrow-up"]').nextSibling.nodeValue.trim();
    // 下载
    info.leeching = +document.querySelector('i[class="fas fa-arrow-down"]').nextSibling.nodeValue.trim().replace(')', '');
    return info;
  };

  // DICMusic
  async _dicmusic () {
    const info = {};
    const document = await this._getDocument('https://dicmusic.club/user.php');
    // 用户名
    info.username = document.querySelector('a[href^="user.php"]').innerHTML;
    // uid
    info.uid = document.querySelector('a[href^="torrents.php?type=seeding&userid="]').href.match(/userid=(\d+)/)[1];
    // 上传
    info.upload = document.querySelector('a[href^="torrents.php?type=seeding&userid="]').nextElementSibling.innerHTML.trim().replace(/(\w)B/, '$1iB');
    info.upload = util.calSize(...info.upload.split(' '));
    // 下载
    info.download = document.querySelector('a[href^="torrents.php?type=leeching&userid="]').nextElementSibling.innerHTML.trim().replace(/(\w)B/, '$1iB');
    info.download = util.calSize(...info.download.split(' '));

    // ajax
    const { body: stats } = await util.requestPromise({
      url: 'https://dicmusic.club/ajax.php?action=community_stats&userid=' + info.uid,
      headers: {
        cookie: this.cookie
      }
    });
    const statsJson = JSON.parse(stats);
    // 做种
    info.seeding = statsJson.response.seeding;
    // 下载
    info.leeching = statsJson.response.leeching;
    return info;
  };

  // GPW
  async _gpw () {
    const info = {};
    const document = await this._getDocument('https://greatposterwall.com/user.php');
    // 用户名
    info.username = document.querySelector('span[class=Header-profileName]').innerHTML;
    // uid
    info.uid = document.querySelector('a[href^="torrents.php?type=seeding&userid="]').href.match(/userid=(\d+)/)[1];
    // 上传
    info.upload = document.querySelector('a[href^="torrents.php?type=seeding&userid="] span').innerHTML.trim().replace(/(\w)B/, '$1iB');
    info.upload = util.calSize(...info.upload.split(' '));
    // 下载
    info.download = document.querySelector('a[href^="torrents.php?type=leeching&userid="] span').innerHTML.trim().replace(/(\w)B/, '$1iB');
    info.download = util.calSize(...info.download.split(' '));

    // ajax
    const { body: stats } = await util.requestPromise({
      url: 'https://greatposterwall.com/ajax.php?action=community_stats&userid=' + info.uid,
      headers: {
        cookie: this.cookie
      }
    });
    const statsJson = JSON.parse(stats);
    // 做种
    info.seeding = statsJson.response.seeding;
    // 下载
    info.leeching = statsJson.response.leeching;
    return info;
  };

  async refreshInfo () {
    try {
      const info = await this.refreshWrapper[this.site].call(this);
      info.updateTime = moment().startOf('hour').unix();
      logger.debug(this.site, '站点数据成功抓取,', '数据如下:\n', info);
      await util.runRecord('insert into sites (site, uid, username, upload, download, bonus, seeding_size, seeding_num, level, update_time) values (?, ? , ?, ?, ?, ?, ?, ?, ?, ?)', [this.site, info.uid || 0, info.username, info.upload, info.download, info.bonus || 0, info.seedingSize || 0, info.seeding, info.level || '', info.updateTime]);
      this.info = info;
    } catch (e) {
      logger.error(this.site, '站点数据抓取失败 (疑似是 Cookie 失效, 或遇到 5s 盾),', '报错如下:\n', e);
      throw new Error('站点数据抓取失败 (疑似是 Cookie 失效, 或遇到 5s 盾)');
    }
  };

  // search

  // HaresClub
  async _searchHaresclub (keyword) {
    const torrentList = [];
    const document = await this._getDocument(`https://club.hares.top/torrents.php?search_area=0&search=${encodeURIComponent(keyword)}&search_mode=0&incldead=0&spstate=0&check_state=0&can_claim=0&inclbookmarked=0`);
    const torrents = document.querySelectorAll('.torrents tbody tr');
    for (const _torrent of torrents) {
      const torrent = {};
      torrent.site = this.site;
      torrent.title = _torrent.querySelector('.layui-torrents-title-width a').title.trim();
      torrent.subtitle = _torrent.querySelector('.layui-torrents-descr-width').innerHTML.trim();
      torrent.category = _torrent.querySelector('a[href*="cat"] img').title;
      torrent.link = 'https://club.hares.top/' + _torrent.querySelector('.layui-torrents-title-width a').href.trim();
      torrent.seeders = +(_torrent.querySelector('a[href*=seeders] font') || _torrent.querySelector('a[href*=seeders]') || _torrent.childNodes[6]).innerHTML.trim();
      torrent.leechers = +(_torrent.querySelector('a[href*=leechers]') || _torrent.childNodes[7]).innerHTML.trim();
      torrent.snatches = +(_torrent.querySelector('a[href*=snatches] b') || _torrent.childNodes[8]).innerHTML.trim();
      torrent.size = _torrent.childNodes[5].innerHTML.trim().replace('<br>', ' ').replace(/([KMGPT])B/, '$1iB');
      torrent.time = moment(_torrent.childNodes[4].querySelector('span').title).unix();
      torrent.size = util.calSize(...torrent.size.split(' '));
      torrent.tags = [];
      const tagsDom = _torrent.querySelectorAll('span[class~=tags]');
      for (const tag of tagsDom) {
        torrent.tags.push(tag.innerHTML.trim());
      }
      torrentList.push(torrent);
    }
    return {
      site: this.site,
      torrentList
    };
  }

  async search (keyword) {
    try {
      if (!this.searchWrapper[this.site]) {
        logger.error(this.site, '暂不支持搜索功能');
        return {
          site: this.site,
          torrentList: []
        };
      }
      const result = await this.searchWrapper[this.site].call(this, keyword);
      return result;
    } catch (e) {
      logger.error(this.site, '站点数据抓取失败 (疑似是 Cookie 失效, 或遇到 5s 盾),', '报错如下:\n', e);
      return {
        site: this.site,
        torrentList: []
      };
    }
  };

  async destroy () {
    logger.info('销毁站点实例', this.site);
    this.refreshJob.stop();
    delete global.runningSite[this.site];
  };
};

module.exports = Site;
