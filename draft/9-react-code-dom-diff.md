title: 阅读 React 源码之 Diff 算法
date: 2017.08.27
---

React 的 Diff 算法分为 3 部分

- tree diff
- component diff
- element diff

Diff 发生在 setState 之后

react/src/renderers/dom/shared/ReactDOMComponent.js 的 `updateComponent`

```js
this._updateDOMProperties(lastProps, nextProps, transaction);
this._updateDOMChildren(
    lastProps,
    nextProps,
    transaction,
    context
);
```

```js
// For quickly matching children type, to test if can be treated as content.
var CONTENT_TYPES = {'string': true, 'number': true};

_updateDOMChildren: function(lastProps, nextProps, transaction, context) {
    var lastContent =
      CONTENT_TYPES[typeof lastProps.children] ? lastProps.children : null;
    var nextContent =
      CONTENT_TYPES[typeof nextProps.children] ? nextProps.children : null;

    var lastHtml =
      lastProps.dangerouslySetInnerHTML &&
      lastProps.dangerouslySetInnerHTML.__html;
    var nextHtml =
      nextProps.dangerouslySetInnerHTML &&
      nextProps.dangerouslySetInnerHTML.__html;

    var lastChildren = lastContent != null ? null : lastProps.children;
    var nextChildren = nextContent != null ? null : nextProps.children;
}
```

如果只是 content 不一样的话，比如 `<div>hello</div>` 变成 `<div>world</div>`，调用 `ReactMultiChild.updateTextContent`
如果是 dangerouslySetInnerHTML 不一样的话，调用 `ReactMultiChild.updateMarkup`
如果两个 dom 节点的类型不一样的话，比如从 `div` 换到 `span`，`shouldUpdateReactComponent` 为 false，调用 `ReactCompositeComponent._replaceNodeWithMarkup`
如果两个组件不一样，比如从 `<Show />` 换到 `<Hide />`，`shouldUpdateReactComponent` 为 false，调用 `ReactCompositeComponent._replaceNodeWithMarkup`
