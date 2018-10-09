title: 在 macOS 上面安装多个版本的 Chrome
date: 2018.10.09
---

因为 Chrome 的自动更新功能，所以现在自己的电脑上面基本都是最新的版本。
前段时间对公司的网站进行构建的优化，下午同事反馈说有个客户的 Chrome 版本是 49，打开网站会报错。
为了在本地重现这个问题，只能装个低版本的了。但是又不想把经常用的 Chrome 删除掉，所以便查了下谷歌看能不能安装多个版本。

官方已经不提供历史版本下载，所以只能从第三方的网站下载。这里随便列举几个

- <https://google-chrome.en.uptodown.com/mac/old>
- <https://www.slimjet.com/chrome/google-chrome-old-version.php>

在上面的网站下载好对应版本的 Chrome，因为我们本地已经存在 Chrome，所以安装的时候需要选择保存多个版本。这里以版本 49 为例，重命名一下刚刚安装的 Chrome。

```bash
$ mv /Applications/Google\ Chrome\ 2.app /Applications/Google\ Chrome\ 49.app
```

`Google\ Chrome\ 2.app` 是默认生成的名字，这时候如果你直接打开的话，会发现还是运行的最新版本的。需要通过下面的命令行运行

```bash
$ "/Applications/Google Chrome 49.app/Contents/MacOS/Google Chrome" --user-data-dir="/Users/xxx/Library/Application Support/Google/Chrome49" > /dev/null 2>&1 &
```

把 `xxx` 换成对应的用户名。为了方便打开多个不同版本，可以把上面的命令封装成一个函数

```bash
function open-chrome() {
  "/Applications/Google Chrome $1.app/Contents/MacOS/Google Chrome" --user-data-dir="/Users/xxx/Library/Application Support/Google/Chrome$1" > /dev/null 2>&1 &
}
```

把上面的函数加到你的 `.bashrc` 当中，然后运行

```bash
$ open-chrome 49
```

就能运行刚刚安装的版本 49 的 Chrome。
