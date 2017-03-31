// web share
/** native share:
    UC、QQ浏览器、手机百度
**/
/*
1. 安卓UC没法调用Native分享到qq空间 
*/
var UA = navigator.appVersion
var libloaded = false
// 是否是IOS系统
var isIOS = /iphone/.test(UA)
var util = {
    // 得到分享的url
    replaceAPI: function (api) {
        api = api.replace('{url}', CONFIG.url)
        api = api.replace('{title}', CONFIG.title)
        api = api.replace('{content}', CONFIG.content)
        api = api.replace('{pic}', CONFIG.pic)
        return api
    },
    loadJs: function (src, fun) {
        var head = document.getElementsByTagName('head')[0] || document.head || document.documentElement
        var script = document.createElement('script')
        script.setAttribute('type', 'text/javascript')
        script.setAttribute('charset', 'UTF-8')
        script.setAttribute('src', src)
        if (typeof fun === 'function') {
            if (window.attachEvent) {
                script.onreadystatechange = function () {
                    var r = script.readyState
                    if (r === 'loaded' || r === 'complete') {
                        script.onreadystatechange = null
                        fun()
                    }
                }
            } else {
                script.onload = fun
            }
        }

        head.appendChild(script)
    },
    loadQQapi: function (fn) {
        var src = (UA.browserVersion < 5.4) ? 'http://3gimg.qq.com/html5/js/qb.js' : 'http://jsapi.qq.com/get?api=app.share'
        this.loadJs(src, fn)
    },
    loadBDapi: function (fn) {
        this.loadJs('//s.bdstatic.com/common/openjs/aio.js?v=' + new Date().getTime(), fn)
    },
    shareByWeb: function (target) {
        var openUrl = this.replaceAPI(shareURL[target]) // 弹出窗口的url
        var iWidth = 630 // 弹出窗口的宽度;
        var iHeight = 580 // 弹出窗口的高度;
        var iTop = (window.screen.availHeight - 30 - iHeight) / 2 // 获得窗口的垂直位置;
        var iLeft = (window.screen.availWidth - 10 - iWidth) / 2 // 获得窗口的水平位置;
        window.open(openUrl, '', 'height=' + iHeight + ', width=' + iWidth + ', top=' + iTop + ', left=' + iLeft + '' + ',toolbar=no, menubar=no, scrollbars=no, resizable=no, location=no, status=no')
    },
    ucShareTo: function (target) {
        if(isIOS) {
            window.ucbrowser.web_share(CONFIG.title, CONFIG.pic, CONFIG.url, shareMediaMap[target][1], '', '', '')
        } else if(target === 'qzone') {
            // android uc to qzone hack
            this.shareByWeb(target)
        } else {
            window.ucweb.startRequest('shell.page_share', [CONFIG.title, CONFIG.pic, CONFIG.url, shareMediaMap[target][0], '', '', ''])
        }
    },
    qqbweShareTo: function (target) {
        var cf = {
            url: CONFIG.url,
            // 微信、QQ好友、QQ空间的分享头部
            title: CONFIG.title,
            // 为了简化，这里不设置分享摘要
            description: CONFIG.content,
            img_url: CONFIG.pic,
            // 1: 微信好友, 2: 腾讯微博, 3: QQ空间, 4: QQ好友, 5: 生成二维码, 8: 微信朋友圈, 10: 复制网址, 11: 分享到微博, 13: 创意分享
            to_app: shareMediaMap[target][2],
            // 微博的分享头部
            cus_txt: CONFIG.title
        }
        if(!libloaded) {
            this.loadQQapi(function () {
                if (typeof(window.browser.app) !== 'undefined') {
                    window.browser.app.share(cf)
                } else if (typeof(window.qb) !== 'undefined') {
                    window.qb.share(cf)
                }
            })
        } else {
            if (typeof(window.browser.app) !== 'undefined') {
                window.browser.app.share(cf)
            } else if (typeof(window.qb) !== 'undefined') {
                window.qb.share(cf)
            }
        }
    },
    baiduShareTo: function (target) {
        var Box = window.Box
        var cfg = {
            mediaType: shareMediaMap[target][3],
            linkUrl: CONFIG.url,
            // 微信、QQ好友、QQ空间的分享头部
            title: CONFIG.title,
            iconUrl: CONFIG.pic,
            // 微信、QQ好友、QQ空间的分享摘要
            // 微博的分享内容
            content: CONFIG.content
        }
        if(!libloaded) {
            this.loadBDapi(function () {
                if (Box.os.android) {
                    Box.android.invokeApp(
                        'Bdbox_android_utils',
                        'callShare',
                        [JSON.stringify(cfg), window.successFnName || 'console.log', window.errorFnName || 'console.log']
                    )
                }
                else {
                    Box.ios.invokeApp('callShare', {
                        options: encodeURIComponent(JSON.stringify(cfg)),
                        errorcallback: 'onFail',
                        successcallback: 'onSuccess'
                    })
                }
            })
        } else {
            if (Box.os.android) {
                Box.android.invokeApp(
                    'Bdbox_android_utils',
                    'callShare',
                    [JSON.stringify(cfg), window.successFnName || 'console.log', window.errorFnName || 'console.log']
                )
            }
            else {
                Box.ios.invokeApp('callShare', {
                    options: encodeURIComponent(JSON.stringify(cfg)),
                    errorcallback: 'onFail',
                    successcallback: 'onSuccess'
                })
            }
        }
    }
}
// 是否为QQ浏览器
var isqqbrowser = /MQQBrowser/.test(UA)
// 提前下载js
if (isqqbrowser) {
    util.loadQQapi(function (){
        libloaded = true
    })
}
// 是否为UC浏览器
var isucbrowser = /UCBrowser/.test(UA)

