title: 新工作半年总结以及学习 Deno 的一点感受
date: 2019.03.09
---

这篇文章原本是 2 月份工作总结，最后一段个人总结也记录了最近学 Deno 的一点感受，所以就一起贴到博客。

## 正文

2 月份也刚好转正，虽然每周只放一天假，还是觉得时间比以前过得快很多。

技术上面，半年的时间，大部分时候都处于自己的舒适圈，虽然在团队里面有一点小的产出，但是比起其他同学，感觉自己没什么进步。自己属于非科班出身的程序员，加上之前也没好好努力，导致到现在计算机基础都很差。后面也会把更多业余时间放在这块。

另外一点感触比较深的是，有一个晚上发布移动端的组件包，刚发布完不久，下载量一下子就到了 30 多万，那时候真是对写代码这件事有了敬畏之心。

最后分享一下最近在看的 Deno 源码。很早之前就知道 Deno，一开始只是 watch 了它的 release。每周都能收到更新邮件，所以偶然又搜了一点 Deno 的资料。在看到 [A Guide to Deno Core](https://denolib.gitbook.io/guide/) 后，发现自己还是很有机会能看懂整个实现，所以就一发不可收拾。。。

看完实现之后，大概可以知道下面这些

- 编程语言，Rust，C++，Go，TypeScript，Python
- Chrome 的构建系统，GN，Ninja
- flatbuffers，protobuf
- V8
- ...

上面只是独立地罗列了一些点，当把这些都结合在一起的时候就会变得很有趣。比如各种语言之间是怎样通信的，为什么用 flatbuffers 代替 protobuf，怎样把 TypeScript 的编译器加入到 V8 的快照里面等。

因为 Deno 意外地接触到 Rust，不愧是 [StackOverflow](https://insights.stackoverflow.com/survey/2018/#most-loved-dreaded-and-wanted) 上面最受开发者喜欢的语言，体验真的很好。而且 Rust 对 Node 的[支持](https://github.com/neon-bindings/neon)也挺好的。

看官方文档关于[内存管理](https://doc.rust-lang.org/book/ch04-01-what-is-ownership.html)这块提到

> Note: In C++, this pattern of deallocating resources at the end of an item’s lifetime is sometimes called Resource Acquisition Is Initialization (RAII).


Deno 要调用 V8 的 API，所以也有一部分 C++ 的代码，里面出现很多类似下面这样的写法

```cpp
v8::Isolate* isolate = v8::Isolate::New(params);

{
  v8::HandleScope handle_scope(isolate);
}
```

`HandleScope` 是一个类，这里创建了一个 `handle_scope` 的变量。一开始觉得这种写法特别奇怪，在看了[《Node.js：来一打 C++ 扩展》](https://book.douban.com/subject/30247892/)之后才知道，这里利用了 C++ 作用域中对象生命周期的特性。查了下谷歌，原来这种特性就是 Rust 文档说的 `RAII`，真是有种 [connect the dots](https://youtu.be/UF8uR6Z6KLc?t=55) 的感觉。
