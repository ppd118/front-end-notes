# Git 常用命令

## 设置代理

```js
//浏览器能访问github而vscode无法正常pull和push，可能是因为浏览器走了代理而git没有走代理
//这时候需要从代理软件中找到http代理的端口号，并输入如下命令为git配置
git config --global --add remote.origin.proxy "127.0.0.1:(proxy http port number)"//如果之前配置过需要关闭代理，可按如下命令重置
// http version
git config --global --unset http.proxy
// https version
git config --global --unset https.proxy
```

###### 参考博客

* [无法连接至github-443错误-StackOverflow解决方案](https://stackoverflow.com/questions/49345357/fatal-unable-to-access-https-github-com-xxx-openssl-ssl-connect-ssl-error/56673262)
* [无法连接至github-443错误-CSDN解决方案](https://blog.csdn.net/qq_37555071/article/details/114260533)
