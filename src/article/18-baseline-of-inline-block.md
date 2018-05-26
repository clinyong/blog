title: inline block 元素的基线位置
date: 2018.05.26
---

今天碰到了一个垂直对齐的问题

```html
<style>
    .content {
        display: inline-block;
        width: 100px;
        height: 30px;
        border: 1px solid black;
    }
</style>

<div class="box1">
    <span>xxx</span>
    <div class="content">
    </div>
</div>

<div class="box2">
    <span>xxx</span>
    <div class="content">
    xxx
    </div>
</div>
```

`box1` 里面左边的文字和右边盒子的下方对齐，`box2` 中左边的文字和右边盒子的上方对齐。一开始觉得特别奇怪，后面想起了在张鑫旭大大的[CSS世界](https://book.douban.com/subject/27615777/)里面有提到

> 一个 inline-block 元素，如果里面没有内联元素，或者 overflow 不是 visible，则该元素的基线就是其 margin 底边缘；否则其基线就是元素里面最后一行内联元素的基线。

虽然这本书非常的好，但是还是想着规范里面有没有对这种情况的说明呢？搜了一下谷歌，[确实有](https://www.w3.org/TR/CSS21/visudet.html#inlineblock-width)

> The baseline of an 'inline-block' is the baseline of its last line box in the normal flow, unless it has either no in-flow line boxes or if its 'overflow' property has a computed value other than 'visible', in which case the baseline is the bottom margin edge.

为了验证确实是与 margin 的底边缘对齐，设置一个大一点的 margin

```html
<style>
    .content {
        display: inline-block;
        width: 100px;
        height: 30px;
        border: 1px solid black;
        margin-bottom: 20px;
    }
</style>

<div class="box">
    <span>xxx</span>
    <div class="content">
    </div>
</div>
```

`overflow` 的值不为 `visible` 的情况

```html
<style>
    .content {
        display: inline-block;
        width: 100px;
        height: 30px;
        border: 1px solid black;
        margin-bottom: 20px;
        overflow: hidden;
    }
</style>

<div class="box">
    <span>xxx</span>
    <div class="content">
    xxx
    </div>
</div>
```

这里还能引出一个比较常见的问题，就是图片和文字放一起会出现底边距的情况

```html
<style>
    .container {
        border: 1px solid black;
    }
</style>

<div class="container">
    <img src="https://developer.cdn.mozilla.net/media/img/mdn-logo-sm.png">
</div>
```

可以看到图片的底部有边距，这是因为图片默认是 `inline-block` 的元素，这时候图片的 margin 底边距会与 [strut](https://www.w3.org/TR/CSS21/visudet.html#strut) 产生对齐。这里的 `strut` 相当于前面的 `xxx` 内联元素，是浏览器自动产生的。

知道了 `inline-block` 元素的基线位置之后，自然会想到那 `block` 元素的基线呢？这里讨论基线主要是为了知道如何与同一行元素进行垂直对齐，而 `block` 元素默认就是占据一整行，所以也就不存在垂直对齐的情况。
