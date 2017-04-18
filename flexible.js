;(function(win, lib) {
    var doc = win.document;// win = window,lib = window.lib;
    var docEl = doc.documentElement;
    var metaEl = doc.querySelector('meta[name="viewport"]');
    var flexibleEl = doc.querySelector('meta[name="flexible"]');//这样的写法没有尝试过
    var dpr = 0;
    var scale = 0;
    var tid;
    var flexible = lib.flexible || (lib.flexible = {});
    
    //创建meta:vp,并根据设备屏幕像素比来设置dpr的值，设置scale =1/dpr,保留小数点后2位;
    // 当设置过meta标签之后，其根据其自定义的缩放放比来设置
    if (metaEl) {
        console.warn('将根据已有的meta标签来设置缩放比例');
        var match = metaEl.getAttribute('content').match(/initial\-scale=([\d\.]+)/);
        if (match) {
            scale = parseFloat(match[1]);
            dpr = parseInt(1 / scale);//获取屏幕像素比
        }
    } else if (flexibleEl) {
        var content = flexibleEl.getAttribute('content');
        if (content) {
            var initialDpr = content.match(/initial\-dpr=([\d\.]+)/);
            var maximumDpr = content.match(/maximum\-dpr=([\d\.]+)/);
            if (initialDpr) {
                dpr = parseFloat(initialDpr[1]);
                scale = parseFloat((1 / dpr).toFixed(2));   
                //3.1415.toFixed(2),保留2位小数点
            }
            if (maximumDpr) {
                dpr = parseFloat(maximumDpr[1]);
                scale = parseFloat((1 / dpr).toFixed(2));    
            }
        }
    }

    //当没有设置meta标签之后，根据设备信息来设置屏幕缩放比
    if (!dpr && !scale) {
        var isAndroid = win.navigator.appVersion.match(/android/gi);
        var isIPhone = win.navigator.appVersion.match(/iphone/gi);
        var devicePixelRatio = win.devicePixelRatio;
        if (isIPhone) {
            // iOS下，对于2和3的屏，用2倍的方案，其余的用1倍方案
            if (devicePixelRatio >= 3 && (!dpr || dpr >= 3)) {                
                dpr = 3;
            } else if (devicePixelRatio >= 2 && (!dpr || dpr >= 2)){
                dpr = 2;
            } else {
                dpr = 1;
            }
        } else {
            // 其他设备下，仍旧使用1倍的方案，但是fs并不是固定的
            dpr = 1;
        }
        scale = 1 / dpr;
    }


    //给文档设置自定义属性，保存dpr的值
    docEl.setAttribute('data-dpr', dpr);

    //创建meta标签，设置初始比、最小比和最大比均为scale值，并将其插入到页面
    //设置了缩放比，那么相当于这个屏幕渲染在一个被放大的画布之上。
    if (!metaEl) {
        metaEl = doc.createElement('meta');
        metaEl.setAttribute('name', 'viewport');
        metaEl.setAttribute('content', 'initial-scale=' + scale + ', maximum-scale=' + scale + ', minimum-scale=' + scale + ', user-scalable=no');
        if (docEl.firstElementChild) {
            docEl.firstElementChild.appendChild(metaEl);
        } else {//并没有什么作用
            var wrap = doc.createElement('div');
            wrap.appendChild(metaEl);
            doc.write(wrap.innerHTML);
        }
    }

    // 自定义页面元素的fontsize，方便rem的配置
    function refreshRem(){
        var width = docEl.getBoundingClientRect().width;
        //屏幕信息，屏幕宽度，bound：绑定；rect：矩形
        if (width / dpr > 640) {
            width = 640 * dpr;
        }
        var rem = width / 10;
        docEl.style.fontSize = rem + 'px';
        flexible.rem = win.rem = rem;
    }

    /**
     * 对于设计稿为320px的，根元素fontsize = 32px;
     * 对于设计稿为1080px的，根元素fontsize = 108px;
     * 设屏幕的宽度为w(rem*10),设计稿尺寸为w,那么有比例关系w:rem*10 = x:1 ;
     * ==> x= w/(rem*10);（单位）
     * 那么任意设计稿尺寸 L 转化为相应的尺寸就为：L/x = (L*rem*10)/w;
     * 由于rem设置给根元素了，那么所有的尺寸均可以用rem单位来操作;
     * xrem = (L*rem*10)/w*fontsize = (L*10)/w;
     * 那么在设计稿中量取 L长度的，在编辑器中就为(L*10/w) rem;
     * 如此便完成了rem的自动适配
     */ 

    win.addEventListener('resize', function() {
        clearTimeout(tid);
        tid = setTimeout(refreshRem, 300);
    }, false);
    win.addEventListener('pageshow', function(e) {
        if (e.persisted) {
            clearTimeout(tid);
            tid = setTimeout(refreshRem, 300);
        }
    }, false);

    // 设置页面的body的字体 大小 ，目前发现有何用
    if (doc.readyState === 'complete') {
        doc.body.style.fontSize = 12 * dpr + 'px';
    } else {
        doc.addEventListener('DOMContentLoaded', function(e) {
            doc.body.style.fontSize = 12 * dpr + 'px';
        }, false);
    }
    
    // 页面初始化 
    refreshRem();

    // 提供一些方法
    flexible.dpr = win.dpr = dpr;
    flexible.refreshRem = refreshRem;
    flexible.rem2px = function(d) {
        var val = parseFloat(d) * this.rem;
        if (typeof d === 'string' && d.match(/rem$/)) {
            val += 'px';
        }
        return val;
    }
    flexible.px2rem = function(d) {
        var val = parseFloat(d) / this.rem;
        if (typeof d === 'string' && d.match(/px$/)) {
            val += 'rem';
        }
        return val;
    }

})(window, window['lib'] || (window['lib'] = {}));