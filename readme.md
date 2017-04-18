### 手机淘宝自适应框架 flexible源码解读

### 概略
<p>框架整体模仿jquery,为一个立即执行函数，并对外暴露lib对象，提供rem => px，和px => rem的转化方法。当在调整窗口尺寸的时候可以重置document.documentEliment的fontSize的大小。</p>

### 基本原理
<p>通过设置meta标签的content中 initial-scale,maximum-scale,minimum-scale,的值，其值根据屏幕像素比控制，在dpr越大，屏幕渲染的画布越大。</p>

### 框架步骤
    1、判断是否存在meta[name="viewport"];
    2、存在直接设置，不存在自动生成，推荐不使用;
    3、通过window.devicePixelRatio获取屏幕的屏幕像素比;
    4、根据屏幕的尺寸，通过 document.documentEliment.getBoundingClientRect().width获取屏幕宽度;
    5、设置document.documentEliment.style.fontSize值;
    6、设置document.body.style.fontSize ;
    7、提供一些方法;
    
### 重要方法解读
     
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