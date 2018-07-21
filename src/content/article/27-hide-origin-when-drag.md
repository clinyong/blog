title: 在拖拽时隐藏原目标
date: 2018.07.20
---

这是在看 [Drap and Drop](https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API) 的笔记。

要设置一个目标可拖动很简单，只需要在加个 `draggable` 的属性就可以了，就像下面这样

```html
<div draggable="true">Hello World</div>
```
默认的话，原先的目标不会被隐藏。所以想着监听 `dragstart` 事件，在开始拖动的时候隐藏掉原来的目标

```html
<div draggable="true" ondragstart="onDragStart(event)">Hello World</div>

<script>
function onDragStart(evt) {
    const ele = evt.target;
    ele.style.visibility = "hidden";
}
</script>
```

实际会发现，并不会起作用。我们再监听一下 `drag` 事件，这个事件会在目标被拖动期间触发。

```html
<div draggable="true" ondragstart="onDragStart(event)" ondrag="onDrag()" >Hello World</div>

<script>
function onDragStart(evt) {
    const ele = evt.target;
    ele.style.visibility = "hidden";
}

function onDrag() {
    console.log("on drag");
}
</script>
```

可以看到，并不会触发 `drag` 事件，也就是并没有发生拖动。通过对多种情况的测试，比如在 `dragstart` 的时候，改变 `display`，设置 `translate`，都会导致没办法拖动。这里猜测，对只是猜测，因为还没有去翻规范。认为在一开始拖动的时候，如果目标元素在当前位置不可见，包括被移动了，或者被隐藏了，都会导致没办法拖动。

后面在网上看到一种比较 hack 的[方法](https://stackoverflow.com/questions/36379184/html5-draggable-hide-original-element)

```js
function onDragStart(evt) {
    const ele = evt.target;
    setTimeout(function(){
        ele.style.visibility = "hidden";
    }, 0)
}
```

这里加了一个 `setTimeout` 之后就可以达到我们想要的效果。如果不用考虑兼容性问题的话，可以用 `requestAnimationFrame` 代替。

（完）
