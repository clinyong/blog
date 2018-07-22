title: 图片居中的三种方式
date: 2018.07.22
---

电商做活动的时候，都会在首页顶部放一张很长的图片，比如像下面这张京东的图片

![](http://ol07x5ssf.bkt.clouddn.com/banner.jpg)

产品经理提出了一个需求，希望如果屏幕不够长的话，可以让图片居中显示，不要影响图片的比例。当时在网上找了一下，具体出处已经忘了，用了一种比较 hack 的方式完成

```html
<style>
    .parent {
        height: 50px;
        width: 500px;
        overflow: hidden;
        position: relative;
    }

    .child {
        position: absolute;
        left: -9999px;
        right: -9999px;
        top: -9999px;
        bottom: -9999px;
        display: block;
        margin: auto;
    }
</style>

<div class="parent">
    <img  class="child" src="xxx">
</div>
```

上面比较巧妙地把 `child` 的高度和宽度设置得很大，理论上只要能装得下图片就行。然后利用 `margin` 把图片居中。这也是一种让子元素水平垂直居中的方案，只是这时候子元素刚好是图片。

上面的实现虽然巧妙，但是比较麻烦，也不够直观。其实用 `background` 就可以很简单地搞定

```html
<style>
    .child {
        height: 50px;
        width: 500px;
        background: no-repeat center center url(xxx);
    }
</style>

<div class="child">
</div>
```

这种方式应该是图片居中首选了，代码简单，兼容性又好。CSS3 中还引入了一个 `object-fit` 的属性，也可以实现图片居中的效果

```html
<style>
    .parent {
        height: 50px;
        width: 500px;
        overflow: hidden;
    }

    .child {
        width: 100%;
        height: 100%;
        object-fit: none;
    }
</style>

<div class="parent">
    <img class="child" src="xxx" >
</div>
```

因为 `object-fit` 默认的值是 `fill`，所以这里需要显式地设置为 `none`。实际上这里起作用的不止是 `object-fit`，还有 `object-position`，只是刚好它的默认值是 `50% 50%`。这两个属性因为是 CSS3 的，所以兼容性也比较差。

（完）
