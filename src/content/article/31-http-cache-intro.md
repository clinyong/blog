title: http 缓存简介
date: 2018.07.31
---

http 的缓存主要有下面三种类型的指令

- `ETag/If-None-Match`
- `Last-Modified/If-Modified-Since`
- `Pragma/Expires/Cache-Control`

先说前面两种。

服务器端在返回响应的时候，可以根据响应的内容生成一个 `Etag`，客户端在下一次请求的时候，通过 `If-None-Match` 带上这个 `Etag` 的值。服务器端拿到之后，判断新的内容生成的 `Etag` 和之前的一不一样，一样的话，返回 304，不一样的话，返回 200。

除了这种策略外，还有就是第二种。当服务器返回响应的时候，用 `Last-Modified` 来表示这次内容的修改时间。客户端在下次请求的时候，通过 `If-Modified-Since` 带上上次 `Last-Modified` 的值。然后服务器判断一下这个值，如果文件在这个时间之后没改变，则返回 304。如果改变了，则返回 200。

可以看到 `ETag/If-None-Match` 和 `Last-Modified/If-Modified-Since` 达到的效果非常类似，那一般用哪个呢？对于静态文件来说，服务器端可以直接用 `mtime` 作为 `Last-Modified` 的值。对于一些动态生成的内容，比如从数据库查出来，则可以对内容做一次 hash，作为 etag 的值。

上面两种类型的指令，决定了服务器在下一次相同的请求的时候，是返回 304 还是 200。如果是 304 的话，其实就不用把具体的内容返回回去。然而不管是 304 还是 200，浏览器还是要做一次请求查询一下。而第三种类型的指令，则可以让浏览器不做任何网络请求，直接从本地获取内容。

在 `Pragma/Expires/Cache-Control` 这组指令中，一般都会使用 `Cache-Control`。而要用到另外两个的原因，只是因为 `Cache-Control` 是比较新的指令，担心一些老的浏览器识别不了。这里以 `Cache-Control: max-age=60` 为例子，说下这组指令起的作用。

当服务器返回 `Cache-Control: max-age=60`，浏览器在 60 秒内，不会再对服务器发送请求，而是直接通过本地缓存读取。当我用 Chrome 的浏览器在试这个指令的时候，打开开发者工具，刷新页面，发现即使是在 `max-age` 的范围内，浏览器还是会发送请求给服务器。后面在网上找到了这个[答案](https://stackoverflow.com/questions/11245767/is-chrome-ignoring-cache-control-max-age)，原来是 Chrome 故意做的策略，当刷新当前页面的时候，Chrome 实际会忽略 `Cache-Control` 的指令。那要怎样才能看到效果呢？只有当你复制页面的链接地址，粘贴到新开的 tab 里面，如果这时候还在缓存的时间内，则 Chrome 会直接从本地读取。

（完）
