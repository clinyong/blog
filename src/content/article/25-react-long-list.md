title: React 长列表问题
date: 2018.07.16
---

在使用 antd 的 [select](https://ant.design/components/select-cn/) 组件的时候，当选项超过了一定数量，比如有 10000 个选项，这时候组件不管是点击弹出或者滚动都会特别的卡。当然这不是 antd 或者 React 的问题，而是前端开发里面比较常见的长列表问题。实际上并没有必要一次性把 10000 个选项都渲染出来，只需要渲染可视区域内的元素就行，这样明显数量要少得多。

React 社区这边比较知名的就是 [react-virtualized](https://github.com/bvaughn/react-virtualized)，我也是参考了这个库，写了一个简单够用的版本，[react-scroll-list](https://github.com/clinyong/react-scroll-list)。以及一个基于这个库的 select 组件，[react-large-select](https://github.com/clinyong/react-large-select)。

下面简单说下 `react-scroll-list` 的实现。首先看下这个组件接受的属性

```ts
export interface RowRendererParams {
	index: number;
	style: React.CSSProperties;
}

export interface ScrollListProps {
	height: number;
	rowHeight: number;
	total: number;
	rowRenderer: (params: RowRendererParams) => any;
}
```

`height` 是可视区域的高度，`rowHeight` 是每一行的高度，`total` 是总的有多少行，`rowRenderer` 是每一行要怎样渲染。看下 `render` 方法

```tsx
render() {
    const { height, total, rowHeight } = this.props;
    return (
        <div
            style={{
                overflowX: "hidden",
                overflowY: "auto",
                height
            }}
            onScroll={this.onScroll}
            ref={container => (this.scrollingContainer = container)}
        >
            <div
                style={{
                    height: total * rowHeight,
                    position: "relative"
                }}
            >
                {this.renderDisplayContent()}
            </div>
        </div>
    );
}
```

最外层的 `div` 为可视区域，并且设置超过的时候显示滚动条。里面的 `div` 设置完整的高度，也就是每一行的高度乘以总的行数。然后监听最外层的滚动事件。

```ts
onScroll = (e: React.UIEvent<any>) => {
    if (e.target === this.scrollingContainer) {
        const { scrollTop } = e.target as any;

        this.setState({
            scrollTop
        });
    }
};
```

每次滚动的时候，更新一下 scrollTop，触发 render。这里可以对 `onScroll` 做下限流。

```ts
get limit() {
    const { rowHeight, height } = this.props;
    return Math.ceil(height / rowHeight);
}

renderDisplayContent = () => {
    const { scrollTop } = this.state;
    const { rowHeight, rowRenderer, total } = this.props;

    const startIndex = Math.floor(scrollTop / rowHeight);
    const endIndex = Math.min(startIndex + this.limit, total - 1);

    let content = [];
    for (let i = startIndex; i <= endIndex; i++) {
        content.push(
            rowRenderer({
                index: i,
                style: {
                    height: rowHeight,
                    left: 0,
                    right: 0,
                    position: "absolute",
                    top: i * rowHeight
                }
            })
        );
    }

    return content;
};
```

最后是最核心的方法，`renderDisplayContent`，决定着可视区域里面显示哪些子元素。通过 `scrollTop` 我们可以知道应该从第几个子元素开始渲染，
然后通过 `height` 和 `rowHeight` 算出可视化区域可以显示的子元素个数，最终就可以知道结束的索引。然后调用 `rowRenderer` 方法，获得完整的显示列表。

（完）
