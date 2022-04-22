参考资料：

[HTML5新特性之Mutation Observer - 草根程序猿 - 博客园 (cnblogs.com)](https://www.cnblogs.com/jscode/p/3600060.html)

[【每周一题】如何监听页面 jsonp 请求 · 语雀 (yuque.com)](https://www.yuque.com/sunluyong/interview/wtqekn)



应用：使用Mutation Observer监听页面jsonp请求。

```js
const callbackFunctionNames = ['callback'];
const observer = new MutationObserver(mutations => {
  mutations.forEach(record => {
    record.addedNodes.forEach(node => {
      if (node.tagName !== 'SCRIPT') {
        return;
      }
      // 不严谨，只能探测 callback 固定的 jsonp 请求
      try {
        const { search } = new URL(node.src);
        for (let i = 0; i < callbackFunctionNames.length; i++) {
          if (search.indexOf(callbackFunctionNames[i]) !== -1) {
            console.log(node.src);
            break;
          }
        }
      } catch (ex) {}
    });
  });
});

observer.observe(document.head, {
  childList: true,
  attributeFilter: ['src'],
});
```