// 是否为手机百度
var isbaidubox = /baiduboxapp/.test(UA)
// 提前下载js
if (isbaidubox) {
    util.loadBDapi(function (){
        libloaded = true
    })
}
// 配置信息
var CONFIG = {}
// web 分享地址
var shareURL = {
    qzone : 'http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?url={url}&title={title}&pics={pic}&summary={content}',
    weibo : 'http://v.t.sina.com.cn/share/share.php?url={url}&title={title}&content=utf-8&pic={pic}&searchPic=false$appkey=3874358783',
    tqq : 'http://share.v.t.qq.com/index.php?c=share&a=index&url={url}&title={title}&appkey=801cf76d3cfc44ada52ec13114e84a96',
    douban : 'http://www.douban.com/share/service?href={url}&name={title}&text={content}&image={pic}'
}
// 分享媒体在各个浏览器所对应的名字，依次为安卓UC浏览器，苹果UC浏览器，QQ浏览器，手机百度
var shareMediaMap = {
    weibo: ['SinaWeibo', 'kSinaWeibo', 11, 'sinaweibo'],
    weixin: ['WechatFriends', 'kWeixin', 1, 'weixin_friend'],
    weixinF: ['WechatTimeline', 'kWeixinFriend', 8, 'weixin_timeline'],
    qq: ['QQ', 'kQQ', 4, 'qqfriend'],
    qzone: ['QZone', 'kQZone', 3, 'qqdenglu'],
    all: ['', '', undefined, 'all']
}

var Share = function (options) {
    // 默认参数
    var metaDesc = document.getElementsByName('description')[0]
    var firstImg = document.getElementsByTagName('img')[0]
    var defaults = {
        url: window.location.href,
        title: document.title,
        content: metaDesc && metaDesc.conent || '',
        pic: firstImg && firstImg.src || ''
    }

    // 合并options
    for(var k in defaults) {
        if(options[k] === undefined) {
            options[k] = defaults[k]
        }
    }
    CONFIG = options
}

Share.prototype.share = function (target) {
    if(isucbrowser) {
        util.ucShareTo(target)
    } else if(isbaidubox) {
        util.baiduShareTo(target)
    } else if(isqqbrowser) {
        util.qqbweShareTo(target)
    } else if(shareURL[target]) {
        util.shareByWeb(target)
    }
}



if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = Share
} else {
    window.Share = Share
}
