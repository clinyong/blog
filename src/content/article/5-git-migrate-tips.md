title: Git 仓库迁移技巧
date: 2017.06.10
---

公司内部有两个和 ERP 相关的前端项目，A 和 B。组长接手了重构的任务，要把 A 和 B 合成一个仓库 C。

在合并完成测试期间，有其他同事还在不断地往 A 上面提交代码。所以组长准备把 A 和 B 这两个仓库删掉，叫我去把上面 master 分支的代码都同步到 C。

一开始想着一个个 commit 去对比，然后手动复制粘贴过来。当然这种是比较不好的做法。后面查了一下，发现可以跨仓库进行 `cherry-pick`，嗯，Git 真是强大。

首先，在 C 仓库里面把 A 仓库设置为 remote

```
$ git remote add A xxx
```

对比一下两个仓库的 master 分支有哪些不同

```
$ git log --graph --pretty=format:'%Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cr)%Creset' --abbrev-commit master..A/master
```

命令是从 [stackoverflow](https://stackoverflow.com/questions/13965391/how-do-i-see-the-commit-differences-between-branches-in-git) 找的，其中 `master..A/master` 就是我们要对比的两个分支。

然后可以看到像下面这样的输出

```
*   a4b04ab -(A/master) Merge branch 'hotfix/selfStation' into 'master' (4 days ago)
|\
| * ba3b7ac - (A/hotfix/selfStation) 增加级连选择更换区域 (9 days ago)
* |   52badfb - Merge branch 'hotfix/selfStation' into 'master' (2 weeks ago)
|\ \
| |/
| * 3320185 - 增加二级站点名 (2 weeks ago)
| * 4017a49 - 站点类型，delivery类型传0 (2 weeks ago)
| * 609cad5 - 屏蔽regionid的传入 (2 weeks ago)
| * c501a60 - 增加站点区域切换功能 (2 weeks ago)
| * e2cbf59 - getelderregion 接口调用 (2 weeks ago)
| * 2d0efd6 - 屏蔽对区域id的手工修改 (2 weeks ago)
* |   4c4b2be - Merge branch 'hotfix/selfStation' into 'master' (3 weeks ago)
|\ \
| |/
| * 0d70942 - 响应后端自取点亲子规则修改 (3 weeks ago)
|/
*   3bc2f37 - Merge branch 'feature/selfStationAdds' into 'master' (3 weeks ago)
|\
| * c9bd89d - (A/feature/selfStationAdds) 配合取货优化进行修改 (3 weeks ago)
| * 46145bd - 增加gitignore (3 weeks ago)
*   6612a8b - Merge branch 'master' of xxx into hotfix/ExportSignature (4 weeks ago)
|\
| *   5e09aec - Merge branch 'hotfix/ExportSignature' (4 weeks ago)
| |\
* | | 1fa187b - 修复bug (4 weeks ago)
| |/
|/|
* | f96fab2 - 解决冲突 (4 weeks ago)
|/
* e925f96 - add v (4 weeks ago)
```

知道有哪些 commit 是不一样之后，剩下的工作只需要 `cherry-pick` 过去就行了。

```
$ git cherry-pick xxx
```

当然每个 commit 这样迁移，不免效率有点低。得益于我们公司严格的 Git 提交流程，可以从上面的提交历史中看到类似这样的 commit

```
3bc2f37 - Merge branch 'feature/selfStationAdds' into 'master' (3 weeks ago)
```

这是因为我们在合并执行了 [no fast forward](https://stackoverflow.com/questions/9069061/what-is-the-difference-between-git-merge-and-git-merge-no-ff) 的策略。

所以我们只需要执行

```
$ git cherry-pick -m 1 3bc2f37
```

这样就能一次性地把 `feature/selfStationAdds` 都迁移过去。
