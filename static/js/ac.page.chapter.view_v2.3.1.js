document.domain = "localhost";
var cssCore = function(testCss) {
    switch (true) {
    case testCss.webkitTransition === "":
        return "webkit";
        break;
    case testCss.MozTransition === "":
        return "Moz";
        break;
    case testCss.msTransition === "":
        return "ms";
        break;
    case testCss.OTransition === "":
        return "O";
        break;
    default:
        return ""
    }
}(document.createElement("ComicView").style)
  , translate = function(core) {
    if (core !== "")
        return function(o, x, y) {
            o[cssCore + "Transform"] = "translate(" + x + "px," + y + "px) translateZ(0)"
        }
        ;
    else
        return function(o, x, y) {
            o.left = x + "px";
            o.top = y + "px"
        }
}(cssCore)
  , animationFrame =
function() {
    var lastTime = 0
      , i = 0
      , vendors = ["webkit", "moz", "ms"]
      , len = vendors.length;
    for (; i < len && !window.requestAnimationFrame; ++i) {
        window.requestAnimationFrame = window[vendors[i] + "RequestAnimationFrame"];
        window.cancelAnimationFrame = window[vendors[i] + "CancelAnimationFrame"] || window[vendors[i] + "CancelRequestAnimationFrame"]
    }
    if (!window.requestAnimationFrame || !cancelAnimationFrame) {
        window.requestAnimationFrame = function(callback, element) {
            var currTime = +new Date
              , timeToCall = Math.max(0, 16.7 - currTime + lastTime)
              , id =
            window.setTimeout(function() {
                callback(currTime + timeToCall)
            }, timeToCall);
            lastTime = currTime + timeToCall;
            return id
        }
        ;
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id)
        }
    }
}()
  , ajax = {
    _createXMLHttpRequest: function(oldVersion, newVersion) {
        return function() {
            if (oldVersion)
                return new ActiveXObject("Microsoft.XMLHTTP");
            else if (newVersion)
                return new XMLHttpRequest
        }
    }(window.ActiveXObject, window.XMLHttpRequest),
    get: function(settings) {
        var xhr = this._createXMLHttpRequest()
          , data = settings.data || ""
          , async = settings.async ||
        true;
        xhr.open("GET", settings.url, async);
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4 && xhr.status === 200)
                settings.callback(xhr.responseText)
        }
        ;
        xhr.send(data)
    },
    post: function(settings) {
        var xhr = this._createXMLHttpRequest()
          , data = settings.data || "";
        if (data)
            data = data.replace(/\+/g, "%2B");
        xhr.open("POST", settings.url);
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4 && xhr.status === 200)
                if (typeof settings.callback === "function")
                    if (settings.argu)
                        settings.callback(xhr.responseText, settings.argu);
                    else
                        settings.callback(xhr.responseText)
        }
        ;
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        xhr.send(data)
    }
}
  , addClass = function(o, cls) {
    if (!o)
        return;
    var oN = o.className;
    if (oN.indexOf(cls) === -1)
        o.className = oN + " " + cls
}
  , removeClass = function(o, cls) {
    if (!o)
        return;
    var oN = o.className, arrName, arrNow;
    if (oN.indexOf(cls) === -1)
        return;
    arrName = oN.split(" ");
    arrNow = arrName.length;
    while (arrNow--)
        if (arrName[arrNow] === cls)
            arrName.splice(arrNow, 1);
    o.className = arrName.join(" ")
}
  , $$ = function(s) {
    return document.getElementById(s)
}
  ,
onHover = function(o, overfn, outfn) {
    if (!o)
        return;
    o.onmouseover = function(e) {
        overfn(e)
    }
    ;
    o.onmouseout = function(e) {
        outfn(e)
    }
}
  , docEle = document.documentElement
  , on = function() {
    if (window.addEventListener)
        return function(o, e, f) {
            if (!o)
                return;
            o.addEventListener(e, f, false)
        }
        ;
    else if (window.attachEvent)
        return function(o, e, f) {
            if (!o)
                return;
            o.attachEvent("on" + e, f)
        }
        ;
    else {
        if (!o)
            return;
        o["on" + e] = f
    }
}()
  , off = function() {
    if (window.removeEventListener)
        return function(o, e, f) {
            if (!o)
                return;
            o.removeEventListener(e, f, false)
        }
        ;
    else if (window.detachEvent)
        return function(o,
        e, f) {
            if (!o)
                return;
            o.detachEvent("on" + e, f)
        }
        ;
    else {
        if (!o)
            return;
        o["on" + e] = null
    }
}()
  , Fade = function(t) {
    var setOpacity;
    if (t.opacity === "")
        setOpacity = function(o, value) {
            o.opacity = value
        }
        ;
    else
        setOpacity = function(o, value) {
            o.filter = "alpha(opacity=" + 100 * value + ")"
        }
        ;
    return function(o, from, to, time) {
        if (!o)
            return;
        var os = o.style
          , timeStamp = +new Date
          , end = timeStamp + time
          , opacityDiff = to - from
          , _fade = function() {
            var diff = new Date - timeStamp
              , percent = ~~(diff / time * 100) / 100
              , opacityNow = from + opacityDiff * percent;
            if (opacityNow > 1)
                opacityNow =
                1;
            else if (opacityNow < 0)
                opacityNow = 0;
            if (percent >= 1) {
                setOpacity(os, to);
                return 0
            }
            setOpacity(os, opacityNow);
            return 1
        }
          , _requestFade = function() {
            requestAnimationFrame(function() {
                if (_fade())
                    _requestFade()
            })
        }
        ;
        setOpacity(os, from);
        _requestFade()
    }
}(document.createElement("ComicView").style)
  , osWidth = docEle.clientWidth || window.innerWidth
  , osHeight = docEle.clientHeight || window.innerHeight
  , isIE = function(ua) {
    return ua.indexOf("MSIE") !== -1
}(navigator.userAgent)
  , isMac = function(ua) {
    return ua.indexOf("Mac OS") !== -1
}(navigator.userAgent)
  ,
isLocalStorageNameSupported = function() {
    try {
        var local = "localStorage" in window && window["localStorage"];
        local.setItem("__AC__", "1");
        local.removeItem("__AC__");
        return local ? true : false
    } catch (e) {
        return false
    }
}()
  , mobileDevice = function(ua) {
    return ua.indexOf("iPad") !== -1 || ua.indexOf("iPhone") !== -1 || ua.indexOf("Android") !== -1
}(navigator.userAgent)
  , mouse = {
    down: mobileDevice ? "touchstart" : "mousedown",
    move: mobileDevice ? "touchmove" : "mousemove",
    up: mobileDevice ? "touchend" : "mouseup",
    click: mobileDevice ? "touchend" : "click"
}
  ,
makeArray = function(obj) {
    return Array.prototype.slice.call(obj, 0)
}
  , mainView = $$("mainView")
  , body = document.body || document.getElementsByTagName("body")[0]
  , checkScrollChange = function() {
    return cssCore && mainView && !isIE
}()
  , getScrollTop = function(f) {
    if (!f) {
        mainView.style.height = "auto";
        return function() {
            return docEle.scrollTop || window.pageYOffset || document.body.scrollTop
        }
    } else {
        window.scrollTo = function(x, y) {
            mainView.scrollTop = y
        }
        ;
        return function() {
            return mainView.scrollTop
        }
    }
}(checkScrollChange);
try {
    Array.prototype.slice.call(docEle.childNodes, 0)[0].nodeType
} catch (e) {
    makeArray = function(obj) {
        var res = []
          , len = obj.length
          , i = 0;
        for (; i < len; ++i)
            res.push(obj[i]);
        return res
    }
}
if (cssCore !== "") {
    transToX = function(o, x, t, fn, n) {
        var s = o.style
          , c = "translate(" + x + "px, 0) translateZ(0)";
        s[cssCore + "TransitionDuration"] = t + "ms";
        s[cssCore + "Transform"] = c;
        if (fn && n === nowPage)
            switch (cssCore) {
            case "webkit":
                o.addEventListener("webkitTransitionEnd", fn, false);
                break;
            case "Moz":
                o.addEventListener("transitionend", fn, false);
                break;
            case "ms":
                o.addEventListener("MSTransitionEnd", fn, false);
                break;
            default:
                setTimeout(fn, t);
                break
            }
    }
    ;
    transToY = function(o, y, t) {
        var s = o.style
          , c = "translate(0," + y + "px) translateZ(0)";
        s[cssCore + "TransitionDuration"] = t + "ms";
        s[cssCore + "Transform"] = c
    }
} else {
    transToX = function(o, x, t, fn, n) {
        return;
        var cs = o.currentStyle, s = o.style, cx = parseInt(s.left || cs.left || 0, 10), dx = x - cx, ft = +new Date, end = ft + t, pos = 0, diff, _trans = function() {
            if (+new Date > end) {
                s.left = x + "px";
                return 0
            } else {
                diff = end - new Date;
                pos = 1 - diff / t;
                s.left = cx + dx * pos + "px";
                return 1
            }
        }
        , _requestTrans = function() {
            requestAnimationFrame(function() {
                if (_trans())
                    _requestTrans()
            })
        }
        ;
        _requestTrans();
        if (fn && n === nowPage)
            setTimeout(fn, t + 500)
    }
    ;
    transToY = function(o,
    y, t) {
        if (o.currentStyle.top === "auto")
            o.style.top = "0px";
        var cs = o.currentStyle, s = o.style, cy = parseInt(s.top || cs.top || 0, 10), dy = y - cy, ft = +new Date, end = ft + t, pos = 0, diff, _trans = function() {
            if (+new Date > end) {
                s.top = y + "px";
                return 0
            } else {
                diff = end - new Date;
                pos = diff / t;
                s.top = cy + dy * (1 - pos * pos) + "px"
            }
            return 1
        }
        , _requestTrans = function() {
            requestAnimationFrame(function() {
                if (_trans())
                    _requestTrans()
            })
        }
        ;
        _requestTrans()
    }
}
var sendPgv = function(pgvName) {
    try {
        // pgvSendClick({
        //     statIframe: true,
        //     hottag: encodeURIComponent(pgvName)
        // })
    } catch (e) {
        console.log(e)
    }
}
  , hotPgv = function(id, pgvName) {
    var o = $$(id);
    on(o, mouse.down, function() {
        sendPgv(pgvName)
    })
}
;
if (mobileDevice)
    addClass(body, "mobile-device");
!function() {
    var viewTheme = cookie("theme")
      , themeControl = $$("themeControl")
      , themeChild = themeControl.children
      , uav = $$("userAvatar")
      , assignSysAvatar = function(theme) {
        if (theme === "dark") {
            if (USER === undefined)
                uav.src = "http://ac.gtimg.com/media/images/ac_chapter_avatar.jpg"
        } else if (USER === undefined)
            uav.src = "http://ac.gtimg.com/media/images/ac_chapter_avatar_white.jpg"
    }
      , changeTheme = function(newTheme) {
        var oldTheme = viewTheme;
        viewTheme = newTheme;
        cookie("theme", newTheme, {
            path: "/",
            expires: 30
        });
        removeClass(body, "theme-" +
        oldTheme);
        addClass(body, "theme-" + newTheme);
        if (newTheme === "white") {
            themeChild[1].innerHTML = "\u5173\u706f";
            assignSysAvatar("white")
        } else {
            themeChild[1].innerHTML = "\u5f00\u706f";
            assignSysAvatar("dark")
        }
        sendPgv("AC.VIEW.NEWEVENT." + newTheme.toUpperCase())
    }
    ;
    if (!viewTheme) {
        viewTheme = Math.random() >= 0.5 ? "white" : "dark";
        cookie("theme", viewTheme, {
            path: "/",
            expires: 30
        })
    }
    setTimeout(function() {
        sendPgv("AC.VIEW.NEWEVENT." + viewTheme.toUpperCase())
    }, 3E3);
    if (viewTheme === "white") {
        removeClass(body, "theme-dark");
        addClass(body,
        "theme-white");
        themeChild[1].innerHTML = "\u5173\u706f"
    }
    assignSysAvatar(viewTheme);
    on(themeControl, mouse.click, function() {
        if (viewTheme === "white")
            changeTheme("dark");
        else
            changeTheme("white")
    })
}();
var crossPage = +cookie("crossPage")
  , cp = $$("crossPage")
  , roastBarShrink = $$("roastBarShrink")
  , roastBarWrap = $$("roastBarWrap");
if (crossPage) {
    addClass(document.body, "cross-page");
    addClass(document.body, "roast-right");
    on(cp, mouse.click, function() {
        cookie("crossPage", "0", {
            expires: 10,
            path: "/"
        });
        window.location.reload()
    });
    cp.children[1].innerHTML = "\u5207\u6362\u81f3\u5355\u9875\u9605\u8bfb"
} else
    on(cp, mouse.click, function() {
        cookie("crossPage", "1", {
            expires: 10,
            path: "/"
        });
        window.location.reload()
    });
