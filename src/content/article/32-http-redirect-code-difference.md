title: http 各种重定向状态码的区别
date: 2018.08.01
---

常用的重定向状态码有哪些呢？

- 301
- 302
- 303
- 307

网上解释的文章很多，看下来还是没理解明白。《HTTP权威指南》这块也没讲清楚，还是老老实实看下[规范](https://tools.ietf.org/html/rfc7231)吧。

### 301

> The 301 (Moved Permanently) status code indicates that the target resource has been assigned a new permanent URI and any future references to this resource ought to use one of the enclosed URIs.

301 表示请求的资源已经永久换了地址，下次就不要再用这个地址了，而用返回头部的新地址。

对于我们普通用户来说，我们并不关心这些状态码，比如当我们在用浏览器访问一个页面的时候，也不会因为是返回 301，就在下次访问的时候用新的地址。实际上，浏览器已经帮我们做了这个事情。写个简单的例子测试一下。

```js
const express = require("express");
const morgan = require("morgan");
const app = express();

app.set("etag", false);

const port = "1234";
const url = `http://localhost:${port}`;

app.use(morgan(":method :url :status"));
app.get("/301", function(req, res) {
  res.redirect(301, url + "/200");
});
app.get("/200", function(req, res) {
  res.send("hello world");
});

console.log(`Listening on ${url}`);

app.listen(port);
```

`morgan` 是一个 express 打印路由日志的中间件，这里我们也把 `etag` 去掉，避免缓存的影响。

接着先用 Chrome 访问 `http://localhost:1234/301`，然后再新开一个 tab，再次访问 `/301` 路径。下面是终端打印出来的路由。

```
GET /301 301
GET /200 200
GET /200 200
```

可以看到，第二次请求的时候，浏览器直接访问了 `/200` 这个路径。

### 302

> The 302 (Found) status code indicates that the target resource resides temporarily under a different URI. The client ought to continue to use the effective request URI for future requests.

302 表示这个资源只是暂时换了地址，下次访问的时候还是继续用原来的地址。在上面的 `express` 例子增加一条路由测试 302。

```js
app.get("/302", function(req, res) {
  res.redirect(302, url + "/200");
});
```

然后按同样的方法，两次访问这个地址，看下终端的输出。

```
GET /302 302
GET /200 200
GET /302 302
GET /200 200
```

嗯，和规范说的一样，第二次还是访问原先的地址。

### 303

> The 303 (See Other) status code indicates that the server is redirecting the user agent to a different resource
>
> A user agent can perform a retrieval request targeting that URI (a GET or HEAD request if using HTTP)
>
> This status code is applicable to any HTTP method. It is primarily used to allow the output of a POST action to redirect the user agent to a selected resource.

首先，303 返回的是另外一个资源。不像上面两个，都是指向同个资源，只是地址发生改变。客户端，也就是 user agent 在做重定向的时候，需要用 GET 和 HEAD 方法。最后是 303 主要是用来处理 POST 请求。

规范对于 303 的描述有点难理解，于是乎再查了下[维基百科](https://www.wikiwand.com/zh-hans/HTTP_303)和 [MDN](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Status/303)。如果对于一个 POST 请求，要返回一个新的页面，比如消息确认页面或上传进度页，这时候就应该用 303。

用 `express` 试了一下，对于重定向 POST 请求，用 301/302/303 返回，浏览器的行为都是一样的。但是在实际的开发当中，应该还是照着规范来比较好。

### 307

> The user agent MUST NOT change the request method if it performs an automatic redirection to that URI.
>
> This status code is similar to 302 (Found), except that it does not allow changing the request method from POST to GET.

307 和 302 基本一样，唯一的区别在于重定向的时候不能改变请求方法。我们在上面的 `express` 例子加多一个 POST 的路由

```js
app.post("/307", function(req, res) {
  res.redirect(307, url + "/200");
});
```

然后写一个简单的表单

```html
<form action="/307" method="POST">
    <button>submit</button>
</form>
```

当我们访问这个页面，点击 submit 的时候，终端的路由输出如下

```
POST /307 307
POST /200 404
```

因为我们并没有注册一个 POST 方法到 `/200` 的路径，所以返回 404。可以看到，第二次的重定向请求，浏览器是用 POST 方法。

写完这篇文章的感受，做了这么多年 web 开发，终于理解了各个重定向状态码的区别。:-(

（完）
