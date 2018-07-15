title: cookie 笔记
date: 2018.07.11
---

过期时间，如果是 js 设置了过期时间的话。即使没到过期时间，关闭浏览器之后就会被清除。

针对过期时间，测试下

- 是不是过了真的会失效
- 设置一个较短的时间，看能不能获取到
- 做 api 请求的时候能不能带上（测试过期的）
- 给其它域名设置会有问题吗

### secure 与 httpOnly

`secure` 设置了 cookie 只能在 https 下面传输。`httpOnly` 则是让 js 没办法获取，设置，删除 cookie。

### expires 与 max-age

`expires` 表示 cookie 过期的时间点，兼容性最好。`max-age` 表示 cookie 过期的秒数。