!function() {
    function a(a) {
        return a.replace(t, "").replace(u, ",").replace(v, "").replace(w, "").replace(x, "").split(y)
    }
    function b(a) {
        return "'" + a.replace(/('|\\)/g, "\\$1").replace(/\r/g, "\\r").replace(/\n/g, "\\n") + "'"
    }
    function c(c, d) {
        function e(a) {
            return m += a.split(/\n/).length - 1,
            k && (a = a.replace(/\s+/g, " ").replace(/<\!--[\w\W]*?--\>/g, "")),
            a && (a = s[1] + b(a) + s[2] + "\n"),
            a
        }
        function f(b) {
            var c = m;
            if (j ? b = j(b, d) : g && (b = b.replace(/\n/g, function() {
                return m++,
                "$line=" + m + ";"
            })),
            0 === b.indexOf("=")) {
                var e = l && !/^=[=#]/.test(b);
                if (b = b.replace(/^=[=#]?|[\s;]*$/g, ""),
                e) {
                    var f = b.replace(/\s*\([^\)]+\)/, "");
                    n[f] || /^(include|print)$/.test(f) || (b = "$escape(" + b + ")")
                } else
                    b = "$string(" + b + ")";
                b = s[1] + b + s[2]
            }
            return g && (b = "$line=" + c + ";" + b),
            r(a(b), function(a) {
                if (a && !p[a]) {
                    var b;
                    b = "print" === a ? u : "include" === a ? v : n[a] ? "$utils." + a : o[a] ? "$helpers." + a : "$data." + a,
                    w += a + "=" + b + ",",
                    p[a] = !0
                }
            }),
            b + "\n"
        }
        var g = d.debug
          , h = d.openTag
          , i = d.closeTag
          , j = d.parser
          , k = d.compress
          , l = d.escape
          , m = 1
          , p = {
            $data: 1,
            $filename: 1,
            $utils: 1,
            $helpers: 1,
            $out: 1,
            $line: 1
        }
          , q = "".trim
          , s =
        q ? ["$out='';", "$out+=", ";", "$out"] : ["$out=[];", "$out.push(", ");", "$out.join('')"]
          , t = q ? "$out+=text;return $out;" : "$out.push(text);"
          , u = "function(){var text=''.concat.apply('',arguments);" + t + "}"
          , v = "function(filename,data){data=data||$data;var text=$utils.$include(filename,data,$filename);" + t + "}"
          , w = "'use strict';var $utils=this,$helpers=$utils.$helpers," + (g ? "$line=0," : "")
          , x = s[0]
          , y = "return new String(" + s[3] + ");";
        r(c.split(h), function(a) {
            a = a.split(i);
            var b = a[0]
              , c = a[1];
            1 === a.length ? x += e(b) : (x += f(b),
            c && (x +=
            e(c)))
        });
        var z = w + x + y;
        g && (z = "try{" + z + "}catch(e){throw {filename:$filename,name:'Render Error',message:e.message,line:$line,source:" + b(c) + ".split(/\\n/)[$line-1].replace(/^\\s+/,'')};}");
        try {
            var A = new Function("$data","$filename",z);
            return A.prototype = n,
            A
        } catch (B) {
            throw B.temp = "function anonymous($data,$filename) {" + z + "}",
            B;
        }
    }
    var d = function(a, b) {
        return "string" == typeof b ? q(b, {
            filename: a
        }) : g(a, b)
    }
    ;
    d.version = "3.0.0",
    d.config = function(a, b) {
        e[a] = b
    }
    ;
    var e = d.defaults = {
        openTag: "<%",
        closeTag: "%>",
        escape: !0,
        cache: !0,
        compress: !1,
        parser: null
    }
      , f = d.cache = {};
    d.render = function(a, b) {
        return q(a, b)
    }
    ;
    var g = d.renderFile = function(a, b) {
        var c = d.get(a) || p({
            filename: a,
            name: "Render Error",
            message: "Template not found"
        });
        return b ? c(b) : c
    }
    ;
    d.get = function(a) {
        var b;
        if (f[a])
            b = f[a];
        else if ("object" == typeof document) {
            var c = document.getElementById(a);
            if (c) {
                var d = (c.value || c.innerHTML).replace(/^\s*|\s*$/g, "");
                b = q(d, {
                    filename: a
                })
            }
        }
        return b
    }
    ;
    var h = function(a, b) {
        return "string" != typeof a && (b = typeof a,
        "number" === b ? a += "" : a = "function" ===
        b ? h(a.call(a)) : ""),
        a
    }
      , i = {
        "<": "&#60;",
        ">": "&#62;",
        '"': "&#34;",
        "'": "&#39;",
        "&": "&#38;"
    }
      , j = function(a) {
        return i[a]
    }
      , k = function(a) {
        return h(a).replace(/&(?![\w#]+;)|[<>"']/g, j)
    }
      , l = Array.isArray || function(a) {
        return "[object Array]" === {}.toString.call(a)
    }
      , m = function(a, b) {
        var c, d;
        if (l(a))
            for (c = 0,
            d = a.length; d > c; c++)
                b.call(a, a[c], c, a);
        else
            for (c in a)
                b.call(a, a[c], c)
    }
      , n = d.utils = {
        $helpers: {},
        $include: g,
        $string: h,
        $escape: k,
        $each: m
    };
    d.helper = function(a, b) {
        o[a] = b
    }
    ;
    var o = d.helpers = n.$helpers;
    d.onerror = function(a) {
        var b =
        "Template Error\n\n";
        for (var c in a)
            b += "<" + c + ">\n" + a[c] + "\n\n";
        "object" == typeof console && console.error(b)
    }
    ;
    var p = function(a) {
        return d.onerror(a),
        function() {
            return "{Template Error}"
        }
    }
      , q = d.compile = function(a, b) {
        function d(c) {
            try {
                return new i(c,h) + ""
            } catch (d) {
                return b.debug ? p(d)() : (b.debug = !0,
                q(a, b)(c))
            }
        }
        b = b || {};
        for (var g in e)
            void 0 === b[g] && (b[g] = e[g]);
        var h = b.filename;
        try {
            var i = c(a, b)
        } catch (j) {
            return j.filename = h || "anonymous",
            j.name = "Syntax Error",
            p(j)
        }
        return d.prototype = i.prototype,
        d.toString = function() {
            return i.toString()
        }
        ,
        h && b.cache && (f[h] = d),
        d
    }
      , r = n.$each
      , s = "break,case,catch,continue,debugger,default,delete,do,else,false,finally,for,function,if,in,instanceof,new,null,return,switch,this,throw,true,try,typeof,var,void,while,with,abstract,boolean,byte,char,class,const,double,enum,export,extends,final,float,goto,implements,import,int,interface,long,native,package,private,protected,public,short,static,super,synchronized,throws,transient,volatile,arguments,let,yield,undefined"
      , t = /\/\*[\w\W]*?\*\/|\/\/[^\n]*\n|\/\/[^\n]*$|"(?:[^"\\]|\\[\w\W])*"|'(?:[^'\\]|\\[\w\W])*'|\s*\.\s*[$\w\.]+/g
      ,
    u = /[^\w$]+/g
      , v = new RegExp(["\\b" + s.replace(/,/g, "\\b|\\b") + "\\b"].join("|"),"g")
      , w = /^\d[^,]*|,\d[^,]*/g
      , x = /^,+|,+$/g
      , y = /^$|,+/;
    e.openTag = "{{",
    e.closeTag = "}}";
    var z = function(a, b) {
        var c = b.split(":")
          , d = c.shift()
          , e = c.join(":") || "";
        return e && (e = ", " + e),
        "$helpers." + d + "(" + a + e + ")"
    }
    ;
    e.parser = function(a) {
        a = a.replace(/^\s/, "");
        var b = a.split(" ")
          , c = b.shift()
          , e = b.join(" ");
        switch (c) {
        case "if":
            a = "if (" + e + "){";
            break;
        case "else":
            b = "if" === b.shift() ? " if (" + b.join(" ") + ")" : "",
            a = "}else" + b + "{";
            break;
        case "/if":
            a = "}";
            break;
        case "each":
            var f = b[0] || "$data"
              , g = b[1] || "as"
              , h = b[2] || "$value"
              , i = b[3] || "$index"
              , j = h + "," + i;
            "as" !== g && (f = "[]"),
            a = "$each(" + f + ",function(" + j + "){";
            break;
        case "/each":
            a = "});";
            break;
        case "echo":
            a = "print(" + e + ");";
            break;
        case "print":
        case "include":
            a = c + "(" + b.join(",") + ");";
            break;
        default:
            if (/^\s*\|\s*[\w\$]/.test(e)) {
                var k = !0;
                0 === a.indexOf("#") && (a = a.substr(1),
                k = !1);
                for (var l = 0, m = a.split("|"), n = m.length, o = m[l++]; n > l; l++)
                    o = z(o, m[l]);
                a = (k ? "=" : "=#") + o
            } else
                a = d.helpers[c] ? "=#" + c + "(" + b.join(",") + ");" : "=" + a
        }
        return a
    }
    ,
    "function" == typeof define ? define(function() {
        return d
    }) : "undefined" != typeof exports ? module.exports = d : this.template = d
}();
function ScrollBar(options) {
    var c = options.contain, w = options.wrap, sb = options.scrollBg, sk = options.scrollBlock, fd = options.factHeightDiff || 0, fh = options.scrollBarHeightDiff || 0, fx = options.heightFix || 0, H = c.offsetHeight, cs = c.style, bs = sk.style, ws = w.style, gs = sb.style, isValidDrag = false, start = {}, delta = {}, nowTop = 0, max, h, S, s, _top;
    cs.position = "absolute";
    if (isMac)
        c.style[cssCore + "Transition"] = "none";
    function pull() {
        if (mobileDevice)
            return;
        if (_top < 0 || !_top)
            _top = 0;
        else if (_top > max)
            _top = max;
        try {
            bs.top = _top + "px";
            translate(cs,
            0, _top / max * (h - H) >> 0)
        } catch (e) {}
    }
    sk.onmousedown = function(e) {
        isValidDrag = true;
        body.onmousemove = goScroll;
        if (body.setCapture)
            body.setCapture();
        else if (window.captureEvents)
            window.captureEvents(Event.MOUSEMOVE | Event.MOUSEUP);
        addClass(sb, "scroll-scrolling");
        removeClass(c, "moved");
        e = e || window.event;
        start = {
            X: e.clientX,
            Y: e.clientY,
            time: +new Date
        };
        delta = {}
    }
    ;
    sb.onmousedown = function(e) {
        e = e || window.event;
        if ((e.target || e.srcElement) === sk)
            return;
        _top = e.offsetY < nowTop ? nowTop - s * 0.7 >> 0 : nowTop + s * 0.7 >> 0;
        pull();
        nowTop =
        _top
    }
    ;
    return {
        init: function(width, height) {
            H = c.offsetHeight || H;
            h = fx ? fx : height - fd;
            h = H - 1 < h ? H : h;
            S = h - fh;
            s = h / H * S;
            s = s > S ? S + 1 : s;
            ws.width = c.offsetWidth + "px";
            ws.height = h + "px";
            try {
                gs.height = S + "px";
                bs.height = s + "px"
            } catch (e) {}
            if (H === h)
                gs.display = "none";
            else
                gs.display = "block";
            max = ~~(S - s + 1);
            setTimeout(function() {
                pull()
            }, 0)
        },
        set: function(p) {
            _top = (S - s) * p;
            pull();
            nowTop = _top
        },
        reStart: function() {
            isValidDrag = false;
            removeClass(sb, "scroll-scrolling");
            addClass(c, "moved");
            if (!delta.Y)
                return;
            nowTop = _top
        },
        isValid: function() {
            return isValidDrag
        },
        nowTop: function() {
            return nowTop
        },
        runScroll: function(e) {
            _t = this;
            delta = {
                X: e.clientX - start.X,
                Y: e.clientY - start.Y
            };
            _top = nowTop + delta.Y;
            pull()
        },
        wheelMove: function(dir) {
            _top = nowTop + ~~(s * 0.1) * dir;
            pull();
            nowTop = _top
        }
    }
}
var scaleRate = 1, _isbottom = false, goScroll = function(e) {
    e = e || window.event;
    if (e.preventDefault)
        e.preventDefault();
    else
        e.returnValue = false;
    switch (true) {
    case !crossPage && scrollRecommand.isValid():
        scrollRecommand.runScroll(e);
        break;
    case crossPage && scrollToolPage.isValid():
        scrollToolPage.runScroll(e);
        break;
    case scrollCatalogue.isValid():
        scrollCatalogue.runScroll(e);
        break;
    case scrollBookshelf && scrollBookshelf.isValid():
        scrollBookshelf.runScroll(e);
        break
    }
}
, wheelScroll = function(e) {
    var isFromScroll = false, direct,
    nowScale, thisScroll, o;
    e = e || window.event;
    o = e.target || e.srcElement;
    if (!o)
        return;
    while (o && o.tagName && o.tagName.toUpperCase() !== "BODY") {
        thisScroll = o.getAttribute("data-scroll");
        if (thisScroll) {
            isFromScroll = true;
            break
        } else
            o = o.parentNode
    }
    direct = -e.wheelDelta || e.detail * 40;
    direct = direct / 110;
    if (!crossPage && e.ctrlKey) {
        if (e.preventDefault)
            e.preventDefault();
        else
            e.returnValue = false;
        nowScale = -0.0050 * direct * (isMac ? 0.5 : 1) + scaleRate;
        if (nowScale > 0.6 && nowScale < 1.7) {
            promptRun("\u56fe\u7247\u5c3a\u5bf8:" + ~~(nowScale *
            100) + "%");
            scaleRate = nowScale
        }
        if (isLocalStorageNameSupported)
            window.localStorage.setItem(ID + "scale", scaleRate);
        return goScalePic()
    } else if (!crossPage)
        if (window._isbottom && direct > 0 && o.tagName.toLowerCase() === "body")
            if (NEXT_CHAPTER)
                window.location.href = makeUrl(ID, NEXT_CHAPTER, 1);
            else
                noMore();
    if (isFromScroll) {
        if (e.preventDefault)
            e.preventDefault();
        else
            e.returnValue = false;
        if (thisScroll === "roast-bar")
            window.changeRoastByBar(direct < 0 ? -1 : 1);
        else
            (new Function("return " + thisScroll))().wheelMove(direct * (isMac ?
            0.3 : 1))
    } else if (crossPage) {
        if (!e.ctrlKey)
            goPage(nowPage + ((IS_JAPAN ? -direct : direct) < 0 ? -1 : 1))
    } else
        keyScroll(e, direct * 1.1 * (isMac ? 0.5 : 1))
}
, scrollCatalogue = ScrollBar({
    contain: catalogueList,
    wrap: catalogueListWrap,
    scrollBg: catalogueScrollBg,
    scrollBlock: catalogueScrollBlock,
    factHeightDiff: 190,
    scrollBarHeightDiff: 0
}), scrollBookshelf, scrollToolPage, _t, _thisStep;
try {
    scrollRecommand = ScrollBar({
        contain: recommendList,
        wrap: recommendListWrap,
        scrollBg: recommendScrollBg,
        scrollBlock: recommendScrollBlock,
        factHeightDiff: 100,
        scrollBarHeightDiff: 20
    })
} catch (e) {}
document.onmouseup = function() {
    document.onmousemove = function() {}
    ;
    if (body.releaseCapture)
        body.releaseCapture();
    else if (window.releaseEvents)
        window.releaseEvents(Event.MOUSEMOVE | Event.MOUSEUP);
    if (_t)
        _t.reStart()
}
;
document.onselectstart = function() {
    return false
}
;
catalogueContain.onselectstart = function() {
    return false
}
;
var pageChangePrompt, autoFullpage;
if (!crossPage) {
    var endDiff = 0
      , scrollInterval = null
      , smoothScroll = function(from, to, t) {
        endDiff = endDiff + to;
        var timeStamp = +new Date
          , nowDiff = endDiff
          , _smoothScroll = function() {
            var now = +new Date;
            per = 1 - (now - timeStamp) / t;
            per = 1 - per * per;
            if (per >= 0.98 || per < 0) {
                window.scrollTo(0, from + nowDiff);
                endDiff = 0;
                clearInterval(scrollInterval)
            } else {
                window.scrollTo(0, from + ~~(nowDiff * per));
                endDiff = ~~(nowDiff * (1 - per))
            }
        }
        ;
        clearInterval(scrollInterval);
        scrollInterval = setInterval(_smoothScroll, 20)
    }
      , keyScroll = function(e, n) {
        var scrollTop =
        getScrollTop();
        if (e.preventDefault)
            e.preventDefault();
        else
            e.returnValue = false;
        window.scrollTo(0, scrollTop + 50 * n)
    }
    ;
    document.onkeydown = function(e) {
        e = e || window.event;
        var code = e.keyCode
          , moveLongRange = function(dir) {
            var scrollTop = getScrollTop();
            if (e.preventDefault)
                e.preventDefault();
            else
                e.returnValue = false;
            smoothScroll(scrollTop, osHeight * 0.5 * dir, 300)
        }
        ;
        if (onRoast && roastHandle) {
            if (code === 27)
                roastHandle(-1);
            else if (code === 13)
                roastHandle(1);
            return
        }
        if (code === 37) {
            sendPgv("AC.VIEW.NEWEVENT.KEYB_PREV");
            if (PREV_CHAPTER)
                window.location.href =
                makeUrl(ID, PREV_CHAPTER);
            else
                noPrev()
        } else if (code === 39) {
            sendPgv("AC.VIEW.NEWEVENT.KEYB_NEXT");
            if (NEXT_CHAPTER)
                window.location.href = makeUrl(ID, NEXT_CHAPTER, 1);
            else
                noMore()
        } else if (code === 122)
            sendPgv("AC.VIEW.NEWEVENT.KEYB_F11");
        else if (code === 38)
            keyScroll(e, -1);
        else if (code === 40)
            keyScroll(e, +1);
        else if (code === 33)
            moveLongRange(-1);
        else if (code === 34)
            moveLongRange(+1);
        else if (code === 48 && e.ctrlKey) {
            promptRun("\u56fe\u7247\u5c3a\u5bf8:100%");
            if (isLocalStorageNameSupported) {
                scaleRate = 1;
                window.localStorage.setItem(ID +
                "scale", 1)
            }
            return goScalePic()
        }
    }
} else
    document.onkeydown = function(e) {
        e = e || window.event;
        var code = e.keyCode;
        if (onRoast) {
            if (code === 27)
                roastHandle(-1);
            return
        }
        if (code === 37) {
            sendPgv(IS_JAPAN ? "AC.VIEW.NEWEVENT.DUIYE.KEYB_PAGENEXT" : "AC.VIEW.NEWEVENT.DUIYE.KEYB_PAGEPREV");
            goPage(nowPage - 1)
        } else if (code === 39) {
            sendPgv(IS_JAPAN ? "AC.VIEW.NEWEVENT.DUIYE.KEYB_PAGEPREV" : "AC.VIEW.NEWEVENT.DUIYE.KEYB_PAGENEXT");
            goPage(nowPage + 1)
        } else if (code === 122)
            sendPgv("AC.VIEW.NEWEVENT.KEYB_F11");
        else if (code === 38) {
            sendPgv("AC.VIEW.NEWEVENT.DUIYE.KEYB_PREV");
            if (PREV_CHAPTER)
                window.location.href = makeUrl(ID, PREV_CHAPTER);
            else
                noPrev()
        } else if (code === 40) {
            sendPgv("AC.VIEW.NEWEVENT.DUIYE.KEYB_NEXT");
            if (NEXT_CHAPTER)
                window.location.href = makeUrl(ID, NEXT_CHAPTER, 1);
            else
                noMore()
        } else if (code === 13 && pageChangePrompt)
            if (IS_JAPAN)
                localTo(nowPage === 0 ? 1 : -1);
            else
                localTo(nowPage === 0 ? -1 : 1)
    }
    ;
if (window.addEventListener)
    document.addEventListener("DOMMouseScroll", wheelScroll, false);
window.onmousewheel = document.onmousewheel = wheelScroll;
window.recommendHasSet = false;
!function() {
    var fullscreenChange = $$("fullscreenChange");
    if (!checkScrollChange)
        return on(fullscreenChange, mouse.click, function() {
            promptRun("\u6d4f\u89c8\u5668\u4e0d\u652f\u6301 \u8bf7\u6309F11\u8fdb\u5165\u5168\u5c4f\u6a21\u5f0f")
        });
    var _cssCore = cssCore.toLowerCase()
      , checkScreen = function() {
        mainView.style.height = osHeight - 120 + "px"
    }
    ;
    on(fullscreenChange, mouse.click, function() {
        var requestFullScreen = _cssCore === "ms" ? "msRequestFullscreen" : _cssCore + "RequestFullScreen"
          , cancelFullScreen = _cssCore === "ms" ? "msExitFullscreen" :
        _cssCore + "CancelFullScreen";
        if (document[_cssCore + "FullScreen"] || document[_cssCore + "IsFullScreen"] || document["msFullscreenElement"])
            document[cancelFullScreen]();
        else
            body[requestFullScreen]()
    });
    on(document, _cssCore + "fullscreenchange", checkScreen)
}();
var goPageEnable = false;
window.isTipPrompting = false;
!function() {
    var comicContain = $$("comicContain")
      , comicContainCross = $$("comicContainCross")
      , roastBarShrink = $$("roastBarShrink")
      , roastStopElem = null
      , roastStopItem = null
      , plusOneWrap = $$("plusOneWrap")
      , roastStopState = body.className.indexOf("roast-dm") === -1 ? 1 : 2
      , roastPlusOne = function(e0, clientX, clientY) {
        var i = document.createElement("i")
          , doc = docEle;
        i.appendChild(document.createTextNode("+1"));
        if (e0.pageX == null  && clientX !== null ) {
            e0.pageX = clientX + (doc && doc.scrollLeft || body && body.scrollLeft || 0) - (doc && doc.clientLeft ||
            body && body.clientLeft || 0);
            e0.pageY = clientY + (doc && doc.scrollTop || body && body.scrollTop || 0) - (doc && doc.clientTop || body && body.clientTop || 0)
        }
        anchor = {
            x: e0.pageX - 9,
            y: e0.pageY - 14
        };
        i.style.cssText = "top:" + anchor.y + "px; left:" + ~~anchor.x + "px;";
        plusOneWrap.appendChild(i);
        setTimeout(function() {
            transToY(i, -40 + (cssCore !== "" ? 0 : clientY || e0.pageY), 500);
            Fade(i, 1, 0, 500);
            setTimeout(function() {
                plusOneWrap.removeChild(i)
            }, 300)
        }, 50)
    }
      , roastClickHandl = function(e) {
        var roastStopState = body.className.indexOf("roast-dm") === -1 ? 1 :
        2;
        if (roastStopState !== 1 && roastStopState !== 2)
            return;
        e = e0 = e || window.event;
        e = e.target || e.srcElement;
        var parent = e.parentNode
          , gParent = parent.parentNode
          , roastSeqString = ""
          , roastDataItem = null
          , roastStopState = body.className.indexOf("roast-dm") === -1 ? 1 : 2
          , promptTop = $$("promptTop")
          , roastGoodPrompt = function() {
            if (window.isTipPrompting)
                return;
            window.isTipPrompting = true;
            promptTop.style.display = "block";
            promptTop.className = "prompt-top prompt-good";
            Fade(promptTop, 0, 1, 200);
            setTimeout(function() {
                promptTop.style.display =
                "none";
                window.isTipPrompting = false
            }, 2E3)
        }
          , roastGood = function(tar, e0, type) {
            sendPgv("AC.VIEW.NEWDM.DIANZAN_TUCAO");
            if (!USER)
                return toLogin();
            if (type === 1) {
                roastSeqString = tar.getAttribute("data-roast-seq");
                if (tar.getAttribute("data-roast-hide") && tar.getAttribute("data-roast-hide") === "1")
                    return;
                roastDataItem = getRoastData(roastSeqString)
            }
            if (type === 1 && roastDataItem.hasGood || type === 2 && tar.getAttribute("data-good"))
                roastGoodPrompt();
            else {
                var roastId = tar.getAttribute("data-roast-id")
                  , goodObj = tar.getElementsByTagName("i")[0]
                  ,
                clientX = e0.pageX ? null  : e0.clientX
                  , clientY = e0.pageY ? null  : e0.clientY;
                if (type === 1)
                    roastDataItem.hasGood = 1;
                else if (type === 2)
                    tar.setAttribute("data-good", 1);
                ajax.get({
                    url: "http://ac.qq.com/ComicView/updateRoastGoodorBad/?comic_id=" + ID + "&roast_id=" + roastId + "&type=1",
                    callback: function(data) {
                        data = JSON.parse(data);
                        if (+data.ret === 2) {
                            roastPlusOne(e0, clientX, clientY);
                            if (type === 1)
                                if (!goodObj) {
                                    tar.innerHTML += "<i>1</i>";
                                    roastDataItem.good = 1
                                } else {
                                    if (roastDataItem.good < 999)
                                        goodObj.innerHTML = +goodObj.innerHTML + 1;
                                    else if (roastDataItem.good ===
                                    999)
                                        goodObj.innerHTML = "1" + "\u4e07";
                                    roastDataItem.good = ~~roastDataItem.good + 1
                                }
                            else if (type === 2)
                                tar.innerHTML += "<i>1</i>"
                        } else if (+data.status === -99) {
                            toLogin();
                            sendPgv("AC.VIEW.NEWDM.DENGLU_DIANZAN")
                        }
                    }
                })
            }
        }
          , dmGood = function(tar, e0, type) {
            sendPgv("AC.VIEW.NEWDM.DIANZAN_DANMU");
            if (!USER)
                return toLogin();
            if (type === 1) {
                roastSeqString = tar.getAttribute("data-roast-seq");
                roastDataItem = getRoastData(roastSeqString)
            }
            if (type === 1 && roastDataItem.hasGood || (type === 2 || type === 3) && tar.getAttribute("data-good"))
                roastGoodPrompt();
            else {
                var roastId = tar.getAttribute("data-roast-id")
                  , goodObj = tar.getElementsByTagName("span")[0]
                  , clientX = e0.pageX ? null  : e0.clientX
                  , clientY = e0.pageY ? null  : e0.clientY;
                if (type === 1)
                    roastDataItem.hasGood = 1;
                else if (type === 2)
                    tar.setAttribute("data-good", 1);
                ajax.get({
                    url: "http://ac.qq.com/ComicView/updateRoastGoodorBad/?comic_id=" + ID + "&roast_id=" + roastId + "&type=1",
                    callback: function(data) {
                        data = JSON.parse(data);
                        if (+data.ret === 2) {
                            roastPlusOne(e0, clientX, clientY);
                            if (type === 1)
                                if (!goodObj) {
                                    tar.innerHTML += "<span>1</span>";
                                    roastDataItem.good = 1
                                } else {
                                    if (roastDataItem.good < 999)
                                        goodObj.innerHTML = +goodObj.innerHTML + 1;
                                    else if (roastDataItem.good === 999)
                                        goodObj.innerHTML = "1" + "\u4e07";
                                    roastDataItem.good = ~~roastDataItem.good + 1
                                }
                            else if (type === 2)
                                tar.innerHTML += "<span>1</span>"
                        } else if (+data.status === -99) {
                            toLogin();
                            sendPgv("AC.VIEW.NEWDM.DENGLU_DIANZAN")
                        }
                    }
                })
            }
        }
          , roastClose = function() {
            if (!parent.getAttribute("data-user-hide")) {
                parent.setAttribute("data-user-hide", "set");
                Fade(parent, 1, 0, 300);
                setTimeout(function() {
                    parent.style.zIndex =
                    "-1"
                }, 300);
                sendPgv("AC.VIEW.NEWDM.CHADIAO")
            }
        }
        ;
        if (parent.className === "for-roast")
            if (roastStopState === 1)
                roastGood(e, e0, 1);
            else {
                if (roastStopState === 2)
                    dmGood(e, e0, 1)
            }
        else if (gParent.className === "for-roast")
            if (roastStopState === 1)
                if (e.tagName.toLowerCase() === "b")
                    roastClose();
                else
                    roastGood(parent, e0, 1);
            else {
                if (roastStopState === 2)
                    dmGood(parent, e0, 1)
            }
        else if (parent.className === "own-roast")
            if (roastStopState === 2)
                dmGood(e, e0, 2);
            else {
                if (roastStopState === 1)
                    roastGood(e, e0, 2)
            }
        else if (gParent.className === "own-roast")
            if (roastStopState ===
            2)
                dmGood(parent, e0, 2);
            else {
                if (roastStopState === 1)
                    roastGood(parent, e0, 2)
            }
        else if (parent.className === "adv-roast")
            dmGood(e, e0, 3)
    }
      , roastRestart = function() {
        roastStopElem.style[cssCore + "Transform"] = "translate(-" + (roastStopElem.offsetWidth + roastStopElem.parentNode.offsetWidth + (roastStopElem.parentNode.className === "adv-roast" ? 150 : 100)) + "px," + 0 + "px) translateZ(0)";
        roastStopElem.style[cssCore + "TransitionDuration"] = DANMU_TIME - roastStopElem.getAttribute("data-timepass") + "ms";
        roastStopElem.setAttribute("data-timestart",
        +new Date);
        roastStopElem.setAttribute("data-roast", "");
        roastStopElem = null
    }
    ;
    roastStop = function(e) {
        var roastStopState = body.className.indexOf("roast-dm") === -1 ? 1 : 2;
        if (roastStopState !== 2 && roastStopState !== 1)
            return;
        e = e || window.event;
        e = e.target || e.srcElement;
        var parent = e.parentNode
          , grandParent = parent.parentNode
          , roastItem = null ;
        if (roastStopState === 2)
            if (parent.className === "for-roast" || parent.className === "own-roast" || parent.className === "adv-roast") {
                if (e.getAttribute("data-roast"))
                    return;
                if (roastStopElem)
                    roastRestart();
                roastStopElem = e;
                e.setAttribute("data-roast", "stop");
                var disAll = e.offsetWidth + parent.offsetWidth + (parent.className === "adv-roast" ? 300 : 100)
                  , lastPass = e.getAttribute("data-timepass") ? ~~e.getAttribute("data-timepass") : 0
                  , timePass = +new Date - e.getAttribute("data-timestart") + lastPass
                  , disPass = disAll * timePass / DANMU_TIME * -1;
                e.setAttribute("data-timepass", timePass);
                if (parent.className === "own-roast")
                    e.style[cssCore + "Transform"] = "translate(" + disPass + "px," + 0 + "px) translateZ(0)";
                else if (parent.className === "adv-roast")
                    if (e.getAttribute("data-good") ===
                    1)
                        e.style[cssCore + "Transform"] = "translate(" + (disPass + 30 + 150) + "px," + 0 + "px) translateZ(0)";
                    else
                        e.style[cssCore + "Transform"] = "translate(" + (disPass + 150) + "px," + 0 + "px) translateZ(0)";
                else
                    e.style[cssCore + "Transform"] = "translate(" + disPass + "px," + 0 + "px) translateZ(0)";
                e.style[cssCore + "TransitionDuration"] = 0 + "ms"
            } else if (grandParent.className === "for-roast" || grandParent.className === "own-roast") {
                if (roastStopElem)
                    roastRestart();
                if (parent.getAttribute("data-roast"))
                    return;
                roastStopElem = parent;
                parent.setAttribute("data-roast",
                "stop");
                var disAll = parent.offsetWidth + grandParent.offsetWidth + 100
                  , lastPass = parent.getAttribute("data-timepass") ? ~~parent.getAttribute("data-timepass") : 0
                  , timePass = +new Date - parent.getAttribute("data-timestart") + lastPass
                  , disPass = disAll * timePass / DANMU_TIME * -1;
                parent.setAttribute("data-timepass", timePass);
                if (grandParent.className === "own-roast")
                    parent.style[cssCore + "Transform"] = "translate(" + disPass + "px," + 0 + "px) translateZ(0)";
                else
                    parent.style[cssCore + "Transform"] = "translate(" + disPass + "px," + 0 + "px) translateZ(0)";
                parent.style[cssCore + "TransitionDuration"] = 0 + "ms"
            } else {
                if (roastStopElem)
                    roastRestart()
            }
        else if (roastStopState === 1)
            if (parent.className === "for-roast") {
                if (roastStopElem)
                    return;
                roastStopElem = e;
                e.setAttribute("data-stop", 1)
            } else if (grandParent.className === "for-roast") {
                if (roastStopElem)
                    return;
                roastStopElem = parent;
                parent.setAttribute("data-stop", 1)
            } else if (roastStopElem) {
                roastStopElem.setAttribute("data-stop", "");
                roastStopElem = null
            }
    }
    ;
    if (comicContain) {
        on(comicContain, mouse.click, roastClickHandl);
        on(comicContain,
        mouse.move, roastStop);
        comicContain.onmousedown = function(e) {
            e = e || window.event;
            if (e.button === 2 || e.which === 2 || !e.which && e.button === 4 || (e.target || e.srcElement).alt)
                return;
            var scrollTop = getScrollTop()
              , now = +new Date
              , from = {
                X: e.clientX,
                Y: e.clientY
            };
            comicContain.onmousemove = function(e) {
                e = e || window.event;
                var toY = from.Y - e.clientY;
                window.scrollTo(0, toY + scrollTop)
            }
            ;
            comicContain.onmouseup = function(e) {
                e = e || window.event;
                var toX = from.X - e.clientX
                  , toY = from.Y - e.clientY
                  , diff = +new Date - now
                  , v = toY / diff;
                if (Math.abs(toX) >
                350)
                    if (toX < 0)
                        if (NEXT_CHAPTER)
                            window.location.href = makeUrl(ID, NEXT_CHAPTER, 1);
                        else
                            noMore();
                    else if (PREV_CHAPTER)
                        window.location.href = makeUrl(ID, PREV_CHAPTER);
                    else
                        noPrev();
                if (Math.abs(v) > 1.4)
                    smoothScroll(toY + scrollTop, ~~(v * 20), 220);
                comicContain.onmouseup = function() {}
                ;
                comicContain.onmousemove = function() {}
            }
        }
        ;
        if (window.addEventListener)
            document.addEventListener("mouseup", function() {
                comicContain.onmousemove = function() {}
            }, false);
        else
            document.attachEvent("onmouseup", function() {
                comicContain.onmousemove =
                function() {}
            });
        $$("comicTitle").onmouseover = function() {
            comicContain.onmousemove = function() {}
        }
        ;
        if (bigScreenRoastMode)
            addClass(body, "roast-right");
        else
            addClass(body, "roast-right")
    }
    if (comicContainCross) {
        on(comicContainCross, mouse.click, roastClickHandl);
        on(comicContainCross, mouse.move, roastStop);
        var pageArrow = $$("pageArrow"), interval;
        if (mobileDevice)
            on(body, mouse.move, function(e) {
                e = e || window.event;
                if (!goPageEnable && e.preventDefault)
                    e.preventDefault()
            });
        on(comicContainCross, mouse.down, function(e) {
            if (!goPageEnable)
                return;
            e = e || window.event;
            var tar = e.target;
            if (!tar)
                return e.returnValue = false;
            if (!mobileDevice && e.button === 2 && tar.tagName.toLowerCase() === "img" && !roastState) {
                var s = tar.style
                  , p = tar.parentNode.parentNode.style;
                s[cssCore + "Transform"] = "scale(1) scaleZ(1)";
                s[cssCore + "TransformOrigin"] = (e.offsetX || e.layerX) + "px " + (e.offsetY || e.layerY) + "px";
                s[cssCore + "Transform"] = "scale(1.3) scaleZ(1)";
                p["zIndex"] = "3";
                clearTimeout(interval);
                document.body.onmouseup = function() {
                    s[cssCore + "Transform"] = "scale(1) scaleZ(1)";
                    interval =
                    setTimeout(function() {
                        p["zIndex"] = ""
                    }, 190);
                    document.body.onmouseup = null
                }
                ;
                return
            }
            if (e.which === 2 || !e.which && e.button === 4)
                return;
            e = e.touches ? e.touches[0] : e;
            var now = +new Date
              , from = {
                X: e.clientX,
                Y: e.clientY
            }
              , move = function(e) {
                e = e || window.event;
                if (e.preventDefault)
                    e.preventDefault();
                e = e.touches ? e.touches[0] : e;
                var toX = from.X - e.clientX;
                trans(comicContainCross, -nowPage * moveWidth - toX, 0, 0)
            }
              , end = function(e) {
                e = e || window.event;
                e = e.changedTouches ? e.changedTouches[0] : e;
                var toX = from.X - e.clientX
                  , diff = +new Date - now
                  , v =
                toX / diff;
                if (Math.abs(toX) > moveWidth * 0.1 || Math.abs(v) > 1)
                    if (toX > 0)
                        goPage(nowPage + 1);
                    else
                        goPage(nowPage - 1);
                else
                    trans(comicContainCross, -nowPage * moveWidth, 0, 300);
                off(comicContainCross, mouse.move, move);
                off(comicContainCross, mouse.up, end);
                pageArrow.onmouseover = function() {}
            }
            ;
            on(comicContainCross, mouse.move, move);
            on(comicContainCross, mouse.up, end);
            pageArrow.onmouseover = end
        });
        if (window.addEventListener)
            document.addEventListener("mouseup", function() {
                comicContainCross.onmousemove = function() {}
            }, false);
        else
            document.attachEvent("onmouseup",
            function() {
                comicContainCross.onmousemove = function() {}
            });
        $$("comicTitle").onmouseover = function() {
            comicContainCross.onmousemove = function() {}
        }
    }
}();
function closeDialog() {
    removeClass($$("iframeMask"), "active");
    $$("iframeMask").style.display = "none";
    addClass($$("dialog"), "hidden")
}
window.noPrev = function() {
    var im = $$("iframeMask")
      , dl = $$("dialog");
    if (im.className.indexOf("active") !== -1)
        return;
    addClass(im, "active");
    im.style.display = "block";
    removeClass(dl, "hidden");
    var dialogHtml = ""
      , data = {
        title: "\u63d0\u793a",
        emotion: "^_^",
        text: "\u4e3b\u4eba\uff0c\u8fd9\u662f\u672c\u4f5c\u54c1\u7684\u7b2c\u4e00\u7ae0\uff0c\u6ca1\u6709\u4e0a\u4e00\u7ae0\u54df~",
        button: [{
            id: "goBack",
            name: "\u786e\u5b9a",
            fn: "closeDialog"
        }],
        noReview: "",
        closebtn: {
            id: "dialogClose",
            name: "X",
            fn: "closeDialog"
        }
    };
    dialogHtml =
    template("dialogMod", data);
    dl.innerHTML = dialogHtml
}
;
function UnitBezier(p1x, p1y, p2x, p2y) {
    this.cx = 3 * p1x;
    this.bx = 3 * (p2x - p1x) - this.cx;
    this.ax = 1 - this.cx - this.bx;
    this.cy = 3 * p1y;
    this.by = 3 * (p2y - p1y) - this.cy;
    this.ay = 1 - this.cy - this.by
}
UnitBezier.prototype = {
    epsilon: 0.01,
    sampleCurveX: function(t) {
        return ((this.ax * t + this.bx) * t + this.cx) * t
    },
    sampleCurveY: function(t) {
        return ((this.ay * t + this.by) * t + this.cy) * t
    },
    sampleCurveDerivativeX: function(t) {
        return (3 * this.ax * t + 2 * this.bx) * t + this.cx
    },
    solveCurveX: function(x, epsilon) {
        var t0, t1, t2, x2, d2, i;
        for (t2 = x,
        i = 0; i < 8; ++i) {
            x2 = this.sampleCurveX(t2) - x;
            if (Math.abs(x2) < epsilon)
                return t2;
            d2 = this.sampleCurveDerivativeX(t2);
            if (Math.abs(d2) < epsilon)
                break;
            t2 = t2 - x2 / d2
        }
        t0 = 0;
        t1 = 1;
        t2 = x;
        if (t2 < t0)
            return t0;
        if (t2 > t1)
            return t1;
        while (t0 < t1) {
            x2 = this.sampleCurveX(t2);
            if (Math.abs(x2 - x) < epsilon)
                return t2;
            if (x > x2)
                t0 = t2;
            else
                t1 = t2;
            t2 = (t1 - t0) * 0.5 + t0
        }
        return t2
    },
    solve: function(x, epsilon) {
        return this.sampleCurveY(this.solveCurveX(x, epsilon))
    }
};
function trim(s) {
    return s === null  ? "" : s.toString().replace(/^\s+/, "").replace(/\s+$/, "")
}
function cookie(name, value, options) {
    if (typeof value !== "undefined") {
        options = options || {};
        if (value === null ) {
            value = "";
            options.expires = -1
        }
        var expires = "";
        if (options.expires && (typeof options.expires === "number" || options.expires.toUTCString)) {
            var date;
            if (typeof options.expires === "number") {
                date = new Date;
                date.setTime(+date + options.expires * 24 * 60 * 60 * 1E3)
            } else
                date = options.expires;
            expires = "; expires=" + date.toGMTString()
        }
        var path = options.path ? "; path=" + options.path : ""
          , domain = options.domain ? "; domain=" + options.domain :
        ""
          , secure = options.secure ? "; secure" : "";
        document.cookie = [name, "=", encodeURIComponent(value), expires, path, domain, secure].join("")
    } else {
        var cookieValue = null , i = 0, cookies, cookie;
        if (document.cookie && document.cookie !== "") {
            cookies = document.cookie.split(";");
            for (; i < cookies.length; ++i) {
                cookie = trim(cookies[i]);
                if (cookie.substring(0, name.length + 1) === name + "=") {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break
                }
            }
        }
        return cookieValue
    }
}
function makeUrl(id, cid, fromPrev) {
    return "/ComicView/index/id/" + id + "/cid/" + cid + (fromPrev ? "?fromPrev=1" : "")
}
var fullscreenTimeOut = null
  , promptTextTimeOut = null
  , pt = $$("promptText")
  , pm = $$("promptMain")
  , promptRun = function(text, width) {
    if (width)
        pt.style.cssText = "width: " + width + "px;margin-left:-" + ~~(width / 2) + "px";
    else
        pt.style.cssText = "";
    pm.innerHTML = text;
    clearTimeout(fullscreenTimeOut);
    clearTimeout(promptTextTimeOut);
    fullscreenTimeOut = setTimeout(function() {
        Fade(pt, 1, 0, 400);
        clearTimeout(promptTextTimeOut);
        promptTextTimeOut = setTimeout(function() {
            addClass(pt, "hidden")
        }, 500)
    }, 2E3);
    Fade(pt, 0, 1, 100);
    removeClass(pt,
    "hidden")
}
;
var cleanMode = crossPage ? 1 : 0
  , fullMode = osHeight >= window.screen.height - 2
  , cleanModeInit = function() {
    if (cleanMode)
        addClass(body, "fullscreen");
    else
        removeClass(body, "fullscreen")
}
  , checkScreenMode = function() {
    goScalePic();
    fullMode = osHeight >= window.screen.height - 2;
    if (cleanMode)
        return;
    if (fullMode)
        addClass(document.body, "fullscreen");
    else
        removeClass(document.body, "fullscreen")
}
;
!function() {
    eval(function(p, a, c, k, e, r) {
        e = function(c) {
            return (c < a ? "" : e(parseInt(c / a))) + ((c = c % a) > 35 ? String.fromCharCode(c + 29) : c.toString(36))
        }
        ;
        if (!"".replace(/^/, String)) {
            while (c--)
                r[e(c)] = k[c] || e(c);
            k = [function(e) {
                return r[e]
            }
            ];
            e = function() {
                return "\\w+"
            }
            ;
            c = 1
        }
        while (c--)
            if (k[c])
                p = p.replace(new RegExp("\\b" + e(c) + "\\b","g"), k[c]);
        return p
    }('p s(){i="C+/=";H.q=p(c){o a="",b,d,h,f,g,e=0;z(c=c.J(/[^A-L-M-9\\+\\/\\=]/g,"");e<c.r;)b=i.l(c.k(e++)),d=i.l(c.k(e++)),f=i.l(c.k(e++)),g=i.l(c.k(e++)),b=b<<2|d>>4,d=(d&t)<<4|f>>2,h=(f&3)<<6|g,a+=5.7(b),w!=f&&(a+=5.7(d)),w!=g&&(a+=5.7(h));n a=y(a)};y=p(c){z(o a="",b=0,d=D=8=0;b<c.r;)d=c.j(b),E>d?(a+=5.7(d),b++):F<d&&G>d?(8=c.j(b+1),a+=5.7((d&I)<<6|8&m),b+=2):(8=c.j(b+1),x=c.j(b+2),a+=5.7((d&t)<<K|(8&m)<<6|x&m),b+=3);n a}}o B=v s;u=(v N("n "+B.q(u.O(1))))();',
    51, 51, "|||||String||fromCharCode|c2||||||||||_keyStr|charCodeAt|charAt|indexOf|63|return|var|function|decode|length|Base|15|DATA|new|64|c3|_utf8_decode|for|||ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789|c1|128|191|224|this|31|replace|12|Za|z0|Function|substring".split("|"), 0, {}))
}();
var ID = DATA.comic.id, CID = DATA.chapter.cid, PICTURE = DATA.picture, PREV_CHAPTER = DATA.chapter.prevCid, NEXT_CHAPTER = DATA.chapter.nextCid, IS_VIP = +DATA.chapter.vipStatus === 2, IS_JAPAN = DATA.comic.isJapanComic, PREV_CHAPTER_NAME, NEXT_CHAPTER_NAME, IS_BLACK_MAN, IS_FAV, USER, COLLECT_COUNT;
var nowPage, wrapWidth, crossPageTo, jumpPrompt, roastDelay, roastInterval, qqGameHallFirst, bigScreenRoastMode = !mobileDevice && osWidth >= 1399 && osHeight > 850 ? 1 : 0;
var qqGameHall = +cookie("qq_game_new_chapter_view");
var isQQbrowser = /qqbrowser/.test(navigator.userAgent.toLowerCase())
  , qqVer = isQQbrowser ? navigator.userAgent.toLowerCase().split("qqbrowser/")[1] : 0
  , canSubscribe = false
  , sendDesktop = $$("sendDesktop")
  , hideSubscribe = false
  , subscribeIco = ""
  , hasSubscribed = false
  , sendComicTitle = ""
  , sendComicSubTitle = ""
  , popUpMsg = $$("popUpMsg")
  , popUpContent = $$("popUpContent")
  , popUpClose = $$("popUpClose")
  , advSeq = -1
  , advWrap = null ;
ajax.get({
    url: "/Ajax/subscribe/comicId/" + ID,
    callback: function(data) {
        data = JSON.parse(data);
        if (+data.status === 2)
            if (!data.inList)
                hideSubscribe = true;
            else {
                if (qqVer) {
                    sendDesktop.style.display = "inline-block";
                    if (qqVer.split(".")[0] == 9)
                        if (qqVer.split(".")[1] == 0) {
                            if (~~qqVer.split(".")[2] > 24)
                                canSubscribe = true
                        } else {
                            if (qqVer.split(".")[1] > 0)
                                canSubscribe = true
                        }
                    else if (qqVer.split(".")[0] > 9)
                        canSubscribe = true
                }
                subscribeIco = data.ico;
                sendComicTitle = sendComicSubTitle = DATA.comic.title;
                if (sendComicTitle.indexOf("/") != -1)
                    sendComicSubTitle =
                    sendComicTitle.split("/")[0];
                if (canSubscribe && !hideSubscribe)
                    chrome.runtime.sendMessage("hbkoccppnblkmobdjagebolnebjiajig", {
                        msg: "existDesktopLink",
                        shellLinkName: sendComicSubTitle + ".lnk",
                        type: 10
                    }, function(response) {
                        if (response.isExist == true) {
                            hasSubscribed = true;
                            sendDesktop.innerHTML = '<i class="user-send-tick"></i>\u5df2\u53d1\u9001\u81f3\u684c\u9762';
                            addClass(sendDesktop, "hasSent")
                        }
                    });
                on(sendDesktop, mouse.click, function() {
                    sendPgv("AC.VIEW.NEWDM.FASONGZHUOMIAN_TOP");
                    if (canSubscribe && !hideSubscribe &&
                    !hasSubscribed)
                        chrome.runtime.sendMessage("hbkoccppnblkmobdjagebolnebjiajig", {
                            msg: "existDesktopLink",
                            shellLinkName: sendComicSubTitle + ".lnk",
                            type: 10
                        }, function(r) {
                            if (r.isExist == true) {
                                hasSubscribed = true;
                                sendDesktop.innerHTML = '<i class="user-send-tick"></i>\u5df2\u53d1\u9001\u81f3\u684c\u9762';
                                addClass(sendDesktop, "hasSent");
                                popUpContent.innerHTML = '<p class="ui-pt50 ui-fs18">\u8ba2\u9605\u6210\u529f</p><p>\u70b9\u51fb\u684c\u9762\u56fe\u6807\u5c31\u80fd\u76f4\u63a5\u770b\u6f2b\u753b\u4e86</p>';
                                popUpMsg.style.display =
                                "block";
                                setTimeout(function() {
                                    popUpMsg.style.display = "none"
                                }, 3E3)
                            } else {
                                var link = "http://ac.qq.com/Comic/comicInfo/id/" + ID + "?shortcut=qqb";
                                chrome.runtime.sendMessage("hbkoccppnblkmobdjagebolnebjiajig", {
                                    msg: "addOnlineDesktopShellLink",
                                    shellLinkName: sendComicSubTitle + ".lnk",
                                    type: 10,
                                    linkArgument: " " + link,
                                    shellLinkImageUrl: subscribeIco,
                                    ignoreDeletedBehavior: true
                                }, function(response) {
                                    hasSubscribed = true;
                                    sendDesktop.innerHTML = '<i class="user-send-tick"></i>\u5df2\u53d1\u9001\u81f3\u684c\u9762';
                                    addClass(sendDesktop,
                                    "hasSent");
                                    popUpContent.innerHTML = '<p class="ui-pt50 ui-fs18">\u8ba2\u9605\u6210\u529f</p><p>\u70b9\u51fb\u684c\u9762\u56fe\u6807\u5c31\u80fd\u76f4\u63a5\u770b\u6f2b\u753b\u4e86</p>';
                                    popUpMsg.style.display = "block";
                                    setTimeout(function() {
                                        popUpMsg.style.display = "none"
                                    }, 3E3)
                                })
                            }
                        });
                    else if (!hideSubscribe && !canSubscribe && isQQbrowser) {
                        addClass(popUpMsg, "pop-send-upgrade");
                        popUpContent.innerHTML = '<p class="ui-pt50">\u5347\u7ea7\u4e00\u4e0bQQ\u6d4f\u89c8\u5668\u5c31\u53ef\u4ee5</p><p>\u628a\u559c\u7231\u7684\u6f2b\u753b\u653e\u5230\u684c\u9762\uff0c\u5373\u70b9\u5373\u770b\u54e6</p><div class="pop-btn-wr"><a class="pop-btn ui-btn-orange" target="_blank" href="http://dldir1.qq.com/invc/tt/QQBrowser_Setup_TComic.exe">\u53bb\u5347\u7ea7</a></div>';
                        popUpMsg.style.display = "block"
                    }
                });
                on(popUpClose, mouse.click, function() {
                    popUpMsg.style.display = "none"
                })
            }
    }
});
if (window.location.href.indexOf("shortcut=qqb") !== -1)
    sendPgv("AC.COMICINFO.QQBROWSER.ICO_" + ID);
var roastState = cookie("roastState"), roastContent = $$("roastContent"), roastBarShrink = $$("roastBarShrink"), roastHandle, onRoast = false;
if (roastState) {
    roastState = +roastState;
    if (cssCore === "") {
        addClass(roastBarShrink, "roast-bar-ie");
        addClass(roastBarWrap, "roast-bar-ie")
    }
    if (roastState === 2) {
        if (cssCore === "")
            roastState = 1
    } else if (roastState === 0)
        addClass(body, "no-roast")
} else if (cssCore !== "") {
    roastState = Math.random() > 0.5 ? 1 : 2;
    cookie("roastState", roastState, {
        path: "/",
        expires: 10
    })
} else {
    roastState = 1;
    cookie("roastState", "1", {
        path: "/",
        expires: 10
    })
}
if (roastState === 2)
    addClass(body, "roast-dm");
if (IS_JAPAN) {
    addClass(body, "is-japan");
    roastState = 0
}
!function() {
    if (!isLocalStorageNameSupported)
        return;
    var local = window.localStorage
      , hideRoastList = local.getItem("hideRoastList")
      , roastHideLeadShrink = $$("roastHideLeadShrink")
      , roastHideLead = $$("roastHideLead")
      , popUpHideLeadTips = function() {
        if (roastHideLead)
            roastHideLead.parentNode.style.display = "block";
        if (roastHideLeadShrink)
            roastHideLeadShrink.parentNode.style.display = "block"
    }
    ;
    window.hideRoastleadTips = function() {
        if (!isLocalStorageNameSupported || hideRoastList)
            return;
        if (roastHideLead)
            roastHideLead.parentNode.style.display =
            "none";
        if (roastHideLeadShrink)
            roastHideLeadShrink.parentNode.style.display = "none";
        local.setItem("hideRoastList", "1")
    }
    ;
    if (!hideRoastList && roastState && (roastHideLeadShrink || roastHideLead)) {
        popUpHideLeadTips();
        on(roastHideLead, mouse.click, hideRoastleadTips);
        on(roastHideLeadShrink, mouse.click, hideRoastleadTips)
    }
}();
!function() {
    var roastMode = $$("roastMode"), roastAndBarrage = $$("roastAndBarrage"), toRoast = $$("toRoast"), cancelRoast = $$("calcelRoast"), icoBarWrite = $$("icoBarWrite"), commentWrap = $$("commentWrap"), roastColorSelector = $$("roastColorSelector"), roastBtnText = $$("roastBtnText"), roastPrompt = $$("roastPrompt"), roastCount = $$("roastCount"), roastPromptOn = true, roastWarn = false, roastWrap = crossPage ? $$("comicContainCross") : $$("comicContain"), state = 0, checkText = function() {
        var value = this.value
          , len = value.length;
        if (value ===
        "") {
            if (!roastPromptOn) {
                removeClass(roastPrompt, "hidden");
                roastPromptOn = true;
                roastCount.innerHTML = "0/30"
            }
        } else {
            if (roastPromptOn) {
                addClass(roastPrompt, "hidden");
                roastPromptOn = false
            }
            roastCount.innerHTML = len + "/30";
            if (+len > 30) {
                if (!roastWarn) {
                    roastCount.style.color = "#f04";
                    roastWarn = true
                }
            } else if (roastWarn) {
                roastCount.style.color = "";
                roastWarn = false
            }
        }
    }
    , roastPut = function(e) {
        var target, pid, wrap, p, placed = {}, pos = {}, value = roastContent.value, fontColor = +$$("roastColorSelector").getAttribute("data-color-select") ||
        0, avatarImg = null , roastPutState = body.className.indexOf("roast-dm") === -1 ? 1 : 2, roastPutCallBack = function(posX, posY, id) {
            wrap = target.nextSibling.nextSibling.nextSibling;
            if (!wrap.tagName || wrap.tagName.toLowerCase() !== "div")
                wrap = wrap.nextSibling;
            p = document.createElement("p");
            p.setAttribute("data-roast-id", id);
            +fontColor && (p.className = "color-" + fontColor);
            if (roastPutState === 2) {
                if (!avatarImg) {
                    avatarImg = document.createElement("img");
                    avatarImg.src = USER && USER.avatar || "http://ac.gtimg.com/media/images/ac_chapter_avatar.jpg"
                }
                p.appendChild(avatarImg);
                p.appendChild(document.createTextNode(value));
                p.style.cssText = "left:100%;top:" + (ROAST_VIEW * 45 + 50) + "px;";
                p.setAttribute("data-timepass", 0);
                p.setAttribute("data-good", "");
                wrap.appendChild(p);
                setTimeout(function() {
                    p.setAttribute("data-timestart", +new Date);
                    transToX(p, cssCore ? -p.offsetWidth - target.parentNode.offsetWidth - 100 : -p.offsetWidth - 100, DANMU_TIME, function() {
                        p = null
                    }, nowPage)
                }, 300)
            } else {
                if (!avatarImg) {
                    avatarImg = document.createElement("img");
                    avatarImg.src = USER && USER.avatar || "http://ac.gtimg.com/media/images/ac_chapter_avatar.jpg"
                }
                p.innerHTML =
                "<span></span>";
                p.appendChild(document.createTextNode(value));
                p.appendChild(avatarImg);
                p.style.cssText = "left:" + posX + "%;top:" + posY + "%;opacity:0";
                Fade(p, 0, 1, 300);
                wrap.appendChild(p);
                p = null
            }
        }
        ;
        e = e || window.event;
        target = e.target || e.srcElement;
        if (target.className === "for-roast")
            target = target.previousSibling.previousSibling;
        pid = target.getAttribute("data-pid");
        if (!pid || !value)
            return;
        if (/(?:^[A-Za-z0-9\.\?\+\-,;!*`~\u3002\uff0c\u3001]+$)|(?:^[asdqwef\s]+$)|(QQ|Qq|qq|w(?:.*)w(?:.*)w)/.test(value))
            if (!/^(233+|666+)$/.test(value)) {
                roastHandle(-1);
                roastContent.select();
                promptRun("\u8bf7\u4e0d\u8981\u53d1\u8868\u65e0\u610f\u4e49\u8bcd\u6c47");
                return
            }
        placed = {
            x: (e.offsetX || e.layerX || e.clientX - target.getBoundingClientRect().left) + 18,
            y: (e.offsetY || e.layerY || e.clientY - target.getBoundingClientRect().top) - 16
        };
        pos = {
            x: ~~(placed.x / target.offsetWidth * 1E4) / 100,
            y: ~~(placed.y / target.offsetHeight * 1E4) / 100
        };
        addRoast(pid, pos.x, pos.y, target.getAttribute("data-w"), target.getAttribute("data-h"), value, fontColor, roastPutCallBack);
        pos.x = ~~(pos.x / 100 * target.getAttribute("data-w"));
        pos.y = ~~(pos.y / 100 * target.getAttribute("data-h"));
        sendPgv("AC.VIEW.NEWEVENT.TC.FATUCAO_SUCCESS");
        roastContent.value = "";
        checkText.call(roastContent);
        continueRoast();
        onRoast = false;
        removeClass(toolWrapBottom, "to-roast");
        changeBottom(commentWrap, -190, 200);
        off(roastWrap, "click", roastPut);
        state = 0
    }
    , roastCancel = function(e) {
        e = e || window.event;
        if (+e.button === 2)
            roastHandle(-1)
    }
    , changeBottom = function() {
        if (isIE)
            return function(o, y, t) {
                if (o.currentStyle.bottom === "auto")
                    o.style.bottom = "-190px";
                var cs = o.currentStyle ||
                window.getComputedStyle(o, null ), s = o.style, cy = parseInt(s.bottom || cs.bottom || 0, 10), dy = y - cy, ft = +new Date, end = ft + t, pos = 0, diff, _trans = function() {
                    if (+new Date > end) {
                        s.bottom = y + "px";
                        return 0
                    } else {
                        diff = end - new Date;
                        pos = diff / t;
                        s.bottom = cy + dy * (1 - pos) + "px"
                    }
                    return 1
                }
                , _requestTrans = function() {
                    requestAnimationFrame(function() {
                        if (_trans())
                            _requestTrans()
                    })
                }
                ;
                _requestTrans()
            }
            ;
        else
            return function(o, to) {
                o.style.bottom = to + "px"
            }
    }(), checkBlackUser = function(callback) {
        if (!USER)
            return;
        if (!IS_BLACK_MAN)
            ajax.get({
                url: "/Ajax/checkBlack",
                callback: function(data) {
                    data = JSON.parse(data);
                    if (+data.status === 2) {
                        IS_BLACK_MAN = data;
                        promptRun(data.msg, 700)
                    } else {
                        IS_BLACK_MAN = data;
                        callback()
                    }
                }
            });
        else if (IS_BLACK_MAN.status === 2)
            promptRun(IS_BLACK_MAN.msg, 700);
        else
            callback()
    }
    , roastHandleEnable = true, gotoRoast;
    roastHandle = function(x, f) {
        if (!roastHandleEnable)
            return;
        roastHandleEnable = false;
        setTimeout(function() {
            roastHandleEnable = true
        }, 200);
        if (x === -1)
            if (state === 1) {
                onRoast = false;
                removeClass(toolWrapBottom, "to-roast");
                changeBottom(commentWrap, -190, 200);
                state = 0
            } else {
                if (state === 2 && f === 2) {
                    continueRoast();
                    off(roastWrap, mouse.click, roastPut);
                    off(body, mouse.down, roastCancel);
                    state = 1
                }
            }
        else if (x === 1)
            if (state === 1) {
                if (roastContent.value.length === 0)
                    return;
                addClass(body, "set-roast");
                clearTimeout(roastInterval);
                on(roastWrap, mouse.click, roastPut);
                on(body, mouse.down, roastCancel);
                state = 2
            }
    }
    ;
    gotoRoast = function() {
        if (USER)
            if (state === 2) {
                sendPgv("AC.VIEW.NEWEVENT.TC.FQTUCAO_RIGHT");
                roastHandle(-1)
            } else if (onRoast) {
                onRoast = false;
                removeClass(toolWrapBottom, "to-roast");
                changeBottom(commentWrap, -190, 200);
                state = 0
            } else
                checkBlackUser(function() {
                    onRoast = true;
                    addClass(toolWrapBottom, "to-roast");
                    changeBottom(commentWrap, 0, 200);
                    setTimeout(function() {
                        roastContent.focus()
                    }, 50);
                    state = 1
                });
        else
            try {
                toLogin()
            } catch (e) {}
    }
    ;
    on(toRoast, mouse.click, gotoRoast);
    if (icoBarWrite)
        on(icoBarWrite, mouse.click, gotoRoast);
    if (!crossPage)
        on(roastBtnText, mouse.click, gotoRoast);
    on(cancelRoast, mouse.click, function() {
        roastHandle(-1);
        sendPgv("AC.VIEW.NEWDM.QUXIAO_BUTTON")
    });
    on(roastColorSelector,
    mouse.click, function(e) {
        var select;
        e = e || window.event;
        e = e.target || e.srcElement;
        if (e.tagName.toUpperCase() !== "A")
            return;
        select = e.getAttribute("data-color");
        if (!select || +select && !USER.isVipUser)
            return;
        removeClass(roastColorSelector.children[+roastColorSelector.getAttribute("data-color-select")], "active");
        addClass(roastColorSelector.children[+select], "active");
        roastColorSelector.setAttribute("data-color-select", select)
    });

}();
var hasDmRoast = 0
  , advDmRoast = function() {
    if (!hasDmRoast) {
        hasDmRoast = 1;
        if (roastState === 2 && jumpPrompt !== 1)
            ajax.get({
                url: "http://ac.qq.com/ComicView/getAdRoast/",
                callback: function(data) {
                    data = JSON.parse(data);
                    var target = getRoastList(nowPage)
                      , advArr = data.data
                      , advData = advArr[Math.floor(Math.random() * advArr.length)];
                    window.advWrap = target.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.getElementsByTagName("div")[0];
                    if (advWrap && data.ret === 2) {
                        advWrap.className = "type-" + advData.type;
                        advWrap.appendChild(document.createTextNode(advData.content));
                        advWrap.style.cssText = "left:100%;top:" + (ROAST_VIEW * 45 + 95) + "px;";
                        advWrap.setAttribute("data-timepass", 0);
                        advWrap.setAttribute("data-good", "");
                        transToX(advWrap, cssCore ? 150 : 150 + target.parentNode.offsetWidth, 0, nowPage);
                        setTimeout(function() {
                            advWrap.setAttribute("data-timestart", +new Date);
                            transToX(advWrap, cssCore ? -target.parentNode.offsetWidth - advWrap.offsetWidth - 150 : -advWrap.offsetWidth - 150, DANMU_TIME, function() {}, nowPage)
                        }, 300)
                    }
                }
            })
    }
}
;
var getRoast = function(pid, page, size, callback) {
    if (typeof pid === "object") {
        ajax.post({
            url: "/ComicView/getRoasts/",
            data: "id=" + ID + "&cid=" + CID + "&pid=" + pid[0] + "&page=" + page + "&pagesize=" + size,
            callback: callback,
            argu: [1, nowPage]
        });
        ajax.post({
            url: "/ComicView/getRoasts/",
            data: "id=" + ID + "&cid=" + CID + "&pid=" + pid[1] + "&page=" + page + "&pagesize=" + size,
            callback: callback,
            argu: [2, nowPage]
        })
    } else
        ajax.post({
            url: "/ComicView/getRoasts/",
            data: "id=" + ID + "&cid=" + CID + "&pid=" + pid + "&page=" + page + "&pagesize=" + size,
            callback: callback,
            argu: [0, nowPage]
        })
}
  , addRoast = function(pid, xpos, ypos, w, h, content, fontColor, func) {
    posX = ~~(xpos / 100 * w);
    posY = ~~(ypos / 100 * h);
    if (USER && USER.token)
        ajax.post({
            url: "/ComicView/addRoast/",
            data: "id=" + ID + "&cid=" + CID + "&pid=" + pid + "&xpos=" + posX + "&ypos=" + posY + "&content=" + encodeURIComponent(content) + "&fc=" + fontColor + "&uin=" + USER.uin + "&tokenKey=" + USER.token,
            callback: function(data) {
                if (func) {
                    var data = JSON.parse(data);
                    if (+data.ret === 2)
                        func(xpos, ypos, data.id)
                }
            }
        })
}
;
!function() {
    var conf = window.location.href.split("?")[1], line, len, t, key, value;
    if (!conf)
        return;
    line = conf.split("&");
    len = line.length;
    while (len--) {
        t = line[len].split("=");
        if (!t[1])
            return;
        key = t[0];
        value = t[1];
        t = [];
        switch (key) {
        case "page":
            crossPageTo = +value;
            break;
        case "top":
            !crossPage && smoothScroll(0, +value, ~~(+value / 1E3) + 300);
            break;
        case "jump":
            jumpPrompt = 1;
            break;
        case "first":
            qqGameHallFirst = 1;
            break;
        case "hd":
            window.hdID = value;
            break;
        default:
            break
        }
    }
}();
!function() {
    var comicContain = $$("comicContain"), comicContainCross = $$("comicContainCross"), recommend = $$("recommend"), recommendStack = $$("recommendStack"), recommendListWrap = $$("recommendListWrap"), recommendScrollBg = $$("recommendScrollBg"), recommendScrollBlock = $$("recommendScrollBlock"), catalogue = $$("catalogue"), catalogueListWrap = $$("catalogueListWrap"), catalogueScrollBg = $$("catalogueScrollBg"), catalogueScrollBlock = $$("catalogueScrollBlock"), toolPageListChildren, imgobj = PICTURE, len = imgobj.length, innerUl =
    "", max = PRELOAD_NUM * 2 + 1, listTop = [], imgList = [], imgSrcList = [], imgPidList = [], loadingList = [], loadingState = [], roastAll = [], i = 0, nowLoadPic = 0, direction = 1, isLoading = false, list, _lowFixTop = function(os) {
        return os.indexOf("MSIE 7.0") !== -1 ? -4 : 0
    }(navigator.userAgent), _isLoadFirstPic = false, _pvgCount = 0, _o, _len, _intervalResize, _intervalPreload, _intervalPvg, _loadPic;
    function setBaseView(w, h) {
        scrollCatalogue.init(w, h);
        !crossPage && scrollRecommand.init(w, h);
        scrollBookshelf && scrollBookshelf.init(w, h)
    }
    function pvgCountAdd(PID) {
        if (++_pvgCount ===
        5) {
            ajax.post({
                url: "/ComicView/setPgvCountEx",
                data: "pgv=5&eid=" + DATA.comic.eId
            });
            _pvgCount = 0
        }
        if (IS_VIP)
            ajax.post({
                url: "/ComicView/setVipPgvCount",
                data: "id=" + ID + "&cid=" + CID + "&pid=" + PID
            })
    }
    if (!crossPage) {
        adjustWidth = function(width) {
            return width > osWidth - 40 ? osWidth - 40 : width
        }
        ;
        adjustHeight = function(width, height) {
            return width > osWidth - 40 ? ~~((osWidth - 40) / width * height) : height
        }
    } else {
        adjustWidth = function(width) {
            return moveWidth
        }
        ;
        adjustHeight = function(width, height) {
            osHeight = docEle.clientHeight || window.innerHeight;
            return cleanMode || fullMode ? osHeight : osHeight - 97
        }
    }
    ROAST_PRE = crossPage ? ROAST_PRE + 1 >> 1 : ROAST_PRE;
    ROAST_VIEW = crossPage ? ROAST_VIEW + 1 >> 1 : ROAST_VIEW;
    DANMU_TIME = crossPage ? DANMU_TIME - 4E3 : DANMU_TIME;
    var barrage = $$("barrage")
      , roastNum = $$("roastNum")
      , roastMode = $$("roastMode")
      , icoBarOpen = $$("icoBarOpen")
      , icoBarShow = $$("icoBarShow")
      , icoBarMode = $$("icoBarMode")
      , changeRoast = $$("changeRoast")
      , icoBarChange = $$("icoBarChange")
      , roastBarWrap = $$("roastBarWrap")
      , turnToRoastDm = $$("turnToRoastDm")
      , roastSmallBar = $$("roastSmallBar")
      ,
    roastBarContent = $$("roastBarContent")
      , roastHide = $$("roastHide")
      , getRandomArray = function(from, to) {
        var arr = []
          , i = from;
        for (; i <= to; ++i)
            arr[i - from] = i;
        return arr.sort(function() {
            return Math.random() > 0.5 ? 1 : -1
        })
    }
      , roast = {
        get: function(Duiye, size) {
            if (Duiye)
                return function(o, n, need) {
                    if (nowPage !== n)
                        return;
                    if (!roastAll[n])
                        if (o[n].length === 2) {
                            roastAll[n] = "loading";
                            getRoast(o[n][1].pid, 1, size, roast.start)
                        } else {
                            roastAll[n] = [];
                            roastAll[n][0] = roastAll[n][1] = "loading";
                            getRoast([o[n][1].pid, o[n][2].pid], 1, size, roast.start)
                        }
                    else
                        roast.continued(n,
                        need)
                }
                ;
            else
                return function(o, n, need) {
                    if (nowPage !== n)
                        return;
                    if (!roastAll[n]) {
                        roastAll[n] = "loading";
                        getRoast(o[n].pid, 1, ROAST_SIZE, roast.start)
                    } else
                        roast.continued(n, need)
                }
        }(crossPage, ROAST_SIZE),
        changeMode: function(n) {
            if (advWrap)
                advWrap.style.display = "none";
            var father = barrage.parentNode.parentNode;
            switch (+roastState) {
            case 0:
            case 2:
                roastState = 1;
                removeClass(body, "roast-dm");
                break;
            case 1:
                roastState = 2;
                addClass(body, "roast-dm");
                break;
            default:
                break
            }
            cookie("roastState", roastState, {
                path: "/",
                expires: 10
            });
            clearTimeout(roastInterval);
            if (crossPage)
                roast.get(devideImg, n, 1);
            else
                roast.get(imgobj, n, 1)
        },
        run: function(o, n, t) {
            if (t && o.length !== 2)
                return;
            var _w = adjustWidth(imgobj && imgobj[n].width), _diff = roastState === 2 ? 2E3 : 1800, _run = function(o, n) {
                if (!o.wrap || nowPage !== n)
                    return;
                var roastGroup = o.wrap.children, total = o.len < ROAST_SIZE ? o.len : ROAST_SIZE, view = o.len < ROAST_VIEW ? o.len : ROAST_VIEW, node, i, _barNode, _coinNode, _thisPosition, _nextGroup, _next, _o;
                if (roastState === 1) {
                    if (!crossPage && total > 17 && bigScreenRoastMode) {
                        _thisPosition =
                        o.next % total % 17;
                        _nextGroup = ~~(o.next % total / 17);
                        _coinNode = roastBarContent.children[1];
                        if (!roastBarContent.children[0])
                            return roast.continued(n, 1);
                        _barNode = roastBarContent.children[0].children[0];
                        if (o.roastBarGroup !== _nextGroup) {
                            o.roastBarGroup = _nextGroup;
                            transToY(_barNode, -544 * _nextGroup, 500)
                        }
                        transToY(_coinNode, _thisPosition * 32 + (cssCore ? 0 : 13), 500)
                    }
                    if (o.next < view && !o.hasChanged) {
                        if (o.next === 0) {
                            for (i = 0; i < ROAST_PRE; ++i) {
                                Fade(roastGroup[i], 0, 1, 400);
                                if (roastGroup[i])
                                    roastGroup[i].setAttribute("data-roast-hide",
                                    "0")
                            }
                            o.next = ROAST_PRE - 1;
                            if (o.next > total)
                                return 1
                        }
                        if (roastGroup[o.next]) {
                            roastGroup[o.next].setAttribute("data-roast-hide", "0");
                            Fade(roastGroup[o.next], 0, 1, 400)
                        }
                        if (view === o.len && o.next === view - 1)
                            return 1
                    } else {
                        if (!o.circle)
                            return 1;
                        if (roastGroup[0].getAttribute("data-stop"))
                            node = o.wrap.removeChild(roastGroup[1]);
                        else
                            node = o.wrap.removeChild(roastGroup[0]);
                        _next = o.data[o.next % total];
                        node.innerHTML = ~~_next.good > 0 ? "<span></span>" + _next.content + "<i>" + (_next.good > 1E4 ? (_next.good - _next.good % 1E4) / 1E4 + "\u4e07" :
                        _next.good) + "</i>" + '<b style="display:none;"></b>' : "<span></span>" + _next.content + '<b style="display:none;"></b>';
                        node.style.cssText = "left:" + _next.x + "%;top:" + _next.y + "%";
                        node.removeAttribute("data-user-hide");
                        node.setAttribute("data-roast-id", _next.roastId);
                        node.setAttribute("data-roast-seq", _next.sequence);
                        if (+_next.fc)
                            node.className = "color-" + _next.fc;
                        else {
                            var _nodeClass = node.className;
                            if (_nodeClass)
                                removeClass(node, _nodeClass)
                        }
                        o.wrap.appendChild(node);
                        Fade(node, 0, 1, 400)
                    }
                } else if (roastState === 2) {
                    if (!crossPage &&
                    total > 17 && bigScreenRoastMode)
                        o.roastBarGroup = !o.roastBarGroup ? 0 : o.roastBarGroup;
                    if (o.next < view) {
                        var _former = o.next
                          , _w = o.wrap.parentNode.offsetWidth
                          , _restart = function() {
                            if (_o.getAttribute("data-roast"))
                                return;
                            transToX(_o, cssCore ? 0 : _w, 0);
                            _next = o.data[(_former + ROAST_VIEW) % total];
                            _former = (_former + ROAST_VIEW) % total;
                            _o.setAttribute("data-timestart", 0);
                            _o.setAttribute("data-timepass", 0);
                            _o.setAttribute("data-good", "");
                            _o.setAttribute("data-roast-id", _next.roastId);
                            _o.setAttribute("data-roast-seq", _next.sequence);
                            _o.innerHTML = ~~_next.good > 0 ? _next.content + "<span>" + (_next.good > 1E4 ? (_next.good - _next.good % 1E4) / 1E4 + "\u4e07" : _next.good) + "</span>" : _next.content;
                            if (+_next.fc)
                                _o.className = "color-" + _next.fc;
                            else {
                                var _nodeClass = _o.className;
                                if (_nodeClass)
                                    removeClass(_o, _nodeClass)
                            }
                            setTimeout(function() {
                                _o.setAttribute("data-timestart", +new Date);
                                _o.setAttribute("data-timepass", 0);
                                transToX(_o, cssCore ? -_o.offsetWidth - _w - 100 : -_o.offsetWidth - 100, DANMU_TIME, _restart, n)
                            }, 300)
                        }
                        ;
                        _o = roastGroup[_former];
                        _o.setAttribute("data-timestart",
                        +new Date);
                        _o.setAttribute("data-timepass", 0);
                        transToX(_o, cssCore ? -_o.offsetWidth - _w - 100 : -_o.offsetWidth - 100, DANMU_TIME, _restart, n);
                        if (view === o.len && o.next === view - 1)
                            return 1
                    } else
                        return 1
                } else if (!crossPage && total > 17 && bigScreenRoastMode)
                    o.roastBarGroup = !o.roastBarGroup ? 0 : o.roastBarGroup;
                o.next++;
                if (o.next > total * 2 - 2)
                    o.next = o.next % total
            }
            , end;
            clearTimeout(roastInterval);
            if (!t) {
                end = _run(o, n);
                if (end)
                    return;
                roastInterval = setTimeout(function() {
                    roast.run(o, n)
                }, _diff)
            } else {
                end = [];
                if (t === 3)
                    if (Math.random() <
                    0.5) {
                        end[0] = _run(o[0], n);
                        end[1] = 0
                    } else {
                        end[0] = 0;
                        end[1] = _run(o[1], n)
                    }
                else if (t === 2) {
                    end[0] = 1;
                    end[1] = _run(o[1], n);
                    o[0].stop = 1
                } else if (t === 1) {
                    end[0] = _run(o[0], n);
                    end[1] = 1;
                    o[1].stop = 1
                }
                if (end[0]) {
                    if (end[1])
                        return;
                    roastInterval = setTimeout(function() {
                        roast.run(o, n, 2)
                    }, _diff)
                } else if (end[1])
                    roastInterval = setTimeout(function() {
                        roast.run(o, n, 1)
                    }, _diff);
                else
                    roastInterval = setTimeout(function() {
                        roast.run(o, n, 3)
                    }, _diff)
            }
        },
        start: function(data, argu) {
            var _temp = [], _hpos, _len, _t, innerRoast, innerRoastInfo, f = +argu[0] ===
            2 ? 1 : 0, n = argu[1], d = {}, i = 0, w, h, nowImg, o;
            if (!data)
                return;
            data = JSON.parse(data);
            if (+data.ret !== 0)
                return;
            !function() {
                var i = 0, j = 0, regForNoMeaning = /(?:^[A-Za-z0-9\.\?\+\-,;!*`~\u3002\uff0c\u3001]+$)|(?:^[asdqwe\s]+$)|(QQ|Qq|qq|w(?:.*)w(?:.*)w)|\u7834(?:.*)\u89e3|\u817e(?:.*)\u8baf|\u6536(?:.*)\u8d39/, regForCleaning = /[\u4e73\u54aa\u5978\u5a4a\u5c3b\u5c44\u5c4c\u5c4e\u5c59\u63d2\u64b8\u6deb\u80f8\u8279\u830e\u8349\u8d31\u903c\u9a9a\u9e21\u8214]|bi|b(?!gm)|cao|mi|shi|sao/g, o;
                for (; i < data.data.length; ++i) {
                    o =
                    data.data[i].content;
                    if (regForNoMeaning.test(o)) {
                        if (/^(233+|666+)$/.test(o))
                            continue;data.data.splice(i, 1);
                        i--;
                        j++
                    } else
                        data.data[i].content = data.data[i].content.replace(regForCleaning, "*")
                }
                data.total -= j
            }();
            data.len = data.data.length;
            data.circle = ROAST_VIEW < data.len ? 1 : 0;
            data.next = 0;
            _len = data.len;
            data.data.reverse();
            data.data.sort(function(a, b) {
                return b.good - a.good
            });
            if (!crossPage) {
                o = imgobj[n];
                w = o.width;
                h = o.height;
                nowImg = imgList[n];
                if (1) {
                    d.data = data.data;
                    d.total = data.total;
                    d.hot = 0;
                    innerRoastInfo = template("roastInfoMod",
                    d);
                    roastBarContent.innerHTML = innerRoastInfo
                }
            } else {
                if (f)
                    o = devideImg[n][2];
                else
                    o = devideImg[n][1];
                w = o.width;
                h = o.height;
                o = comicContainCross.children[n].getElementsByTagName("img");
                if (f)
                    nowImg = o[1];
                else
                    nowImg = o[0]
            }
            if (!nowImg)
                return roastAll[n] = null ;
            _hpos = ~~((1 - 38 / h) * 1E3) / 10;
            for (; i < _len; ++i) {
                _t = data.data[i];
                _t.x = ~~((+_t.xpos + 5) / w * 1E3) / 10;
                _t.y = ~~((+_t.ypos + 1) / h * 1E3) / 10;
                _t.x = _t.x > 100 ? 100 : _t.x;
                _t.y = _t.y > _hpos ? _t.y > 100 ? ~~(_hpos * Math.random()) : _hpos : _t.y;
                _t.sequence = nowPage + (crossPage ? "-" + (+argu[0] === 2 ? 1 :
                0) : "") + "-" + i;
                if (i < ROAST_VIEW)
                    _temp.push(data.data[i])
            }
            d.list = _temp;
            data.wrap = nowImg.nextSibling.nextSibling;
            if (roastState === 1)
                innerRoast = template("roastMod", d);
            else if (roastState === 2) {
                d.width = data.wrap.parentNode.offsetWidth;
                d.random = getRandomArray(0, ROAST_VIEW - 1);
                innerRoast = template("roastModForDm", d)
            }
            d.list = _temp;
            data.resetData = _temp;
            data.mode = roastState;
            data.wrap.innerHTML = innerRoast;
            _temp = null ;
            if (!crossPage)
                if (data.total <= 17)
                    addClass(roastBarContent.children[1], "hidden");
                else
                    removeClass(roastBarContent.children[1],
                    "hidden");
            var r0, r1;
            if (+argu[0]) {
                try {
                    roastAll[n][+argu[0] - 1] = data
                } catch (e) {
                    return
                }
                r0 = roastAll[n][0];
                r1 = roastAll[n][1];
                if (!r0 || r0 === "loading" || !r1 || r1 === "loading")
                    return;
                clearTimeout(roastInterval);
                roast.run(roastAll[n], n, 3);
                roastNum.innerHTML = +r0.total + +r1.total
            } else {
                roastAll[n] = data;
                roastAll[n].dmNextGroup = 0;
                clearTimeout(roastInterval);
                roast.run(data, n);
                if (!data.total && +data.total !== 0)
                    return;
                roastNum.innerHTML = data.total
            }
            if (nowPage === advSeq)
                advDmRoast()
        },
        continued: function(n, need, notChangeBar) {
            var o =
            roastAll[n], needChangeData, _changeMod = function(o) {
                if (!o.wrap)
                    return;
                var d = {}, innerRoast;
                o.mode = roastState;
                o.next = 0;
                d.list = o.resetData;
                if (roastState === 1) {
                    innerRoast = template("roastMod", d);
                    o.wrap.innerHTML = innerRoast
                } else if (roastState === 2) {
                    d.width = o.wrap.parentNode.offsetWidth;
                    d.random = getRandomArray(0, ROAST_VIEW - 1);
                    innerRoast = template("roastModForDm", d);
                    o.wrap.innerHTML = innerRoast
                }
            }
            ;
            if (o === "loading" || !o) {
                roastAll[n] = "";
                return roast.get(crossPage ? devideImg : imgobj, nowPage, 1)
            }
            if (need && o.wrap)
                o.wrap.nextSibling.nextSibling.innerHTML =
                "";
            if (n !== nowPage || o.total === 0)
                return;
            clearTimeout(roastInterval);
            needChangeData = o.mode && roastState !== o.mode || o[0] && roastState !== o[0].mode ? 1 : 0;
            if (needChangeData || need) {
                if (!o)
                    return roast.get(crossPage ? devideImg : imgobj, nowPage);
                if (o.length) {
                    _changeMod(o[0]);
                    _changeMod(o[1])
                } else
                    _changeMod(o)
            }
            if (!notChangeBar && !crossPage && bigScreenRoastMode) {
                o.data.sort(function(a, b) {
                    return b.good - a.good
                });
                o.hot = 0;
                var innerRoastInfo = template("roastInfoMod", o), node;
                roastBarContent.innerHTML = innerRoastInfo;
                if (o.total <=
                17)
                    addClass(roastBarContent.children[1], "hidden");
                else
                    removeClass(roastBarContent.children[1], "hidden");
                node = roastBarContent.children[0].children[0];
                transToY(node, -544 * o.roastBarGroup, 0)
            }
            if (o.length) {
                if (o[0] === "loading" || o[1] === "loading")
                    roast.get(devideImg, n);
                roastNum.innerHTML = +o[0].total + +o[1].total;
                if (o[0].next === -1 && o[1].next === -1)
                    return;
                if (o[0].stop)
                    if (o[1].stop)
                        return;
                    else
                        roast.run(o, n, 2);
                else if (o[1].stop)
                    roast.run(o, n, 1);
                else
                    roast.run(o, n, 3)
            } else {
                roastNum.innerHTML = o.total;
                if (o.next ===
                -1)
                    return;
                roast.run(o, n)
            }
        },
        stop: function() {
            addClass(document.body, "no-roast");
            clearTimeout(roastInterval)
        },
        change: function(direction, check) {
            if (roastState === 1)
                clearTimeout(roastInterval);
            var _tcChange = function(o) {
                var from = o.next, to = from + (ROAST_VIEW > o.len ? o.len : ROAST_VIEW) - (crossPage ? 0 : 1), i = from, arr = [], data = {}, innerRoast;
                if (from === -1)
                    return 1;
                for (; i < to; ++i)
                    arr.push(o.data[(i + o.len) % o.len]);
                Fade(o.wrap, 0, 1, 400);
                data.list = arr;
                innerRoast = template("roastChangeMod", data);
                o.wrap.innerHTML = innerRoast;
                o.next =
                to;
                o.hasChanged = 1
            }
            , _dmChange = function(o) {
                var total = o.len < ROAST_SIZE ? o.len : ROAST_SIZE
                  , _barNode = roastBarContent.children[0].children[0];
                if (!crossPage && total > 17 && bigScreenRoastMode)
                    transToY(_barNode, -544 * o.roastBarGroup, 500)
            }
            , _n = nowPage, _o = roastAll[_n], maxBarGroup, maxBarDmGroup;
            if (!_o)
                return;
            if (direction && bigScreenRoastMode)
                if (roastState === 1) {
                    maxBarGroup = ~~((_o.total <= ROAST_SIZE ? _o.total : ROAST_SIZE) / 17);
                    if (direction === 1) {
                        if (check && _o.roastBarGroup === maxBarGroup)
                            return 1;
                        _o.next = (_o.roastBarGroup === maxBarGroup ?
                        0 : _o.roastBarGroup + 1) * 17 - ROAST_VIEW + 1
                    } else if (direction === -1) {
                        if (check && _o.roastBarGroup === 0)
                            return 1;
                        _o.next = (_o.roastBarGroup === 0 ? 0 : _o.roastBarGroup - 1) * 17 - ROAST_VIEW + 1
                    }
                } else if (roastState === 2) {
                    maxBarDmGroup = ~~(_o.data.length / 17);
                    if (direction === -1)
                        _o.roastBarGroup += _o.roastBarGroup === 0 ? 0 : direction;
                    else if (direction === 1)
                        _o.roastBarGroup = _o.roastBarGroup === maxBarDmGroup ? 0 : _o.roastBarGroup + 1;
                    _dmChange(_o)
                }
            if (roastState === 1) {
                if (_o.length) {
                    _tcChange(_o[0]);
                    _tcChange(_o[1])
                } else
                    _tcChange(_o);
                roast.continued(_n,
                false, true)
            }
        }
    };
    if (icoBarChange)
        on(icoBarChange, mouse.click, function() {
            if (roastState === 0)
                return;
            roast.change()
        });
    if (!crossPage) {
        var changeBarRoastEnable = true, resetBarReset, roastDragTip = $$("roastDragTip"), hasBindDrag = false, doc = docEle, canDragMove = false;
        window.changeRoastByBar = function(direction, check) {
            if (changeBarRoastEnable) {
                changeBarRoastEnable = false;
                setTimeout(function() {
                    changeBarRoastEnable = true
                }, isMac ? 1E3 : 500);
                sendPgv("AC.VIEW.NEWEVENT.TC.QIEHUAN_RES");
                return roast.change(direction, check)
            }
        }
        ;
        roastDragMove =
        function(e) {
            e0 = e || window.event;
            if (e0.pageX == null  && e0.clientX != null ) {
                e0.pageX = e0.clientX + (doc && doc.scrollLeft || body && body.scrollLeft || 0) - (doc && doc.clientLeft || body && body.clientLeft || 0);
                e0.pageY = e0.clientY + (doc && doc.scrollTop || body && body.scrollTop || 0) - (doc && doc.clientTop || body && body.clientTop || 0)
            }
            anchor = {
                x: e0.pageX - 165 / 2,
                y: e0.pageY - 26 / 2
            };
            roastDragTip.style.cssText = "top:" + (~~anchor.y + 50) + "px;"
        }
        ;
        onHover(roastBarContent, function(e) {
            e0 = e || window.event;
            e = e || window.event;
            e = e.target || e.srcElement;
            var n = nowPage,
            total;
            if (!roastAll[n])
                return;
            total = roastAll[n].total;
            if (total > 17 && e.className !== "roast-bar-p-size") {
                addClass(roastBarWrap, "on-content-hover");
                if (!hasBindDrag) {
                    hasBindDrag = true;
                    roastBarContent.onmousemove = function(e) {
                        if (roastState === 1)
                            roastDragMove(e)
                    }
                }
            }
        }, function(e) {
            e = e || window.event;
            e = e.target || e.srcElement;
            if (e.className === "roast-mouse-bg")
                hasBindDrag = false;
            removeClass(roastBarWrap, "on-content-hover");
            roastDragTip.style.display = "none";
            roastDragTip.style.cssText = "top:-999px"
        });
        roastBarContent.onmousedown =
        function(e) {
            if (!changeBarRoastEnable)
                return;
            e = e || window.event;
            var tar = e.target || e.srcElement
              , n = nowPage
              , o = roastAll[n]
              , child = roastBarContent.children[0].children[0];
            if (!o || o.total <= 17 || !tar)
                return e.returnValue = false;
            if (e.which === 2 || !e.which && e.button === 4)
                return;
            addClass(roastBarContent.children[1], "hidden");
            clearTimeout(resetBarReset);
            clearTimeout(roastInterval);
            sendPgv("AC.VIEW.NEWDM.TUOZHUAI_ACT");
            var now = +new Date
              , from = {
                X: e.clientX,
                Y: e.clientY
            };
            roastBarContent.onmousemove = function(e) {
                e = e || window.event;
                var toY = from.Y - e.clientY
                  , loc = -544 * o.roastBarGroup - toY;
                loc = loc > 0 ? loc / 2 : loc;
                transToY(child, loc, 0)
            }
            ;
            roastBarContent.onmouseup = function(e) {
                e = e || window.event;
                var tar = e.target || e.srcElement;
                if (e.type === "mousemove" && (tar.tagName.toLowerCase() === "p" || tar.tagName.toLowerCase() === "span"))
                    return;
                var toY = from.Y - e.clientY
                  , diff = +new Date - now
                  , v = toY / diff
                  , reset = function() {
                    transToY(child, -544 * o.roastBarGroup, 300);
                    resetBarReset = setTimeout(function() {
                        roast.continued(n, false, true)
                    }, 1E3)
                }
                ;
                if (Math.abs(toY) > 120 || Math.abs(v) >
                1.4) {
                    if (changeRoastByBar(toY > 0 ? 1 : -1, true))
                        reset()
                } else
                    reset();
                setTimeout(function() {
                    removeClass(roastBarContent.children[1], "hidden")
                }, 250);
                roastBarContent.onmouseup = function() {}
                ;
                roastBarContent.onmousemove = function() {}
                ;
                roastBarWrap.onmousemove = function() {}
            }
            ;
            roastBarWrap.onmousemove = roastBarContent.onmouseup
        }
    }
    on(changeRoast, mouse.click, function() {
        if (roastState === 0)
            return;
        roast.change()
    });
    on(barrage, mouse.click, function() {
        if (roastState === 0)
            return;
        roast.changeMode(nowPage)
    });
    var roastModeChange = function() {
        sendPgv("AC.VIEW.NEWDM.YINCANG_BUTTON");
        if (+roastState) {
            cookie("roastState", "0", {
                path: "/",
                expires: 2
            });
            roastState = 0;
            roast.stop();
            hideRoastleadTips()
        } else {
            if (!bigScreenRoastMode)
                addClass(body, "roast-shrink");
            roastState = body.className.indexOf("roast-dm") === -1 ? 1 : 2;
            cookie("roastState", roastState, {
                path: "/",
                expires: 10
            });
            removeClass(body, "no-roast");
            clearTimeout(roastDelay);
            roastDelay = setTimeout(function() {
                if (roastState === 1)
                    roast.continued(nowPage);
                else
                    roast.get(imgobj, nowPage, 1)
            }, 100)
        }
    }
    ;
    on(roastMode, mouse.click, roastModeChange);
    if (icoBarOpen)
        on(icoBarOpen,
        mouse.click, roastModeChange);
    if (roastHide)
        on(roastHide, mouse.click, roastModeChange);
    if (icoBarShow)
        on(icoBarShow, mouse.click, roastModeChange);
    window.continueRoast = function() {
        removeClass(body, "set-roast");
        if (roastState && roastAll[nowPage])
            roast.continued(nowPage)
    }
    ;
    if (icoBarMode)
        on(icoBarMode, mouse.click, function() {
            if (roastState === 0)
                return;
            roast.changeMode(nowPage)
        });
    if (!crossPage) {
        on(turnToRoastDm, mouse.click, function() {
            if (roastState === 0)
                return;
            roast.changeMode(nowPage)
        });
        function updateLoadingList(n) {
            var i =
            0;
            nowLoadPic = 0;
            for (; i < max; ++i)
                loadingList[i] = i < PRELOAD_NUM + 1 ? direction * i + n : -direction * (i - PRELOAD_NUM) + n
        }
        function findPageNow(dis) {
            if (nowPage === undefined)
                return 0;
            var p = nowPage
              , _len = len;
            if (listTop[p] >= dis) {
                direction = -1;
                while (p > 0 && listTop[p] > dis)
                    p--
            } else {
                direction = 1;
                while (p < _len && listTop[p + 1] < dis)
                    p++
            }
            if (list[p + 1]) {
                if (dis < listTop[p + 1] / 2 + listTop[p] / 2)
                    p--
            } else if (dis < listTop[p] + imgList[_len - 1].offsetHeight / 2)
                p--;
            return p < 0 ? 0 : p
        }
        var loadRestInterval = null ;
        window.picShrink = false;
        var _loadPic = function() {
            var image =
            new Image
              , thisPage = loadingList[nowLoadPic];
            if (thisPage >= 0 && thisPage < len)
                if (!loadingState[thisPage] || loadingState[thisPage] === "pre-loading") {
                    loadingState[thisPage] = "loading";
                    (function(former) {
                        var listFormer = imgList[former]
                          , loadTimeout = setTimeout(function() {
                            var wrap = listFormer.parentNode
                              , before = listFormer.nextSibling.nextSibling
                              , newNode = document.createElement("img");
                            newNode.src = imgSrcList[former];
                            newNode.className = "network-slow";
                            wrap.removeChild(listFormer);
                            wrap.insertBefore(newNode, before)
                        }, 2E3);
                        image.onload =
                        function() {
                            image.onload = null ;
                            image = null ;
                            if (listFormer) {
                                clearTimeout(loadTimeout);
                                Fade(listFormer, 0, 1, 300);
                                listFormer.className = "loaded";
                                listFormer.src = imgSrcList[former]
                            }
                            loadingState[former] = "loaded";
                            loadNext();
                            if (former === len - 1) {
                                if (NEXT_CHAPTER)
                                    ajax.post({
                                        url: "/ComicView/getNextChapterPicture",
                                        data: "id=" + ID + "&cid=" + NEXT_CHAPTER,
                                        callback: function(data) {
                                            var data = JSON.parse(data);
                                            if (data.status === 2)
                                                (new Image).src = data.pic[0].url
                                        }
                                    });
                                ajax.post({
                                    url: "/ComicView/setPgvCountEx",
                                    data: "pgv=" + ++_pvgCount +
                                    "&eid=" + DATA.comic.eId
                                });
                                _pvgCount = 0
                            }
                            pvgCountAdd(imgPidList[former]);
                            if (!_isLoadFirstPic) {
                                otherData();
                                _isLoadFirstPic === true
                            }
                        }
                        ;
                        image.onerror = function() {
                            listFormer.className = "network-error";
                            listFormer.src = imgSrcList[former]
                        }
                    })(thisPage);
                    image.src = imgSrcList[thisPage]
                } else
                    loadNext();
            else {
                nowLoadPic++;
                if (nowLoadPic < max - 1)
                    _loadPic()
            }
        }
        ;
        function loadPictures() {
            clearTimeout(_intervalPvg);
            _intervalPvg = setTimeout(function() {
                if (typeof pgvMain === "function") {
                    pvRepeatCount = 1;
                    pgvMain({
                        statIframe: true,
                        repeatApplay: "true"
                    })
                }
            },
            1E3);
            clearTimeout(_intervalPreload);
            _intervalPreload = setTimeout(_loadPic, 70)
        }
        var line = 0
          , newLoad = function(lineFormer, next) {
            var forCache = new Image, i = len, nextFlag = false, nextPic;
            if (next) {
                while (loadingState[next] === "pre-loading" || loadingState[next] === "loaded")
                    next++;
                nextPic = next
            } else {
                while (i--) {
                    if (loadingState[i] === "loading")
                        return;
                    if (!nextFlag && loadingState[i]) {
                        nextFlag = true;
                        nextPic = i + 1
                    }
                }
                if (nextPic === len)
                    loadNext = function() {
                        nowLoadPic++;
                        if (nowLoadPic < max - 1)
                            _loadPic()
                    }
            }
            if (nextPic >= len)
                return;
            forCache.onload =
            function() {
                forCache.onload = null ;
                forCache = null ;
                if (lineFormer === line)
                    newLoad(lineFormer, nextPic + 1)
            }
            ;
            forCache.src = imgSrcList[nextPic];
            loadingState[nextPic] = "pre-loading"
        }
          , loadNext = function() {
            nowLoadPic++;
            if (nowLoadPic < max - 1)
                _loadPic();
            else {
                line++;
                newLoad(line)
            }
        }
        ;
        function getListOffsetTop() {
            var i = 0
              , _len = len;
            for (; i < _len; ++i)
                listTop[i] = list[i].offsetTop + _lowFixTop * i
        }
        window.maxPage = len;
        var _saveTopInterval, _checkCleanInterval, _loadInterval, _formerScrollTop;
        function handler(f) {
            if (!crossPage)
                comicHeight = comicContain.offsetHeight;
            var scrollTop = getScrollTop(), distance = scrollTop + osHeight, _close = jumpPrompt ? true : false, _nowPage, _saveTop = function() {
                var promptContinueRead = $$("promptContinueRead");
                if (!promptContinueRead)
                    _close = true;
                if (isLocalStorageNameSupported) {
                    window.localStorage.setItem(ID + "top", scrollTop);
                    if (!_close && scrollTop > 1E3) {
                        Fade(promptContinueRead, 1, 0, 200);
                        setTimeout(function() {
                            promptContinueRead.parentNode.removeChild(promptContinueRead);
                            promptContinueRead = null
                        }, 210);
                        _close = true
                    }
                }
            }
            , checkClean = function() {
                window._isbottom =
                comicHeight - scrollTop - osHeight < -400;
                if (scrollTop > 100 && !cleanMode && _formerScrollTop <= scrollTop && !window._isbottom) {
                    cleanMode = 1;
                    addClass(body, "fullscreen")
                } else if (window._isbottom) {
                    cleanMode = 0;
                    removeClass(body, "fullscreen")
                } else if (cleanMode && _formerScrollTop > scrollTop && Math.abs(_formerScrollTop - scrollTop) >= 550) {
                    cleanMode = 0;
                    removeClass(body, "fullscreen")
                }
                _formerScrollTop = scrollTop
            }
            ;
            clearTimeout(_checkCleanInterval);
            _checkCleanInterval = setTimeout(checkClean, 250);
            clearTimeout(_saveTopInterval);
            _saveTopInterval =
            setTimeout(_saveTop, 500);
            _loadInterval = setTimeout(function() {
                _nowPage = findPageNow(distance);
                if (_nowPage === nowPage)
                    return;
                nowPage = _nowPage;
                updateLoadingList(_nowPage);
                loadPictures();
                clearTimeout(roastDelay);
                if (roastState) {
                    clearTimeout(roastDelay);
                    roastDelay = setTimeout(function() {
                        roast.get(imgobj, nowPage)
                    }, 1E3)
                } else
                    roastNum.innerHTML = "--"
            }, f ? 0 : 120);
            if (bigScreenRoastMode && !window.picShrink) {
                addClass(body, "roast-right");
                removeClass(body, "roast-shrink")
            } else {
                addClass(body, "roast-right");
                addClass(body,
                "roast-shrink")
            }
        }
        var picShrinkCheck = false;
        window.goScalePic = function() {
            var i = 0, _len = len, _list = list, _o;
            for (; i < _len; ++i) {
                _o = imgobj[i];
                if (!_list)
                    return;
                _list[i].style.cssText = "width:" + adjustWidth(_o.width) * scaleRate + "px;height:" + adjustHeight(_o.width, _o.height) * scaleRate + "px;";
                if (!picShrinkCheck && _o.width >= 1200)
                    window.picShrink = true
            }
            getListOffsetTop();
            handler()
        }
        ;
        for (; i < len; ++i) {
            _o = imgobj[i];
            imgSrcList[i] = _o.url;
            imgPidList[i] = _o.pid;
            if (+_o.width < 300) {
                imgobj[i].height = 300 / +_o.width * +_o.height >> 0;
                imgobj[i].width =
                300
            }
        }
        if (isLocalStorageNameSupported)
            scaleRate = +window.localStorage.getItem(ID + "scale") || 1;
        _o = {
            firstPicState: window.loadedFirstPic,
            list: imgobj,
            aH: adjustHeight,
            aW: adjustWidth,
            top: DATA.ads.top,
            bottom: DATA.ads.bottom
        };
        if (window.loadedFirstPic) {
            loadingState[0] = +new Date;
            _pvgCount++;
            setTimeout(function() {
                if (IS_VIP)
                    ajax.post({
                        url: "/ComicView/setVipPgvCount",
                        data: "id=" + ID + "&cid=" + CID + "&pid=" + imgPidList[0]
                    });
                if (typeof pgvMain === "function") {
                    pvRepeatCount = 1;
                    pgvMain({
                        statIframe: true,
                        repeatApplay: "true"
                    })
                }
            }, 200);
            otherData()
        }
        innerUl = template("comicContainMod", _o);
        comicContain.innerHTML = innerUl
    } else {
        var wrapWidth = osWidth * 0.44, devideImg = [], isFirstBlock = true, goPage, _tmpArr = [], _tmp;
        moveWidth = ~~(osWidth * 0.88 + 1);
        handler = function() {}
        ;
        var cubicCurve = {}, trans, _curve, setCubic = function(a, b, c, d) {
            cubicCurve.A = a;
            cubicCurve.B = b;
            cubicCurve.C = c;
            cubicCurve.D = d
        }
        ;
        setCubic(0.25, 0.1, 0.25, 1);
        if (cssCore !== "") {
            comicContainCross[cssCore + "TransitionTimingFunction"] = "cubic-bezier(" + cubicCurve.A + "," + cubicCurve.B + "," + cubicCurve.C + "," +
            cubicCurve.D + ")";
            trans = function(o, x, y, t, a) {
                var s = o.style
                  , c = "translate(" + x + "px," + y + "px) translateZ(0)";
                s[cssCore + "TransitionDuration"] = t + "ms";
                if (a && a.scale)
                    c += t === 0 ? " scale(" + a.scale[0] + ")" : " scale(" + a.scale[1] + ")";
                if (a && a.rotate)
                    c += t === 0 ? " rotate(" + a.rotate[0] + "deg)" : " rotate(" + a.rotate[1] + "deg)";
                s[cssCore + "TransformOrigin"] = "50% 50%";
                s[cssCore + "Transform"] = c
            }
        } else {
            _curve = new UnitBezier(cubicCurve.A,cubicCurve.B,cubicCurve.C,cubicCurve.D);
            trans = function(o, x, y, t, e) {
                var cs = o.currentStyle, s = o.style,
                cx = parseInt(s.left || cs.left || 0, 10), cy = parseInt(s.top || cs.top || 0, 10), dx = x - cx, dy = y - cy, ft = +new Date, end = ft + t, pos = 0, diff, _trans = function() {
                    if (+new Date > end) {
                        s.left = x + "px";
                        s.top = y + "px";
                        if (e)
                            s.filter = "alpha(opacity=" + 100 * e[1] + ")";
                        return 0
                    } else {
                        diff = end - new Date;
                        pos = diff / t;
                        pos = _curve.solve(1 - pos, UnitBezier.prototype.epsilon);
                        s.left = cx + dx * pos + "px";
                        s.top = cy + dy * pos + "px";
                        if (e)
                            s.filter = "alpha(opacity=" + ~~(100 * (e[1] * pos - e[0] * (1 - pos))) + ")"
                    }
                    return 1
                }
                , _requestTrans = function() {
                    requestAnimationFrame(function() {
                        if (_trans())
                            _requestTrans()
                    })
                }
                ;
                _requestTrans()
            }
        }
        window.trans = trans;
        _tmp = imgobj[0];
        if (_tmp.width < _tmp.height)
            _tmpArr[0] = 1;
        else
            _tmpArr[0] = 2;
        _tmpArr[1] = _tmp;
        if (DATA.chapter.blankFirst === 1 && IS_JAPAN) {
            _tmpArr[2] = imgobj[1];
            _tmpArr[0] = 4
        }
        devideImg.push(_tmpArr);
        _tmpArr = [];
        for (i = devideImg[0][2] ? 2 : 1; i < len - 1; ++i) {
            _tmp = imgobj[i];
            if (+_tmp.width < +_tmp.height) {
                if (isFirstBlock) {
                    _tmpArr[0] = 0;
                    _tmpArr[1] = _tmp
                } else {
                    _tmpArr[2] = _tmp;
                    devideImg.push(_tmpArr);
                    _tmpArr = []
                }
                isFirstBlock = !isFirstBlock
            } else {
                if (!isFirstBlock) {
                    _tmpArr[0] = 6;
                    devideImg.push(_tmpArr);
                    _tmpArr = []
                }
                _tmpArr[0] = 5;
                _tmpArr[1] = _tmp;
                devideImg.push(_tmpArr);
                _tmpArr = [];
                isFirstBlock = true
            }
        }
        if (imgobj.length > 1) {
            _tmp = imgobj[len - 1];
            if (_tmp.width < _tmp.height) {
                if (isFirstBlock) {
                    _tmpArr[0] = 3;
                    _tmpArr[1] = _tmp
                } else {
                    _tmpArr[0] = 4;
                    _tmpArr[2] = _tmp
                }
                devideImg.push(_tmpArr);
                _tmpArr = []
            } else {
                if (!isFirstBlock) {
                    _tmpArr[0] = 6;
                    devideImg.push(_tmpArr);
                    _tmpArr = []
                }
                _tmpArr[0] = 7;
                _tmpArr[1] = _tmp;
                devideImg.push(_tmpArr);
                _tmpArr = [];
                isFirstBlock = true
            }
            _tmpArr = []
        }
        if (IS_JAPAN) {
            crossPageTo = crossPageTo === "max" ? 0 : crossPageTo;
            crossPageTo =
            crossPageTo === "new" ? devideImg.length - 1 : crossPageTo;
            nowPage = devideImg.length - 1;
            devideImg.reverse()
        } else {
            crossPageTo = crossPageTo === "max" ? devideImg.length - 1 : crossPageTo;
            crossPageTo = crossPageTo === "new" ? 0 : crossPageTo;
            nowPage = 0
        }
        _o = {
            firstPicState: window.loadedFirstPic,
            list: devideImg,
            cTitle: DATA.chapter.cTitle,
            title: DATA.comic.title,
            width: moveWidth,
            height: osHeight + (cleanMode || fullMode ? 0 : -97),
            ad: DATA.ads.top
        };
        window.comicContainReset = function() {
            comicContainCross.style.width = adjustWidth() * devideImg.length +
            1 + "px";
            comicContainCross.style.height = adjustHeight() + "px";
            comicContainCross.parentNode.style.width = adjustWidth() + "px";
            comicContainCross.parentNode.style.height = adjustHeight() + "px"
        }
        ;
        innerUl = template("comicContainModCross", _o);
        comicContainReset();
        comicContainCross.innerHTML = innerUl
    }
    if (!crossPage) {
        list = makeArray(comicContain.children);
        imgList = makeArray(comicContain.getElementsByTagName("img"));
        _len = list.length;
        for (i = 0; i < _len; ++i)
            if (list[i].className) {
                list.splice(i, 1);
                imgList.splice(i, 1);
                _len--;
                i--
            }
        getListOffsetTop();
        handler(true)
    } else {
        list = makeArray(comicContainCross.children);
        imgList = makeArray(comicContainCross.getElementsByTagName("img"));
        window.maxPage = list.length - 1;
        var lineInterval = null
          , maxLoad = devideImg.length - 1
          , isJapanComic = IS_JAPAN
          , linePic = isJapanComic ? maxLoad - 2 : 2
          , startNewLoad = function(timeout, n) {
            clearTimeout(lineInterval);
            if (n)
                linePic = n;
            lineInterval = setTimeout(newLoad, timeout ? timeout : 100)
        }
          , newLoad = function() {
            var _thisPreload = devideImg[linePic]
              , _loadNow = 1
              , _loadNext = function() {
                var _o = new Image;
                if (!_thisPreload)
                    return;
                if (_loadNow < _thisPreload.length) {
                    _o.onload = function() {
                        _o.onload = null ;
                        _o = null ;
                        _loadNext()
                    }
                    ;
                    _o.src = _thisPreload[_loadNow++].url
                } else {
                    linePic += isJapanComic ? -1 : 1;
                    startNewLoad()
                }
            }
            ;
            if (linePic < 0 && isJapanComic || !isJapanComic && linePic > maxLoad) {
                startNewLoad = function() {}
                ;
                return
            }
            if (loadingState[linePic]) {
                linePic += isJapanComic ? -1 : 1;
                startNewLoad(20);
                return
            }
            _loadNext()
        }
        ;
        if (IS_JAPAN)
            loadingState[list.length - 1] = "loaded";
        else
            loadingState[0] = "loaded";
        window.devideImg = devideImg;
        goPage = function(max, t) {
            var toolPageNow =
            $$("toolPageNow")
              , _close = jumpPrompt ? true : false
              , cl = $$("crossLeft")
              , cr = $$("crossRight")
              , state = 0
              , needPrompt = cookie("needPrompt")
              , canRead = DATA.chapter.canRead
              , local = window.localStorage
              , session = window.sessionStorage
              , sessionHistory = session && session.getItem(ID)
              , comicContain = $$("comicContain")
              , turnNextChapter = function(id, title) {
                if (!canRead)
                    return;
                if (needPrompt)
                    return function(n) {
                        if (n === -1)
                            window.location.href = makeUrl(ID, PREV_CHAPTER) + "?page=max";
                        else if (n === 1)
                            window.location.href = makeUrl(ID, NEXT_CHAPTER,
                            1)
                    }
                    ;
                else {
                    window.closePrompt = function() {
                        pageChangePrompt = false;
                        chapterChangePrompt.style.display = "none"
                    }
                    ;
                    window.localTo = function(n) {
                        var x = $$("promptCheck").checked;
                        if (x)
                            cookie("needPrompt", "1", {
                                path: "/",
                                expires: 2
                            });
                        if (n === -1)
                            window.location.href = makeUrl(ID, PREV_CHAPTER) + "?page=max";
                        else if (n === 1)
                            window.location.href = makeUrl(ID, NEXT_CHAPTER)
                    }
                    ;
                    return function(n) {
                        var chapterChangePrompt = $$("chapterChangePrompt"), innerPrompt, data = {
                            title: title,
                            id: id,
                            turnTitle: n === -1 ? PREV_CHAPTER_NAME : NEXT_CHAPTER_NAME,
                            turnState: n === -1 ? "\u56de\u5230\u4e0a" : "\u8fdb\u5165\u4e0b",
                            turnTo: n
                        };
                        pageChangePrompt = true;
                        innerPrompt = template("chapterChangePromptMod", data);
                        chapterChangePrompt.innerHTML = innerPrompt;
                        chapterChangePrompt.style.display = "block";
                        sendPgv(n === -1 ? "AC.VIEW.NEWEVENT.DUIYE.ERRO_PREV" : "AC.VIEW.NEWEVENT.DUIYE.ERRO_NEXT")
                    }
                }
            }(ID, DATA.chapter.cTitle)
              , putPicIn = function(o) {
                if (o.getAttribute("data-src"))
                    o.src = o.getAttribute("data-src");
                clearTimeout(lineInterval)
            }
              , checkList = function(n, str) {
                var f = 0, img, len, o;
                if (n >
                max || n < 0)
                    return;
                o = list[n];
                if (str)
                    o.className = str;
                else {
                    o.removeAttribute("class");
                    o.removeAttribute("className")
                }
                if (loadingState[n]) {
                    startNewLoad(200, n);
                    if (loadingState === "loaded")
                        return
                }
                img = o.getElementsByTagName("img");
                len = img.length;
                if (len === 1) {
                    img[0].onload = function() {
                        this.removeAttribute("data-src");
                        loadingState[n] = "loaded";
                        startNewLoad(200, nowPage)
                    }
                    ;
                    putPicIn(img[0])
                } else {
                    img[0].onload = img[1].onload = function() {
                        this.removeAttribute("data-src");
                        if (f === 0)
                            return f++;
                        loadingState[n] = "loaded";
                        startNewLoad(200,
                        nowPage)
                    }
                    ;
                    putPicIn(img[0]);
                    putPicIn(img[1])
                }
            }
              , updateActive = function(old, now) {
                if (Math.abs(old - now) === 1) {
                    checkList(2 * old - now, "");
                    checkList(2 * now - old, "active")
                } else {
                    checkList(old + 1, "");
                    list[old].className = "";
                    checkList(old - 1, "");
                    checkList(now + 1, "active");
                    checkList(now, "active");
                    checkList(now - 1, "active")
                }
            }
              , checkChapterState = function(_state) {
                if (_state !== state && state || _state === -1)
                    switch (state) {
                    case 1:
                        removeClass(cl, "prev-chapter");
                        break;
                    case 2:
                        removeClass(cr, "next-chapter");
                        break;
                    case 3:
                        removeClass(cr, "prev-chapter");
                        break;
                    case 4:
                        removeClass(cl, "next-chapter");
                        break;
                    case 5:
                    case 6:
                    case 7:
                    case 8:
                        removeClass(cl, "no-chapter");
                        removeClass(cr, "no-chapter");
                        break;
                    default:
                        break
                    }
            }
            ;
            return function(n) {
                var _state;
                if (!goPageEnable)
                    return;
                goPageEnable = false;
                setTimeout(function() {
                    goPageEnable = true
                }, 300);
                var _t;
                if (n < 0 && !isJapanComic || n > max && isJapanComic) {
                    if (+PREV_CHAPTER)
                        turnNextChapter(-1);
                    else
                        noPrev();
                    return trans(comicContainCross, -nowPage * moveWidth, 0, 300)
                }
                if (n > max && !isJapanComic || n < 0 && isJapanComic) {
                    if (+NEXT_CHAPTER)
                        window.location.href =
                        makeUrl(ID, NEXT_CHAPTER, 1);
                    else
                        noMore();
                    return trans(comicContainCross, -nowPage * moveWidth, 0, 300)
                }
                toolPageListChildren && (toolPageListChildren[isJapanComic ? max - nowPage : nowPage].className = "");
                updateActive(nowPage, n);
                trans(comicContainCross, -n * moveWidth, 0, t ? t : 300);
                nowPage = n;
                _t = isJapanComic ? max - n : n;
                toolPageListChildren && (toolPageListChildren[_t].className = "now-reading");
                if (_t === max - 1 && NEXT_CHAPTER)
                    ajax.post({
                        url: "/ComicView/getNextChapterPicture",
                        data: "id=" + ID + "&cid=" + NEXT_CHAPTER,
                        callback: function(data) {
                            var data =
                            JSON.parse(data);
                            if (data.status === 2)
                                (new Image).src = data.pic[0].url
                        }
                    });
                if (local && sessionHistory)
                    window.localStorage.setItem(ID + "page", nowPage);
                if (_t === 0)
                    if (PREV_CHAPTER)
                        if (IS_JAPAN) {
                            checkChapterState(3);
                            addClass(cr, "prev-chapter");
                            state = 3
                        } else {
                            checkChapterState(1);
                            addClass(cl, "prev-chapter");
                            state = 1
                        }
                    else if (IS_JAPAN) {
                        checkChapterState(7);
                        addClass(cr, "no-chapter");
                        state = 7
                    } else {
                        checkChapterState(5);
                        addClass(cl, "no-chapter");
                        state = 5
                    }
                else if (_t === max)
                    if (NEXT_CHAPTER)
                        if (IS_JAPAN) {
                            checkChapterState(4);
                            addClass(cl, "next-chapter");
                            state = 4
                        } else {
                            checkChapterState(2);
                            addClass(cr, "next-chapter");
                            state = 2
                        }
                    else if (IS_JAPAN) {
                        checkChapterState(8);
                        addClass(cl, "no-chapter");
                        state = 8
                    } else {
                        checkChapterState(6);
                        addClass(cr, "no-chapter");
                        state = 6
                    }
                else if (state) {
                    checkChapterState(-1);
                    state = 0
                }
                if (!_close && _t > 1) {
                    var promptContinueRead = $$("promptContinueRead");
                    if (!promptContinueRead)
                        _close = true;
                    if (window.localStorage && !_close) {
                        Fade(promptContinueRead, 1, 0, 200);
                        setTimeout(function() {
                            try {
                                promptContinueRead.parentNode.removeChild(promptContinueRead);
                                promptContinueRead = null
                            } catch (e) {}
                        }, 210);
                        _close = true
                    }
                }
                _t = _t / max;
                _t = _t > 0.5 ? _t + 8 / max : _t - 4 / max;
                scrollToolPage && scrollToolPage.set(_t);
                setTimeout(function() {
                    var nowPageNum = isJapanComic ? max - n + 1 : n + 1;
                    nowPageNum = nowPageNum < 10 && max > 9 ? "0" + nowPageNum : nowPageNum;
                    toolPageNow.innerHTML = nowPageNum + "/" + (max + 1)
                }, t);
                if (roastState) {
                    clearTimeout(roastDelay);
                    roastDelay = setTimeout(function() {
                        roast.get(devideImg, n)
                    }, 1E3)
                } else
                    roastNum.innerHTML = "--";
                for (var i = 0; i < devideImg[n].length - 1; ++i) {
                    pvgCountAdd(devideImg[n][i + 1]["pid"]);
                    if (typeof pgvMain === "function")
                        pgvMain({
                            statIframe: true,
                            repeatApplay: "true"
                        })
                }
            }
        }(list.length - 1);
        on($$("crossLeft"), mouse.down, function() {
            sendPgv(IS_JAPAN ? "AC.VIEW.NEWEVENT.DUIYE.PAGENEXT" : "AC.VIEW.NEWEVENT.DUIYE.PAGEPREV");
            goPage(nowPage - 1)
        });
        on($$("crossRight"), mouse.down, function() {
            sendPgv(IS_JAPAN ? "AC.VIEW.NEWEVENT.DUIYE.PAGEPREV" : "AC.VIEW.NEWEVENT.DUIYE.PAGENEXT");
            goPage(nowPage + 1)
        });
        !function() {
            goPageEnable = true;
            window.goPage = goPage;
            goPage(nowPage, 0);
            if (+crossPageTo === 0) {
                if (IS_JAPAN) {
                    goPageEnable =
                    true;
                    goPage(0, 0)
                }
            } else if (crossPageTo) {
                goPageEnable = true;
                goPage(+crossPageTo, 0)
            }
        }();
        var scalePicTimeout = null ;
        window.goScalePic = function() {
            clearTimeout(scalePicTimeout);
            scalePicTimeout = setTimeout(function() {
                var i = 0, _len = len, _list = list, w, h, _o, _p, _w, _h, _f, _s, _tw, _th;
                osWidth = docEle.clientWidth || window.innerWidth;
                moveWidth = ~~(osWidth * 0.88 + 1);
                trans(comicContainCross, -nowPage * moveWidth, 0, 0);
                comicContainReset();
                for (; i < _len; ++i) {
                    _o = imgobj[i];
                    if (!_list[i])
                        break;
                    _list[i].style.cssText = "width:" + adjustWidth(_o.width) +
                    "px;height:" + adjustHeight(_o.width, _o.height) + "px;"
                }
                _len = imgList.length;
                while (_len--) {
                    _o = imgList[_len];
                    _p = _o.parentNode;
                    _f = _p.parentNode;
                    _w = +_o.getAttribute("data-w");
                    _h = +_o.getAttribute("data-h");
                    _s = _f.className === "all" ? 1 : 0;
                    w = +_f.offsetWidth;
                    h = +_f.offsetHeight;
                    _tw = ~~(_w / _h * h);
                    _th = ~~(_h / _w * w);
                    if (w / h < _w / _h && !_s)
                        _p.style.cssText = "width:99.5%;height:" + _th + "px;top:50%;margin-top:-" + _th / 2 + "px";
                    else {
                        if (_h <= h) {
                            _p.style.cssText = "width:" + _w + "px;height:" + _h + "px;";
                            _tw = _w;
                            _th = _h;
                            _p.style.marginTop = (h - _h) / 2 + "px"
                        } else {
                            _p.style.cssText =
                            "width:" + _tw + "px;height:" + h + "px;";
                            _th = h
                        }
                        if (_s) {
                            _p.style.marginLeft = -_tw / 2 + "px";
                            _p.style.marginTop = -_th / 2 + "px"
                        }
                    }
                }
            }, 100)
        }
    }
    !function() {
        if (crossPage) {
            var i = 0, len = devideImg.length, pagerBtn = $$("pagerBtn"), toolPageList = $$("toolPageList"), toolPageListWrap = $$("toolPageListWrap"), toolPageScrollBg = $$("toolPageScrollBg"), toolPageScrollBlock = $$("toolPageScrollBlock"), toolPage = $$("toolPage"), toolPageClose = $$("toolPageClose"), toolPageListHtml = "", s = toolPage.style, _ia, _ib, hideToolPageList = function() {
                s.display = ""
            }
            ,
            toogleToolPageList = function() {
                var i = 0, len = devideImg.length, _o = toolPageListChildren, _t;
                if (s.display === "block")
                    s.display = "";
                else {
                    s.display = "block";
                    scrollToolPage.init(osWidth, osHeight)
                }
            }
            ;
            for (i = 0; i < len; ++i) {
                _ia = IS_JAPAN ? len - i - 1 : i;
                _ib = i < 9 && len > 9 ? "0" + (i + 1) : i + 1;
                toolPageListHtml += '<li><a href="javascript:void(0)" onclick=goPage(' + _ia + ");return false;>" + _ib + "</a></li>"
            }
            toolPageList.innerHTML = toolPageListHtml;
            pagerBtn.onclick = toogleToolPageList;
            toolPageClose.onclick = hideToolPageList;
            toolPageListChildren = $$("toolPageList").children;
            scrollToolPage = ScrollBar({
                contain: toolPageList,
                wrap: toolPageListWrap,
                scrollBg: toolPageScrollBg,
                scrollBlock: toolPageScrollBlock,
                heightFix: osHeight < 400 ? osHeight - 150 : 400,
                scrollBarHeightDiff: 0
            });
            scrollToolPage.init(osWidth, osHeight);
            addClass(toolPageListChildren[IS_JAPAN ? len - nowPage : nowPage], "now-reading")
        }
    }();
    _len = imgList.length;
    while (_len--) {
        _o = imgList[_len];
        _o.ondragstart = function() {
            return false
        }
        ;
        _o.onselectstart = function() {
            return false
        }
        ;
        _o.parentNode.onselectstart = function() {
            return false
        }
        ;
        _o.parentNode.ondragstart =
        function() {
            return false
        }
    }
    function otherData() {
        var _o = $$("catalogueList").getElementsByTagName("li"), len = _o.length, i = 0, thisStep;
        for (; i < len; ++i)
            if (_o[i].className) {
                thisStep = i / len;
                thisStep = thisStep > 0.5 ? thisStep + 8 / len : thisStep - 4 / len;
                if (i < len - 1)
                    NEXT_CHAPTER_NAME = _o[i + 1].children[0].title;
                if (i > 0)
                    PREV_CHAPTER_NAME = _o[i - 1].children[0].title;
                break
            }
        var nextInfo = $$("nextInfo");
        if (nextInfo)
            nextInfo.innerHTML = DATA.comic.isFinish && !NEXT_CHAPTER ? "\u5df2\u5b8c\u7ed3" : NEXT_CHAPTER_NAME ? '<a href="' + makeUrl(ID, NEXT_CHAPTER) +
            '">\u4e0b\u4e00\u8bdd ' + NEXT_CHAPTER_NAME + "</a>" : "\u672a\u5b8c\u5f85\u7eed...";
        scrollCatalogue.init(osWidth, osHeight);
        scrollCatalogue.set(thisStep);
        _thisStep = thisStep;
        if (!crossPage) {
            var recommendMode = cookie("recommendMode");
            // scrollRecommand.init(osWidth, osHeight);
            window.recommendHasSet = recommendMode ? true : false;
            if (recommendMode === "1")
                removeClass(recommendStack, "hidden");
            else
                removeClass(recommend, "hidden");
            // $$("recommendFadeOut").onclick = function() {
            //     addClass(recommend, "hidden");
            //     removeClass(recommendStack,
            //     "hidden");
            //     cookie("recommendMode", "1", {
            //         path: "/",
            //         expires: 2
            //     });
            //     sendPgv("AC.VIEW.NEWEVENT.AD_LEFTOFF")
            // }
            // ;
            // recommendStack.onclick = function() {
            //     Fade(recommend, 0, 1, 200);
            //     addClass(recommendStack, "hidden");
            //     removeClass(recommend, "hidden");
            //     cookie("recommendMode", "2", {
            //         path: "/",
            //         expires: 2
            //     });
            //     scrollRecommand.init(osWidth, osHeight);
            //     sendPgv("AC.VIEW.NEWEVENT.AD_LEFTON")
            // }
        } else {
            if (osWidth < 1500)
                addClass(recommendStack, "hidden");
            else
                removeClass(recommendStack, "hidden");
            recommendStack.onclick = function() {
                var recommendForCrossPage =
                $$("recommendForCrossPage")
                  , rs = recommendForCrossPage.style;
                if (rs.display === "block") {
                    rs.display = "none";
                    recommendForCrossPage.src = "javascript:void(0)"
                } else {
                    recommendForCrossPage.src = "/ComicView/showCrossPageRecommend/id/" + ID;
                    window.recommendStackOpen = function() {
                        rs.display = "block";
                        Fade(recommendForCrossPage, 0, 1, 400)
                    }
                    ;
                    window.recommendStackClose = function() {
                        rs.display = "none";
                        recommendForCrossPage.src = "javascript:void(0)"
                    }
                }
                sendPgv("AC.VIEW.NEWEVENT.DUIYE.AD_LEFTON")
            }
        }
        hotPgv("adTop", "AC.VIEW.NEWEVENT.AD_PICCONTENT1");
        hotPgv("adBottom", "AC.VIEW.NEWEVENT.AD_PICCONTENT2");
        $$("catalogueList").onmousedown = function(e) {
            e = e || window.event;
            e = e.target || e.srcElement;
            if (e.tagName.toLowerCase() !== "a")
                e = e.parentNode;
            if (e.tagName.toLowerCase() === "a")
                sendPgv("AC.VIEW.NEWEVENT.CATALOGUELIST")
        }
        ;
        checkScreenMode()
    }
    setTimeout(function() {
        if (!_isLoadFirstPic) {
            otherData();
            _isLoadFirstPic === true
        }
    }, 500);
    if (osWidth < 700)
        addClass(body, "mobile-device");
    else if (!mobileDevice)
        removeClass(body, "mobile-device");
    if (!crossPage) {
        var comicHeight = comicContain.offsetHeight;
        if (checkScrollChange) {
            mainView.style.height = osHeight - 120 + "px";
            on(mainView, "scroll", handler)
        } else
            on(window, "scroll", handler);
        window.onresize = function() {
            clearInterval(_intervalResize);
            _intervalResize = setTimeout(function() {
                osWidth = docEle.clientWidth || window.innerWidth;
                osHeight = docEle.clientHeight || window.innerHeight;
                checkScreenMode();
                if (checkScrollChange)
                    mainView.style.height = osHeight - 120 + "px";
                if (!recommendHasSet)
                    if (osWidth < 1160) {
                        addClass(recommend, "hidden");
                        removeClass(recommendStack, "hidden")
                    } else {
                        addClass(recommendStack,
                        "hidden");
                        removeClass(recommend, "hidden")
                    }
                if (osWidth < 700)
                    addClass(body, "mobile-device");
                else if (!mobileDevice)
                    removeClass(body, "mobile-device");
                bigScreenRoastMode = !mobileDevice && osWidth > 1399 && osHeight > 850 ? 1 : 0;
                comicHeight = comicContain.offsetHeight;
                setBaseView(osWidth, osHeight);
                getListOffsetTop();
                handler()
            }, 200)
        }
    } else
        window.onresize = function() {
            clearInterval(_intervalResize);
            _intervalResize = setTimeout(function() {
                osWidth = docEle.clientWidth || window.innerWidth;
                osHeight = docEle.clientHeight || window.innerHeight;
                moveWidth = ~~(osWidth * 0.88 + 1);
                checkScreenMode();
                if (osWidth < 1500)
                    addClass(recommendStack, "hidden");
                else
                    removeClass(recommendStack, "hidden");
                setBaseView(osWidth, osHeight)
            }, 100)
        }
        ;
    goScalePic();
    window.getRoastData = function(s) {
        var sequenceArr = s.split("-")
          , t = roastAll[+sequenceArr[0]];
        return crossPage ? t.length ? t[+sequenceArr[1]].data[+sequenceArr[2]] : t.data[+sequenceArr[2]] : t.data[+sequenceArr[1]]
    }
    ;
    window.getRoastList = function(n) {
        return crossPage === 1 ? roastAll[n][0].wrap.previousSibling.previousSibling : roastAll[n].wrap.previousSibling.previousSibling
    }
}();
!function() {
    var ic = $$("iconFavourite")
      , icn = $$("iconFavouriteNext")
      , af = $$("addFavourites")
      , fs = $$("favState")
      , refreshView = function(x) {
        var p = ic && ic.parentNode
          , pn = icn && icn.parentNode
          , ifp = $$("iconFavouritePro")
          , ifn = $$("iconFavouriteProNext");
        if (x) {
            fs.innerHTML = "\u5df2\u6536\u85cf";
            if (ifp) {
                ifp.innerHTML = "\u5df2\u6536\u85cf";
                removeClass(p, "main_control_button_normal");
                addClass(p, "main_control_button_trigger")
            }
            if (ifn) {
                ifn.innerHTML = "\u5df2\u6536\u85cf";
                removeClass(pn, "main_control_button_normal");
                addClass(pn,
                "main_control_button_trigger")
            }
        } else {
            fs.innerHTML = "\u6dfb\u52a0\u6536\u85cf";
            if (ifp) {
                ifp.innerHTML = "\u6536\u85cf";
                removeClass(p, "main_control_button_trigger");
                addClass(p, "main_control_button_normal")
            }
            if (ifn) {
                ifn.innerHTML = "\u6536\u85cf";
                removeClass(pn, "main_control_button_trigger");
                addClass(pn, "main_control_button_normal")
            }
        }
    }
    ;
    window.refreshView = refreshView
}();
!function() {
    var html = ""
      , data = {};
    var bs = $$("bookshelf")
      , bc = $$("bookshelfContain")
      , bn = $$("bookshelfNum")
      , fst = $$("favCount")
      , collectMove = function(e, clientX, clientY) {
        var bookshelf = $$("bookshelf"), smallHeart = $$("smallHeart"), smallHeartStyle = smallHeart.style, start = {}, end = {}, cruveY = new UnitBezier(0.09,0.6,0.63,0.98), doc = docEle, getRect = function(ele) {
            var rect = ele.getBoundingClientRect()
              , top = doc.clientTop
              , left = doc.clientLeft;
            return {
                top: rect.top - top,
                bottom: rect.bottom - top,
                left: rect.left - left,
                right: rect.right -
                left
            }
        }
        , animationTime = 600, timeStamp, endTime, move, _requestMove;
        e = e || window.event;
        if (e.pageX == null  && clientX != null ) {
            e.pageX = clientX + (doc && doc.scrollLeft || body && body.scrollLeft || 0) - (doc && doc.clientLeft || body && body.clientLeft || 0);
            e.pageY = clientY + (doc && doc.scrollTop || body && body.scrollTop || 0) - (doc && doc.clientTop || body && body.clientTop || 0)
        }
        start = {
            x: e.pageX - smallHeart.offsetWidth / 2,
            y: e.pageY - smallHeart.offsetHeight / 2
        };
        end = {
            x: getRect(bookshelf).left + (doc && doc.scrollLeft || body && body.scrollLeft || 0),
            y: getRect(bookshelf).top +
            (doc && doc.scrollTop || body && body.scrollTop || 0)
        };
        end.y = end.y < 0 ? 0 : end.y;
        diff = {
            x: end.x - start.x,
            y: end.y - start.y
        };
        move = function() {
            var percent = (new Date - timeStamp) / animationTime
              , pFix = 1;
            percent = percent > 1 ? 1 : percent;
            if (percent === 1) {
                smallHeartStyle.cssText = "";
                return 0
            }
            pFix = cruveY.solve(percent, 0.0010);
            smallHeartStyle.cssText = "top:" + ~~(start.y + diff.y * pFix) + "px;left:" + ~~(start.x + diff.x * percent) + "px;opacity:" + ~~(140 - percent * 100) / 100 + ";width:" + ~~(40 - 30 * percent) + "px;height:" + ~~(40 - 30 * percent) + "px;";
            return 1
        }
        ;
        _requestMove =
        function() {
            requestAnimationFrame(function() {
                if (move())
                    _requestMove()
            })
        }
        ;
        smallHeartStyle.cssText = "top:" + start.y + "px;left:" + start.x + "px;";
        timeStamp = +new Date;
        endTime = timeStamp + animationTime,
        _requestMove()
    }
    ;
    $$("catalogueTitle").innerHTML = "\u300a" + DATA.comic.title + "\u300b\u76ee\u5f55";
    var o = DATA.comic, c = DATA.chapter, newRecord = [o.id, o.title, c.cid, c.cTitle, +c.cSeq], recordList = JSON.parse(cookie("readRecord")) || [], recordLastList = JSON.parse(cookie("readLastRecord")) || [], total = recordList.length, lastTotal = recordLastList.length,
    i = 0, j = 0, k = 0, newRecordList, newRecordLastList, hasPromptNext = false;
    if (total)
        for (; j < total; ++j)
            if (recordList[j][0] === ID && recordList[j][2] === CID) {
                hasPromptNext = true;
                break
            }
    if (total)
        for (; i < total; ++i)
            if (o.id === recordList[i][0]) {
                recordList.splice(i, 1);
                break
            }
    if (lastTotal)
        for (; k < lastTotal; ++k)
            if (o.id === recordLastList[k][0]) {
                recordLastList.splice(k, 1);
                break
            }
    recordList.unshift(newRecord);
    recordList.splice(20);
    newRecordList = JSON.stringify(recordList);
    newRecordLastList = JSON.stringify(recordLastList);
    cookie("readRecord",
    newRecordList, {
        path: "/",
        expires: 30
    });
    cookie("readLastRecord", newRecordLastList, {
        path: "/",
        expires: 30
    });
    var promptTop = $$("promptTop");
    if (!hasPromptNext && window.location.href.indexOf("fromPrev") !== -1) {
        if (window.isTipPrompting)
            return;
        window.isTipPrompting = true;
        promptTop.style.display = "block";
        promptTop.className = "prompt-top prompt-next";
        Fade(promptTop, 0, 1, 200);
        setTimeout(function() {
            promptTop.style.display = "none";
            window.isTipPrompting = false
        }, 2E3)
    }
    !function() {
        var promptContinueRead = $$("promptContinueRead"),
        local = window.localStorage, session = window.sessionStorage, historySession, historyStorage, historyData, continueHtml, data, interval, newLink, _t = crossPage ? "page" : "top";
        if (isLocalStorageNameSupported && session) {
            historyStorage = JSON.parse(localStorage.getItem(ID));
            historyData = localStorage.getItem(ID + _t);
            historyData = _t + "=" + (historyData ? historyData : "new");
            historySession = session.getItem(ID);
            if (!historySession && crossPage) {
                var readPrompt = $$("readPrompt");
                readPrompt.style.display = "block";
                setTimeout(function() {
                    Fade(readPrompt,
                    1, 0, 400)
                }, 1600);
                setTimeout(function() {
                    readPrompt.parentNode.removeChild(readPrompt);
                    readPrompt = null
                }, 2E3)
            }
            window.advSeq = Math.floor(Math.random() * maxPage) + 1;
            if (!historySession && historyStorage && historyStorage.cid) {
                newLink = makeUrl(ID, historyStorage.cid) + "?" + historyData + "&jump=1";
                if (qqGameHall && qqGameHallFirst) {
                    var _checkUserChapter = function() {
                        if (!USER)
                            setTimeout(_checkUserChapter, 500);
                        else
                            ajax.post({
                                url: "/Ajax/getReadHistoryByComicId",
                                data: "uin=" + USER.uin + "&comicId=" + ID,
                                callback: function(data) {
                                    data =
                                    JSON.parse(data);
                                    if (data.status === 2 && data.seqNo)
                                        if (+data.seqNo === +historyStorage.cSeq)
                                            window.location.href = newLink + "&ADTAG=channel.qqgame.id" + ID;
                                        else
                                            window.location.href = "/ComicView/index/id/" + ID + "/seqno/" + data.seqNo + "?jump=1"
                                }
                            })
                    }
                    ;
                    _checkUserChapter()
                }
                data = {
                    cTitle: historyStorage.cTitle,
                    thisUrl: makeUrl(ID, historyStorage.cid),
                    thisUrlWithData: newLink
                };
                continueHtml = template("promptContinueReadMod", data);
                promptContinueRead.innerHTML = continueHtml;
                $$("promptContinueClose").onclick = function() {
                    Fade(promptContinueRead,
                    1, 0, 200);
                    setTimeout(function() {
                        promptContinueRead.parentNode.removeChild(promptContinueRead);
                        promptContinueRead = null
                    }, 210)
                }
                ;
                if (NEXT_CHAPTER === 0)
                    localStorage.setItem(ID, JSON.stringify(DATA.chapter))
            } else if (jumpPrompt && DATA.chapter.cTitle) {
                data = {
                    locationChapter: DATA.chapter.cTitle
                };
                continueHtml = template("promptContinueReadJumpMod", data);
                promptContinueRead.innerHTML = continueHtml;
                setTimeout(function() {
                    Fade(promptContinueRead, 1, 0, 500);
                    setTimeout(function() {
                        promptContinueRead.parentNode.removeChild(promptContinueRead);
                        promptContinueRead = null
                    }, 510)
                }, 2E3)
            } else {
                promptContinueRead.parentNode.removeChild(promptContinueRead);
                promptContinueRead = null ;
                localStorage.setItem(ID, JSON.stringify(DATA.chapter))
            }
            session.setItem(ID, 1);
            !function() {
                if (!isLocalStorageNameSupported)
                    return;
                var fav = localStorage.getItem("favourite")
                  , isfav = fav && fav.indexOf(ID) !== -1 ? 1 : 0;
                if (isfav)
                    refreshView(true)
            }()
        }
    }();
    if (!qqGameHallFirst)
        ajax.post({
            url: "http://ac.qq.com/ComicView/saveReadRecord",
            data: "history=" + encodeURIComponent(JSON.stringify(newRecord)),
            callback: function() {}
        });
    ajax.get({
        url: "/Ajax/getUserCollectionUpdate?" + Math.random(),
        callback: function(data) {
            var favData = JSON.parse(data), bookshelfData = favData.data, len = bookshelfData && bookshelfData.length || 0, local = window.localStorage, fav = local.getItem("favourite"), isfav = fav && fav.indexOf(ID) !== -1 ? 1 : 0, html, favCount = DATA.comic.collect, favCountFormat = "";
            !function() {
                if (!bookshelfData)
                    return;
                var i = 0, needCheck, from, to, _len = len, _temp;
                for (; i < _len; ++i) {
                    _temp = bookshelfData[i];
                    if (!from && from !== 0)
                        if (+_temp.id ===
                        ID && +_temp.lateSeqNo === +DATA.chapter.cSeq) {
                            bookshelfData[i].updateFlag = 0;
                            from = i;
                            to = len - 1
                        } else {
                            if (_temp.updateFlag === 0)
                                return
                        }
                    else if (_temp.updateFlag === 0) {
                        to = i - 1;
                        break
                    }
                }
                if (to <= from)
                    return;
                _temp = bookshelfData[from];
                bookshelfData[from] = bookshelfData[to];
                bookshelfData[to] = _temp
            }();
            data = {
                data: bookshelfData,
                total: favData.data ? favData.data.length : 0,
                state: favData.state,
                makeLink: makeUrl
            };
            html = template("bookshelfMod", data);
            bc.innerHTML = html;
            if (bookshelfData)
                bn.innerHTML = bookshelfData.length;
            while (len--)
                if (bookshelfData[len].id ==
                ID) {
                    IS_FAV = true;
                    break
                }
            if (!isLocalStorageNameSupported) {
                if (IS_FAV)
                    refreshView(true)
            } else if (IS_FAV) {
                if (!isfav) {
                    refreshView(true);
                    local.setItem("favourite", (fav + "," + ID).replace("null,", ""))
                }
            } else if (isfav) {
                refreshView(false);
                fav = fav.replace("," + ID, "");
                local.setItem("favourite", fav)
            }
            favCountFormat = favCount > 9999 ? (favCount - favCount % 100) / 1E4 + "\u4e07" : favCount;
            fst.innerHTML = "\uff08" + favCountFormat + "\uff09";
            setTimeout(function() {
                on(bs, mouse.click, function() {
                    var btn = $$("catalogueControl");
                    removeClass(cc, "active");
                    addClass(cm, "hidden");
                    if (bc.style.display === "none") {
                        bc.style.display = "block";
                        Fade(bc, 0, 1, 100);
                        removeClass(btn, "tool_chapters_button_trigger");
                        scrollBookshelf && scrollBookshelf.init(osWidth, osHeight)
                    } else
                        bc.style.display = "none"
                })
            }, 300);
            ajax.get({
                url: "/Ajax/getUserBaseInfo?" + Math.random(),
                async: false,
                callback: function(data) {
                    var userInfoData = JSON.parse(data);
                    window.toLogout = function() {
                        pt_logout.logout();
                        pt_logout.clearCookie();
                        setTimeout(function() {
                            window.location.reload()
                        }, 200)
                    }
                    ;
                    if (IS_VIP && userInfoData.result &&
                    userInfoData.result.kick)
                        window.toLogout();
                    var un = $$("userName")
                      , uav = $$("userAvatar")
                      , uavw = $$("userAvatarWr")
                      , us = $$("userSign")
                      , af = $$("addFavourites")
                      , ic = $$("iconFavourite")
                      , im = $$("iframeMask")
                      , ia = $$("iframeAll")
                      , tl = $$("toLogin")
                      , icn = $$("iconFavouriteNext")
                      , uso = $$("userSignOut")
                      , clientX = null
                      , clientY = null
                      , toLogin = function() {
                        var scrollTop = getScrollTop()
                          , wl = window.location.href.split("?")[0]
                          , hd = crossPage ? "page=" + nowPage : "top=" + scrollTop;
                        hd += window.hdID ? "&hd=" + window.hdID : "";
                        if (wl.indexOf("/auth/1") !==
                        -1)
                            wl = wl + "?" + hd;
                        else
                            wl = wl + "/auth/1?" + hd;
                        wl = encodeURIComponent(wl);
                        Fade(im, 0, 1, 300);
                        im.style.display = "block";
                        addClass(im, "active");
                        setTimeout(function() {
                            ia.style.opacity = 1;
                            ia.style.filter = "alpha(opacity=100)"
                        }, isIE ? 200 : 20);
                        ia.style.cssText = "display:block;opacity:0;filter:alpha(opacity=0);width:622px;height:368px;";
                        ia.src = "http://ui.ptlogin2.qq.com/cgi-bin/login?target=top&style=0&appid=637009801&daid=43&s_url=" + wl
                    }
                      , changeFav = function(from, e) {
                        if (!USER)
                            return toLogin();
                        if (e) {
                            clientX = e.pageX ? null  : e.clientX;
                            clientY = e.pageY ? null  : e.clientY
                        }
                        if (IS_FAV) {
                            if (from.id === "addFavourites")
                                sendPgv("AC.VIEW.NEWDM.QUXIAOSC_TOP");
                            else
                                sendPgv("AC.VIEW.NEWEVENT.BOTTOM_REMOVEFAVOURITES");
                            ajax.post({
                                url: "/Ajax/delCollection?" + Math.random(),
                                data: "comic_id=" + ID + "&tokenKey=" + USER.token,
                                callback: function(data) {
                                    var bookshelfList = $$("bookshelfList").children, len = bookshelfList.length, tar = DATA.comic.title, str = "", nowNum, o, favCount = fst.innerHTML.slice(1, -1), favCountFormat = "";
                                    data = +JSON.parse(data).status;
                                    if (data === 1) {
                                        if (favCount.indexOf("\u4e07") ===
                                        -1)
                                            fst.innerHTML = "\uff08" + (~~favCount - 1) + "\uff09";
                                        IS_FAV = false;
                                        refreshView(IS_FAV);
                                        while (len--) {
                                            o = bookshelfList[len];
                                            if (o.innerHTML.indexOf(tar) !== -1) {
                                                o.parentNode.removeChild(o);
                                                nowNum = +bn.innerHTML - 1;
                                                bn.innerHTML = nowNum;
                                                $$("bookshelfNumIn").innerHTML = nowNum;
                                                break
                                            }
                                        }
                                        scrollBookshelf.init(osWidth, osHeight)
                                    }
                                }
                            })
                        } else
                            ajax.post({
                                url: "/Ajax/addCollection?" + Math.random(),
                                data: "comic_id=" + ID + "&tokenKey=" + USER.token,
                                callback: function(data) {
                                    var addBookshelf = function() {
                                        var bookshelf = $$("bookshelf"), bookshelfList =
                                        $$("bookshelfList").innerHTML, addOne = bookshelf.children[1], nowNum;
                                        bookshelfList += '<li><a class="user-bookshelf-favourite-name-warp" href="#"><span class="user-bookshelf-favourite-name">' + DATA.comic.title + '</span></a><a class="user-bookshelf-favourite-chapter-warp" href="#"><span class="user-bookshelf-favourite-chapter">\u6b63\u5728\u6d4f\u89c8...</span></a></li>';
                                        $$("bookshelfList").innerHTML = bookshelfList;
                                        nowNum = +bn.innerHTML + 1;
                                        bn.innerHTML = nowNum;
                                        addClass(bookshelf, "user-bookshelf-active");
                                        Fade(addOne,
                                        0, 1, 500);
                                        setTimeout(function() {
                                            removeClass(bookshelf, "user-bookshelf-active");
                                            Fade(addOne, 1, 0, 200)
                                        }, 850);
                                        $$("bookshelfNumIn").innerHTML = nowNum;
                                        setTimeout(function() {
                                            scrollBookshelf.init(osWidth, osHeight)
                                        }, 100)
                                    }
                                    ;
                                    data = +JSON.parse(data).status;
                                    var favCount = fst.innerHTML.slice(1, -1);
                                    if (data === 1) {
                                        if (favCount.indexOf("\u4e07") === -1)
                                            fst.innerHTML = "\uff08" + (~~favCount + 1) + "\uff09";
                                        IS_FAV = true;
                                        refreshView(IS_FAV);
                                        if (e) {
                                            sendPgv("AC.VIEW.NEWEVENT.BOTTOM_ADDFAVOURITES");
                                            collectMove(e, clientX, clientY);
                                            setTimeout(function() {
                                                addBookshelf()
                                            },
                                            600)
                                        } else {
                                            sendPgv("AC.VIEW.NEWDM.TIANJIASC-TOP");
                                            addBookshelf()
                                        }
                                    }
                                }
                            })
                    }
                    ;
                    window.toLogin = toLogin;
                    var theme, avatarSrc;
                    if (document.getElementsByTagName("body")[0].className.indexOf("theme-white") === -1) {
                        theme = "dark";
                        avatarSrc = "http://ac.gtimg.com/media/images/ac_chapter_avatar.jpg"
                    } else {
                        theme = "white";
                        avatarSrc = "http://ac.gtimg.com/media/images/ac_chapter_avatar_white.jpg"
                    }
                    if (userInfoData.status === 2) {
                        window.USER = userInfoData.result;
                        if (window.USER.isVipUser)
                            addClass(body, "is-vip");
                        un.setAttribute("target",
                        "_blank");
                        un.onclick = function() {}
                        ;
                        un.href = "http://ac.qq.com/Home";
                        var usoIn = false;
                        uav.src = USER && USER.avatar || avatarSrc;
                        addClass(uavw, "user-avatar-login");
                        uso.onclick = window.toLogout;
                        setTimeout(function() {
                            scrollBookshelf = ScrollBar({
                                contain: $$("bookshelfList"),
                                wrap: $$("bookshelfListWrap"),
                                scrollBg: $$("bookshelfScrollBg"),
                                scrollBlock: $$("bookshelfScrollBlock"),
                                factHeightDiff: 220,
                                scrollBarHeightDiff: 0
                            });
                            $$("bookshelfNumIn").innerHTML = bn.innerHTML
                        }, 200);
                        $$("ignoreUpdate").onclick = function() {
                            var list = $$("bookshelfList").children,
                            i = 0, o;
                            while (bookshelfData[i].updateFlag === 1) {
                                o = list[i].children[1];
                                o.className = "user-bookshelf-favourite-chapter-warp";
                                o.innerHTML = '<span class="user-bookshelf-favourite-chapter">\u66f4\u65b0\u81f3\u7b2c' + bookshelfData[i].lateSeqNo + "\u8bdd</span>";
                                ++i
                            }
                            ajax.post({
                                url: "/Ajax/ignoreUpdate",
                                data: "tokenKey=" + USER.token,
                                callback: function(data) {
                                    data = +JSON.parse(data).status;
                                    if (data !== 1)
                                        console.log("\u6807\u8bb0\u5df2\u8bfb\u5931\u8d25")
                                }
                            })
                        }
                        ;
                        $$("bookshelfList").onmousedown = function(e) {
                            e = e || window.event;
                            e =
                            e.target || e.srcElement;
                            var cls = e.className;
                            if (cls.indexOf("favourite-name") !== -1)
                                sendPgv("AC.VIEW.NEWEVENT.TOP_BSCOMIC");
                            else if (cls.indexOf("favourite") !== -1)
                                sendPgv("AC.VIEW.NEWEVENT.TOP_BSCHAPTER")
                        }
                        ;
                        hotPgv("ignoreUpdate", "AC.VIEW.NEWEVENT.TOP_BSread")
                    } else {
                        if (theme === "white")
                            uav.src = USER && USER.avatar || avatarSrc;
                        un.href = "javascript:void(0)";
                        un.setAttribute("target", "_self");
                        un.onclick = toLogin;
                        if (tl)
                            tl.onclick = toLogin
                    }
                    window.ptlogin2_onClose = function() {
                        im.style.display = "none";
                        removeClass(im, "active");
                        ia.src = "javascript:void(0);";
                        ia.style.cssText = "display:none"
                    }
                    ;
                    if ($$("notice"))
                        removeClass($$("noticeControl"), "hidden");
                    af.onclick = function(e) {
                        e = e || window.event;
                        changeFav(af)
                    }
                    ;
                    if (ic)
                        on(ic, mouse.click, function(e) {
                            e = e || window.event;
                            changeFav(ic, e);
                            onHover(ic.parentNode, function() {
                                if (IS_FAV)
                                    if (ic.nextSibling.id === "iconFavouritePro")
                                        ic.nextSibling.innerHTML = "\u53d6\u6d88\u6536\u85cf";
                                    else
                                        ic.nextSibling.nextSibling.innerHTML = "\u53d6\u6d88\u6536\u85cf"
                            }, function() {
                                if (IS_FAV)
                                    if (ic.nextSibling.id === "iconFavouritePro")
                                        ic.nextSibling.innerHTML =
                                        "\u5df2\u6536\u85cf";
                                    else
                                        ic.nextSibling.nextSibling.innerHTML = "\u5df2\u6536\u85cf"
                            })
                        });
                    if (icn)
                        on(icn, mouse.click, function(e) {
                            e = e || window.event;
                            changeFav(icn, e);
                            onHover(icn.parentNode, function() {
                                if (IS_FAV)
                                    if (icn.nextSibling.id === "iconFavouriteProNext")
                                        icn.nextSibling.innerHTML = "\u53d6\u6d88\u6536\u85cf";
                                    else
                                        icn.nextSibling.nextSibling.innerHTML = "\u53d6\u6d88\u6536\u85cf"
                            }, function() {
                                if (IS_FAV)
                                    if (icn.nextSibling.id === "iconFavouriteProNext")
                                        icn.nextSibling.innerHTML = "\u5df2\u6536\u85cf";
                                    else
                                        icn.nextSibling.nextSibling.innerHTML =
                                        "\u5df2\u6536\u85cf"
                            })
                        });
                    !function() {
                        var checkVipFrame = $$("checkVipFrame")
                          , token = USER && USER.token || "";
                        if (!DATA.chapter.canRead) {
                            checkVipFrame.style.opacity = 0;
                            checkVipFrame.style.filter = "alpha(opacity=0)";
                            setTimeout(function() {
                                Fade(checkVipFrame, 0, 1, 200);
                                $$("navWrapTop").style.zIndex = "1003";
                                $$("toolWrapBottom").style.cssText = "z-index:1003;height:63px;";
                                $$("themeControl").parentNode.style.display = "none"
                            }, 400);
                            checkVipFrame.src = "/ComicView/showInterceptPage/id/" + ID + "/cid/" + CID + "?id===" + ID + "&cid===" +
                            CID + "&theme===" + cookie("theme") + "&token===" + token;
                            removeClass(checkVipFrame, "hidden")
                        }
                    }();
                    checkQQHall()
                }
            })
        }
    });
    var cc = $$("catalogueControl")
      , cm = $$("catalogueContain")
      , cd = $$("catalogueSlideDown")
      , bc = $$("bookshelfContain")
      , tp = $$("toolPage")
      , checkHotArea = function(e) {
        e = e || window.event;
        var tar = e.target || e.srcElement
          , tag = tar.tagName.toLowerCase();
        if (tag === "img" || tar.className === "comic-contain" || tar.className === "for-roast" || tar.className === "main_control" || tar.className === "main_control_list") {
            removeClass(cc,
            "tool_chapters_button_trigger");
            addClass(cc, "tool_chapters_button");
            addClass(cm, "hidden");
            bc.style.display = "none";
            tp && (tp.style.display = "");
            roastHandle(-1, +e.button)
        }
    }
    ;
    on(body, mouse.down, checkHotArea);
    on(cc, mouse.click, function() {
        if (cc.className.indexOf("trigger") === -1) {
            addClass(cc, "tool_chapters_button_trigger");
            Fade(cm, 0, 1, 100);
            removeClass(cm, "hidden");
            scrollCatalogue.init(osWidth, osHeight);
            scrollCatalogue.set(_thisStep);
            bc.style.display = "none"
        } else {
            removeClass(cc, "tool_chapters_button_trigger");
            addClass(cc, "tool_chapters_button");
            addClass(cm, "hidden")
        }
    });
    on(cd, mouse.click, function() {
        removeClass(cc, "tool_chapters_button_trigger");
        addClass(cc, "tool_chapters_button");
        addClass(cm, "hidden")
    });
    cleanModeInit();
    function putDataIn(argu) {
        var i;
        for (i in argu)
            $$(i).innerHTML = argu[i]
    }
    var tb = $$("toolBottom");
    on($$("toolBtn"), mouse.down, function() {
        if (tb.className.indexOf("state-close") !== -1)
            removeClass(tb, "state-close");
        else
            addClass(tb, "state-close")
    });
    var iconMonth = $$("iconMonth")
      , iconPrize = $$("iconPrize");
    function getMonth() {
        if (isMonthGet)
            return;
        isMonthGet = true;
        ajax.get({
            url: "/Comic/getMonthTicketInfo/id/" + ID + "/source/1",
            callback: function(data) {
                var getMonthTicketInfo = JSON.parse(data)
                  , dataMonth = getMonthTicketInfo.monthTicket || {};
                if (dataMonth)
                    putDataIn({
                        dataMonthToday: dataMonth.dayTotal || 0,
                        dataMonth: dataMonth.monthTotal || 0,
                        dataMonthRank: dataMonth.rank.rankNo || 0
                    })
            }
        })
    }
    function getPrize() {
        if (isPrizeGet)
            return;
        isPrizeGet = true;
        ajax.get({
            url: "/Comic/getAwardInfo/id/" + ID + "/source/1",
            callback: function(data) {
                var getAwardInfo =
                JSON.parse(data)
                  , dataAward = getAwardInfo || {};
                if (dataAward)
                    putDataIn({
                        highPrize: dataAward.topDq && dataAward.topDq.dq || 0,
                        totalPrize: dataAward.count || 0,
                        rankPrize: dataAward.rankNo || 0
                    })
            }
        })
    }
    window.isMonthGet = false;
    window.isPrizeGet = false;
    var rf = $$("rewardFrame")
      , setRewardFrame = function(type, nocheck) {
        if (!USER && !nocheck)
            return toLogin();
        if (!nocheck)
            if (checkLogin())
                return;
        if (type === "showEndChpaterAds")
            window.location.href = "http://ac.qq.com/ComicView/showEndChapter/id/" + ID + "/cid/" + CID + "?fromPrev=1";
        else {
            rf.style.opacity =
            0;
            rf.style.filter = "alpha(opacity=0)";
            removeClass(rf, "hidden");
            setTimeout(function() {
                Fade(rf, 0, 1, 300)
            }, isIE ? 200 : 20);
            if (USER)
                rf.src = "/ComicView/" + type + "/id/" + ID + "?token===" + USER.token + "&nick===" + encodeURIComponent(USER.shortNick) + "&img===" + USER.avatar + "&authorNick===" + encodeURIComponent(DATA.artist.nick) + "&authorImg===" + DATA.artist.avatar + "&uin===" + DATA.artist.uinCrypt + "&j===" + DATA.comic.isJapanComic + "&l===" + DATA.comic.isLightNovel + "&f===" + DATA.comic.isFinish;
            else if (nocheck)
                rf.src = "/ComicView/" + type +
                "/id/" + ID + "?j===" + DATA.comic.isJapanComic + "&l===" + DATA.comic.isLightNovel + "&f===" + DATA.comic.isFinish;
            else
                rf.src = "/ComicView/" + type + "/id/" + ID + "?f===" + DATA.comic.isFinish
        }
    }
    ;
    window.callReward = setRewardFrame;
    window.closeRewardFrame = function() {
        addClass(rf, "hidden");
        rf.style.opacity = 0;
        rf.style.filter = "alpha(opacity=0)";
        rf.src = "javascript:void(0);"
    }
    ;
    window.checkLogin = function() {
        if (!cookie("p_skey")) {
            toLogin();
            return 1
        }
        return 0
    }
    ;
    window.noMore = function() {
        if (qqGameHall)
            setRewardFrame("showQQgameChpaterAds",
            "nocheck");
        else
            setRewardFrame("showEndChpaterAds", "nocheck")
    }
    ;
    var rewardShow = $$("rewardShow");
    rewardShow && on(rewardShow, mouse.click, function() {
        setRewardFrame("showReward")
    });
    iconPrize && on(iconPrize, mouse.click, function() {
        setRewardFrame("showReward")
    });
    var monthTicketShow = $$("monthTicketShow");
    if (monthTicketShow) {
        on(monthTicketShow, mouse.click, function() {
            setRewardFrame("showMonthTicket")
        });
        on(iconMonth, mouse.click, function() {
            setRewardFrame("showMonthTicket")
        })
    }
    onHover(iconMonth && iconMonth.parentNode,
    function() {
        getMonth()
    }, function() {
        getMonth()
    });
    onHover(iconPrize && iconPrize.parentNode, function() {
        getPrize()
    }, function() {});
    if (crossPage) {
        var forTicket = $$("forTicket")
          , forPrize = $$("forPrize");
        forTicket && on(forTicket, mouse.click, function() {
            setRewardFrame("showMonthTicket")
        });
        forPrize && on(forPrize, mouse.click, function() {
            setRewardFrame("showReward")
        })
    }
    var stopPopRight = function(e) {
        var target;
        e = e || window.event;
        if (+e.button === 2) {
            target = e.target || e.srcElement;
            if (e.stopPropagation) {
                e.stopPropagation();
                e.preventDefault()
            } else {
                e.cancelBubble =
                true;
                e.returnValue = false
            }
        }
    }
    ;
    if (window.addEventListener)
        document.body.addEventListener("contextmenu", stopPopRight, false);
    else
        document.body.attachEvent("oncontextmenu", stopPopRight);
    if (window.console && window.console.log) {
        console.log("\u52a8\u6f2b\u65e0\u754c\uff0c\u68a6\u60f3\u65e0\u9650\uff01   - AC.QQ.COM  \u817e\u8baf\u52a8\u6f2b");
        console.log("\u8bf7\u52ff\u5728\u6b64\u63a7\u5236\u53f0\u8f93\u5165\u6216\u7c98\u8d34\u4f60\u4e0d\u660e\u767d\u7684\u4ee3\u7801\uff0c\u4ee5\u907f\u514d\u4ed6\u4eba\u7a83\u53d6\u4f60\u7684\u4fe1\u606f\u6765\u5192\u5145\u4f60\u3002")
    }
}();
!function() {
    var hideNotice = cookie("notice")
      , notice = $$("notice")
      , comicTitle = $$("comicTitle")
      , noticeControl = $$("noticeControl")
      , noticeControlParent = noticeControl.parentNode
      , closeTag = '<span class="tool_title">\u6253\u5f00\u516c\u544a</span>'
      , openTag = '<span class="tool_title">\u5173\u95ed\u516c\u544a</span>';
    if (!notice)
        return;
    if (!+hideNotice) {
        removeClass(notice, "hidden");
        addClass(comicTitle, "hidden")
    } else {
        addClass(noticeControlParent, "notice-open");
        noticeControl.innerHTML = closeTag
    }
    var n1 = $$("noticeMod")
      ,
    n2 = n1.nextSibling.nextSibling
      , n1s = n1.style
      , n2s = n2.style
      , nw = n1.offsetWidth
      , dis = 2 * nw
      , noticeMove = function() {
        var s1, s2;
        dis = dis - 1 < 0 ? 2 * nw : dis - 1;
        s1 = dis - nw < 0 ? dis : dis - 2 * nw;
        s2 = dis - 2 * nw;
        n1s.left = s1 + "px";
        n2s.left = s2 + "px"
    }
      , autoHideNotice = function() {
        clearTimeout(noticeTimeout);
        noticeTimeout = setTimeout(function() {
            hideNotice = !+hideNotice;
            addClass(notice, "hidden");
            removeClass(comicTitle, "hidden");
            addClass(noticeControlParent, "notice-open");
            noticeControl.innerHTML = closeTag;
            clearInterval(intervalNotice)
        }, NOTICE_TIME *
        1E3)
    }
    ;
    startNotice = function() {
        intervalNotice = setInterval(noticeMove, 50);
        autoHideNotice()
    }
    ,
    intervalNotice = null ,
    noticeTimeout = null ,
    hideNotice = cookie("notice");
    notice.onmouseover = function() {
        clearInterval(intervalNotice);
        clearTimeout(noticeTimeout)
    }
    ;
    notice.onmouseout = function() {
        startNotice();
        autoHideNotice()
    }
    ;
    noticeControl.onclick = function() {
        hideNotice = !+hideNotice;
        if (hideNotice) {
            addClass(notice, "hidden");
            removeClass(comicTitle, "hidden");
            addClass(noticeControlParent, "notice-open");
            noticeControl.innerHTML =
            closeTag;
            cookie("notice", 1, {
                path: "/",
                expires: 2
            });
            clearInterval(intervalNotice);
            sendPgv("AC.VIEW.NEWEVENT.TOP_OFFNOTICE")
        } else {
            removeClass(notice, "hidden");
            addClass(comicTitle, "hidden");
            removeClass(noticeControlParent, "notice-open");
            noticeControl.innerHTML = openTag;
            cookie("notice", 0, {
                path: "/",
                expires: 2
            });
            nw = n1.offsetWidth;
            startNotice();
            sendPgv("AC.VIEW.NEWEVENT.TOP_ONNOTICE")
        }
    }
    ;
    if (!+hideNotice)
        startNotice()
}();
var navWrapTop = $$("navWrapTop")
  , toolWrapBottom = $$("toolWrapBottom")
  , toolbarIn = function(e) {
    e = e || window.event;
    if (cleanMode || fullMode)
        addClass(body, "toolbar")
}
  , toolbarOut = function(e) {
    e = e || window.event;
    e = e.target || e.srcElement;
    if (e.id === "comicTitle" || e.parentNode.id === "comicTitle")
        return;
    if ((cleanMode || fullMode) && !+isFixBottom)
        removeClass(body, "toolbar")
}
;
navWrapTop.onmouseover = toolbarIn;
navWrapTop.onmouseout = toolbarOut;
toolWrapBottom.onmouseover = toolbarIn;
toolWrapBottom.onmouseout = toolbarOut;
var isFixBottom = false;
!function() {
    hotPgv("prevChapter", "AC.VIEW.NEWEVENT.TOOLS_PREV");
    hotPgv("nextChapter", "AC.VIEW.NEWEVENT.TOOLS_NEXT");
    hotPgv("catalogueControl", "AC.VIEW.NEWEVENT.TOOLS_MENUS");
    hotPgv("fullscreen", "AC.VIEW.NEWEVENT.TOOLS_FULL");
    hotPgv("themeControl", "AC.VIEW.NEWEVENT.TOOLS_LIGHT");
    hotPgv("fullscreenChange", "AC.VIEW.NEWEVENT.TOOLS_FULLSCREEN");
    hotPgv("mainControlNext", "AC.VIEW.NEWEVENT.BOTTOM_NEXT");
    hotPgv("iconMonth", "AC.VIEW.NEWEVENT.BOTTOM_YUEPIAO1");
    hotPgv("monthTicketShow", "AC.VIEW.NEWEVENT.BOTTOM_YUEPIAO2");
    hotPgv("iconPrize", "AC.VIEW.NEWEVENT.BOTTOM_DASHANG1");
    hotPgv("rewardShow", "AC.VIEW.NEWEVENT.BOTTOM_DASHANG2");
    hotPgv("bookshelf", "AC.VIEW.NEWEVENT.TOP_BOOKSHELF");
    hotPgv("userName", "AC.VIEW.NEWEVENT.TOP_BStoSelf");
    hotPgv("chapter", "AC.VIEW.NEWEVENT.TOP_toChapter");
    hotPgv("home", "AC.VIEW.NEWEVENT.TOP_HOME");
    hotPgv("logo", "AC.VIEW.NEWEVENT.TOP_LOGO");
    hotPgv("roastBtnText", "AC.VIEW.NEWDM.FADANMU.ZHANKAI_BUTTON");
    hotPgv("icoBarWrite", "AC.VIEW.NEWDM.FADANMU.SHOUQI_BUTTON");
    hotPgv("toRoast", "AC.VIEW.NEWEVENT.TC.FATUCAO_BOTTOM");
    hotPgv("turnToRoastDm", "AC.VIEW.NEWDM.QIEHUAN_BUTTON");
    hotPgv("icoBarMode", "AC.VIEW.NEWDM.QIEHUAN_BUTTON");
    hotPgv("barrage", "AC.VIEW.NEWEVENT.TC.FATUCAO_BOTTOM");
    hotPgv("roastSmallBar", "AC.VIEW.NEWEVENT.TC.YINCANG_RIGHT");
    hotPgv("roastMode", "AC.VIEW.NEWEVENT.TC.YINCANG_BOTTOM");
    hotPgv("changeRoast", "AC.VIEW.NEWEVENT.TC.HUANYIPI");
    hotPgv("icoBarChange", "AC.VIEW.NEWDM.HUANYIPI");
    hotPgv("publishVip", "AC.VIEW.NEWEVENT.TC.TOVIP");
    if (!crossPage) {
        $$("recommendList").onmousedown = function(e) {
            e = e || window.event;
            e = e.target || e.srcElement;
            var recommendPicId = e.getAttribute("data-pvg");
            if (recommendPicId)
                sendPgv("AC.VIEW.NEWEVENT.AD_COMLEFT" + (+recommendPicId + 1))
        }
        ;
        var leftPicAd = $$("leftPicAd");
        if (leftPicAd)
            leftPicAd.onmousedown = function() {
                sendPgv("AC.VIEW.NEWEVENT.AD_PICLEFT")
            }
    }
    setTimeout(function() {
        if (crossPage) {
            sendPgv("AC.VIEW.ALL.DUIYE");
            sendPgv("AC.VIEW.CONTENT.DUIYE." + ID)
        } else
            sendPgv("AC.VIEW.ALL.DANYE");
        sendPgv(IS_JAPAN ? "AC.VIEW.ALL.RIMAN" : "AC.VIEW.ALL.GUOMAN");
        sendPgv(cleanMode ? "AC.VIEW.ALL.QINGJIE" : "AC.VIEW.ALL.NORMAL");
        if (roastState)
            sendPgv(bigScreenRoastMode ? "AC.VIEW.NEWDM.ZHANKAI" : "AC.VIEW.NEWDM.SHOUQI");
        sendPgv("AC.VIEW.NEWDM." + (roastState === 0 ? "YINCANG" : roastState === 1 ? "TUCAO" : "DANMU"))
    }, 3E3)
}();
!function() {
    var ua = navigator.userAgent, a, len;
    if (ua.indexOf("MSIE") !== -1) {
        a = document.getElementsByTagName("a");
        len = a.length;
        while (len--)
            a[len].onfocus = function() {
                this.blur()
            }
    }
}();
var QQHALL_INIT = false;
function checkQQHall() {
    if (!qqGameHall)
        return;
    var a = document.getElementsByTagName("a"), len = a.length, mainControlNext = $$("mainControlNext"), pageArrow = $$("pageArrow"), hideMeByClassName = function(o, str) {
        if (!o)
            return;
        if (o.className.indexOf(str) !== -1)
            o.style.display = "none"
    }
    , unableLink = function(o) {
        if (!o)
            return;
        o.onclick = function(e) {
            e = e || window.event;
            if (e.preventDefault)
                e.preventDefault();
            else
                e.returnValue = false
        }
        ;
        o.style.cursor = "default"
    }
    , forClearCache, saveUserRecord = function() {
        var _image = new Image
          , link = "http://dir.minigame.qq.com/cgi-bin/UserHistory_Tlist?cmd=102&subKey=" +
        ID + "&content=" + encodeURIComponent(DATA.comic.title) + "&iType=1&strCol1=" + CID + "&strCol2=" + encodeURIComponent(DATA.chapter.cTitle);
        forClearCache = _image;
        _image.onload = _image.onerror = _image.onabort = function() {
            _image.onload = _image.onerror = _image.onabort = null ;
            forClearCache = null
        }
        ;
        _image.src = link
    }
    ;
    if (!QQHALL_INIT) {
        saveUserRecord();
        while (len--) {
            if (!a[len])
                continue;a[len].target = "_self";
            if (a[len].href.indexOf("/theme/") != -1)
                a[len].href = "javascript:void(0)"
        }
        if (!crossPage) {
            var comicContain = $$("comicContain").children
              ,
            len = comicContain.length;
            while (len--)
                hideMeByClassName(comicContain[len], "main_ad")
        }
        $$("navTop").children[0].innerHTML = '<a id="logo" class="logo" style="cursor: default">\u817e\u8baf\u52a8\u6f2b</a>';
        if (NEXT_CHAPTER === 0)
            if (!crossPage)
                mainControlNext.innerHTML = "\u5373\u5c06\u8fdb\u5165\u4e0b\u4e00\u8bdd" + '<span class="iconfont icon-next"></span>';
            else
                addClass(pageArrow, "page-arrow-qqhall");
        QQHALL_INIT = true
    }
    var navTopChildren = $$("navTop").children
      , len = navTopChildren.length;
    while (len--)
        hideMeByClassName(navTopChildren[len],
        "top-btn-wrap");
    $$("addFavourites").style.display = "none";
    $$("bookshelf").parentNode.style.display = "none";
    unableLink($$("chapter"));
    unableLink($$("comicTitle").children[0])
}
checkQQHall();
if (qqGameHall)
    setTimeout(function() {
        sendPgv("AC.VIEW.NEWEVENT.QQHALL")
    }, 1E3);
