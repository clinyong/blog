title: 一个有趣的 CSS 属性 background-attachment
date: 2018.07.29
---

今天在看性能方面的问题的时候，发现还有一个 `background-attachment` 的 CSS 属性。看到 [w3schools](https://www.w3schools.com/howto/howto_css_parallax.asp) 上面的介绍，能实现一种挺酷的效果，叫做 Parallax Scrolling。具体可以看下 [demo](https://www.w3schools.com/howto/tryhow_css_parallax_demo.htm)。

先看下一段简单的 HTML

```html
<style>
    html,
    body {
        height: 100%;
        margin: 0;
        padding: 0;
    }

    .img {
        background-position: center;
        background-size: cover;
    }

    .img1 {
        background-image: url(https://www.w3schools.com/howto/img_parallax.jpg);
        min-height: 100%;
    }

    .img2 {
        background-image: url(https://www.w3schools.com/howto/img_parallax2.jpg);
        min-height: 400px;
    }
</style>

<body>
    <div class="img img1"></div>
    <div class="img img2"></div>
</body>
```

这段代码很普通，当页面滚动的时候，我们的图片会随着滚动。然后加下 `background-attachment` 属性

```css
.img {
    background-position: center;
    background-size: cover;
    background-attachment: fixed;
}
```

这时候就出现开头说的那种很酷的效果。具体表现就是，`div` 会随着滚动，但是 `div` 的背景图片的位置一直保持不变。

打开 Chrome 开发者工具，勾选上 [Paint flashing](https://developer.chrome.com/devtools/docs/rendering-settings)，滚动的时候，会发现整个页面都在重绘。如果不加 `background-attachment` 是不会有这个问题。

（完）
