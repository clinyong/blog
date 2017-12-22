title: linear-gradient 笔记
date: 2017.12.22
---

最近在看 [CSS 揭秘](https://book.douban.com/subject/26745943/)，里面用 `linear-gradient` 实现了一个斜向条纹的例子

```css
background: linear-gradient(45deg,
                #fb3 25%, #58a 0, #58a 50%,
                #fb3 0, #fb3 75%, #58a 0);
```

颜色后面的数字是具体的位置，但是多个颜色一组合就看不懂了。先是查了一下 [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/linear-gradient)，还是一知半解。最后不得不翻阅对应的[规范文档](https://drafts.csswg.org/css-images-3/#color-stop)，才算完全了解了用法。

先来看看规范中的定义

```
linear-gradient() = linear-gradient(
  [ <angle> | to <side-or-corner> ]? ,
  <color-stop-list>
)
```

第一个参数是角度，这里我们不多做介绍，直接来看下 `color-stop-list`。

```
<color-stop-list> = <color-stop>#{2,}
<color-stop> = <color> <length-percentage>?
```

`color-stop-list` 是由多个 `color-stop` 组成，这里的多个指的是两个或者两个以上。`color-stop` 由一个颜色和长度组成。而这里我们也着重讲下长度，也就是 `length-percentage`。

`length-percentage` 可以为百分比或者具体的长度，比如 `25px`，`50%` 这样。它有下面几条重要的规则，并且规则之间有优先级。命中了第一条规则就不会检查第二条。

1. 如果第一个 `color-stop` 没有 `length-percentage`，将其设置为 `0%`。如果是最后一个没有，将其设置为 `100%`。
2. 如果一个 `color-stop` 的 `length-percentage` 比它前面某个 `color-stop` 的值小，将这个 `length-percentage` 改为它前面所有 `color-stop` 里面的最大值。
3. 经过上面两个规则之后，如果这个 `color-stop` 还是没有值，则将其位于它前后两个 `color-stop` 的中间。

接下来我们按照上面的规则，来看下几个具体的例子。其中 `=x=>` 的 `x` 标示用了哪个几个规则。

```
1. linear-gradient(red, white 20%, blue)
   =1=>
   linear-gradient(red 0%, white 20%, blue 100%)

2. linear-gradient(red 40%, white, black, blue)
   =13=>
   linear-gradient(red 40%, white 60%, black 80%, blue 100%)

3. linear-gradient(red -50%, white, blue)
   =13=>
   linear-gradient(red -50%, white 25%, blue 100%)

4. linear-gradient(red -50px, white, blue)
   =13=>
   linear-gradient(red -50px, white calc(-25px + 50%), blue 100%)

5. linear-gradient(red 20px, white 0px, blue 40px)
   =2=>
   linear-gradient(red 20px, white 20px, blue 40px)

6. linear-gradient(red, white -50%, black 150%, blue)
   =12=>
   linear-gradient(red 0%, white 0%, black 150%, blue 150%)

7. linear-gradient(red 80px, white 0px, black, blue 100px)
   =23=>
   linear-gradient(red 80px, white 80px, black 90px, blue 100px)
```

（完）
