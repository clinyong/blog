title: textContent，innerText，innerHTML 的区别
date: 2018.06.30
---

先说下 `textContent` 和 `innerText`，根据 [MDN 文档](https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent)，最大的区别在于 `innerText` 会计算样式，`textContent` 不会。

```html
<div id="test" >
    <div style="display:none" >
        test
    </div>
</div>

<script>
    const e = document.getElementById("test");
    console.log(e.innerText);
    console.log(e.textContent); // test
</script>
```

用 `innerText` 取到的值为空字符串，而 `textContent` 就能正确取到值。这里还要注意，`display:none` 是放在子元素那里，像下面这样则都能取到文本。

```html
<div id="test" style="display:none" >
    test
</div>

<script>
    const e = document.getElementById("test");
    console.log(e.innerText); // test
    console.log(e.textContent); // test
</script>
```

另外一个例子

```html
<div id="test" style="text-transform: uppercase" >
    test
</div>

<script>
    const e = document.getElementById("test");
    console.log(e.innerText); // TEST
    console.log(e.textContent); // test
</script>
```

可以看到 `innerText` 取到的文本应用了 css 样式。因为 `innerText` 会计算样式，所以性能比 `textContent` 要差。

现在这两个 API 也都是被加入到标准当中，不过 `innerText` 是在 [HTML 标准](https://html.spec.whatwg.org/multipage/dom.html#the-innertext-idl-attribute)，而 `textContent` 是在 [DOM 标准](https://dom.spec.whatwg.org/#dom-node-textcontent)

所以综上，对于要插入和获取文本，优先选择 `textContent`。

然后说下 `innerHTML`，它会先把要插入的内容先转成 HTML 格式，所以和上面两个的区别也很明显。但是 `innerHTML` 的使用有两点需要注意。

`innerHTML` 并不会执行 `script`里面的内容

```html
<div id="test"></div>

<script>
document.getElementById("test").innerHTML = "<script>alert(1)<\/script>";
</script>
```

当然上面并不表示 `innerHTML` 是绝对安全的，向下面这样还是会被注入

```html
<div id="test">
</div>

<script>
    document.getElementById("test").innerHTML = "<img src='x' onerror='alert(1)'>"
</script>
```

所以如果只是插入文本的话，还是用 `textContent`。

另外一点，有的标签不能直接作为 `div` 的子元素，比如 `td`，否则浏览器会当作是普通文本。

```html
<div id="test">
</div>

<script>
    document.getElementById("test").innerHTML = "<td>hello</td>"
</script>
```

这里只会插入 `hello` 的文本，并不会插入 `td` 标签。

（完）
