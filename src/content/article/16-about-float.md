title: 关于 float
date: 2018.04.08
---

在看 [Front-end-Developer-Interview-Questions](https://github.com/h5bp/Front-end-Developer-Interview-Questions/blob/master/questions/css-questions.md) 的时候，发现里面一道题目

> Describe Floats and how they work.

开始真正学前端算比较晚，目前公司的业务也都是可以直接使用 flexbox，所以平时也基本不用 float 去做布局。所以看到这道题目，也算是可以好好总结下 float。

winter 大大之前在他的[文章](https://github.com/wintercn/blog/issues/4)里面提到过

> 面试的时候问个css的position属性能刷掉一半的人这是啥情况……
> 其实这问题我本来打算的是可以顺着一路扯到normal flow、containing block、bfc、margin collapse，base line，writing mode，bidi

那么对于这个问题，我们可以想到什么呢？

- 什么是 float
- 为什么会有 float
- float 怎么工作
- float 应用的实际场景
- float 有什么问题，对应的解决办法是什么

### 什么是 float

float 是一个 CSS 的属性，一个元素设置了这个属性之后，就会被移动到包含块（containing block）的左边或者右边。当然这里边可能会有很多种情况，比如向左浮动时，左边就已经有浮动元素；向右浮动时，右边已经有浮动元素；当前行不够宽，导致放不下浮动元素。

float 的值有下面四个

- none（默认值）
- left
- right
- inherit

一个元素设置成了浮动之后，会有下面的特性

- 周围的文本也会环绕着这个浮动元素
- 这个浮动元素会脱离正常的文档流，但又会影响正常的文档流（不像绝对定位那样）

### 为什么会有浮动

浮动的出现是为了能实现文字环绕图片的效果。在 Netscape 早期的版本里面，通过下面这样让图片浮动

```html
<img src="b5.gif" align="right">
```

这时候的浮动也只能应用在图片上面，后面 CSS 中加入了 float 属性，允许浮动任何元素。

### float 怎么工作

上面说了，浮动是为了实现文字环绕图片的效果。而为了达到这种效果，CSS 规范里面规定了浮动的两种特性

- 浮动会使父元素的高度塌陷
- 行框盒子与浮动元素的不可重叠性，若在垂直高度发生重叠，则行框盒子会紧跟在浮动元素

先来说第一个特性

```html
<style>
    .father {
        border: 1px solid #000;
    }

    .img {
        width: 25px;
        height: 50px;
        background-color: black;
    }
</style>

<div>
    <div class="father">
        <div class="img"></div>
    </div>
    <div class="content">
        哈哈哈哈哈 哈哈哈哈哈 哈哈哈哈哈 哈哈哈哈哈哈哈
    </div>
</div>
```

在上面这个例子中，我们可以看到 `father` 这个 div 把里面的 `img` 围住了，导致没办法接触到下面那一行文字。为了实现文字环绕效果，我们要让下面的文字近可能靠近 `img`，所以可以让 `father` 的高度为 0。


```html
<style>
    .father {
        border: 1px solid #000;
        height: 0;
    }

    .img {
        width: 25px;
        height: 50px;
        background-color: black;
    }
</style>

<div>
    <div class="father">
        <div class="img"></div>
    </div>
    <div class="content">
        哈哈哈哈哈 哈哈哈哈哈 哈哈哈哈哈 哈哈哈哈哈哈哈
    </div>
</div>
```

当然这样子做，会让文字和图片发生重叠。所以就需要第二个特性出场了，第二个特性规定了不能重叠，文字要紧跟着图片。所以我们在 `content` 上面加多一个 `padding`

```html
<style>
    .father {
        border: 1px solid #000;
        height: 0;
    }

    .img {
        width: 25px;
        height: 50px;
        background-color: black;
    }

    .content {
        padding-left: 25px;
    }
</style>

<div>
    <div class="father">
        <div class="img"></div>
    </div>
    <div class="content">
        哈哈哈哈哈 哈哈哈哈哈 哈哈哈哈哈 哈哈哈哈哈哈哈
    </div>
</div>
```

经过上面的处理之后，我们就能人为地实现文字环绕着图片的效果了。这里也可以验证一下，在 `img` 上面直接加上浮动

```html
<style>
    .father {
        border: 1px solid #000;
    }

    .img {
        width: 25px;
        height: 50px;
        background-color: black;
        float: left;
    }
</style>

<div>
    <div class="father">
        <div class="img"></div>
    </div>
    <div class="content">
        哈哈哈哈哈 哈哈哈哈哈 哈哈哈哈哈 哈哈哈哈哈哈哈
    </div>
</div>
```

可以看到，效果是一模一样的。这里还要注意一点，上面我们为了避免重叠，在 `content` 上面加了 padding。在这里可以设置 margin 吗？答案是不可以的。CSS 规范里面规定，只有行框盒子才不会重叠，而外面的块级盒子是会和浮动元素重叠的。我们可以再次验证一下

```html
<style>
    .father {
        border: 1px solid #000;
    }

    .img {
        width: 25px;
        height: 50px;
        border: 1px solid #000;
        float: left;
    }

    .content {
        background-color: chocolate;
    }
</style>

<div class="container">
    <div class="father">
        <div class="img"></div>
    </div>
    <div class="content">
        哈哈哈哈哈 哈哈哈哈哈 哈哈哈哈哈 哈哈哈哈哈哈哈
    </div>
</div>
```

为了能够比较清楚地看到结果，把 `img` 的背景去掉，加上边框。然后给 `content` 加上一个背景。可以很清楚地看到，`content` 和 `img` 是重叠在一起的。

### 应用场景

浮动虽然是为了文字环绕图片出现的，但是后面更多被人拿来做多列布局。比如一侧定宽的两栏布局

```html
<style>
    .img {
        width: 25px;
        height: 50px;
        background-color: black;
        float: left;
    }

    .content {
        margin-left: 30px;
        height: 50px;
        background-color: chocolate;
    }
</style>

<div class="father" >
    <div class="img"></div>
    <div class="content"></div>
</div>
```

注意上面的 `content` 宽度并没有固定，只是设置了 `margin-left`，依然保留自身良好的自适应性。

### 问题和对应的解决方案

因为浮动最早是为了实现文字环绕效果的，最后却被用做布局，所以会很容易出现一些意想不到的情况。比如上面说的父元素高度塌陷，不理解浮动的人会认为是个 bug。
上一节的布局，如果浮动元素的高度过高，可能就会带来意外的结果

```html
<style>
    .img {
        width: 25px;
        height: 100px;
        background-color: black;
        float: left;
    }

    .content {
        margin-left: 30px;
        height: 50px;
        background-color: chocolate;
    }
</style>

<div>
    <div class="father" >
        <div class="img"></div>
        <div class="content"></div>
    </div>
    
    <div class="text" >
    哈哈哈
    </div>
</div>
```

把 `img` 的高度改为 100，这样就会超出父元素的高度，导致了下面的文字环绕着这个 `img`。而我们可能是希望文字是跟在 `father` 后面，而不是环绕着图片。所以可以在文字上面加上清除浮动。


```css
.text {
    clear: both;
}
```

clear 有下面 4 个常见的属性

- none：默认值，不会清除浮动
- left：清除前面的左浮动
- right：清除前面的右浮动
- both：清除前面的左右浮动

clear 设置为非 `none` 的元素，则**前面**不能和浮动元素相邻。注意这里是前面，所以后面还是可以跟着浮动元素的。`left` 和 `right` 基本没什么作用，要用到这两个值的场景都可以用 `both` 来做替换，所以一般清除的时候也是直接用 `both`。

虽然清除浮动的名字叫清除，但是却不会把前面元素的浮动效果给去掉。只是让自己不和浮动元素在一行显示而已

```html
<style>
    .father::after {
        display: block;
        content: "";
        clear: both;
    }

    .img {
        width: 25px;
        height: 100px;
        background-color: black;
        float: left;
    }

    .content {
        margin-left: 30px;
        height: 50px;
        background-color: chocolate;
    }

    .text {
        margin-top: -10px;
    }
</style>

<div>
    <div class="father" >
        <div class="img"></div>
        <div class="content"></div>
    </div>
    
    <div class="text" >
    哈哈哈
    </div>
</div>
```

上面给 `father` 加上了一个伪元素用于清除浮动，因为 clear 属性只对块级元素起作用，所以需要在伪元素上显式设置 display 属性。然后故意让后面的 `text` 向上移动了 10px，导致了和 `img` 发生重叠，使得其受到浮动的影响。所以用 clear 清除浮动并没有把浮动元素的效果去掉。

由此可见，clear 属性只能在一定程度消除浮动的影响，如果想要完美地消除，只能靠触发 BFC

```html
<style>
    .father {
        overflow: hidden;
    }

    .img {
        width: 25px;
        height: 100px;
        background-color: black;
        float: left;
    }

    .content {
        margin-left: 30px;
        height: 50px;
        background-color: chocolate;
    }

    .text {
        margin-top: -10px;
    }
</style>

<div>
    <div class="father" >
        <div class="img"></div>
        <div class="content"></div>
    </div>
    
    <div class="text" >
    哈哈哈
    </div>
</div>
```

我们把伪元素去掉，在 `father` 上面加上 `overflow:hidden`，触发 BFC 特性。可以看到文字和 `img` 重叠在一起，说明完美清除掉了浮动的影响。
