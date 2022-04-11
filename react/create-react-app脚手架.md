# 脚手架create-react-app

## 参考资料

- [Create React App 中文文档](https://create-react-app.bootcss.com/docs/getting-started)
- [create-react-app入门教程](https://www.jianshu.com/p/77bf3944b0f4)

## 安装

```
 # 全局安装
npm install -g create-react-app
# 构建一个my-app的项目
npm create-react-app my-app
# 或者使用yarn安装
yarn create react-app my-app

cd my-app

# 启动编译当前的React项目，并自动打开 http://localhost:3000/
npm start
```

 项目默认目录

```
    ├── package.json
    ├── public                  # 这个是webpack的配置的静态目录
    │   ├── favicon.ico
    │   ├── index.html          # 默认是单页面应用，这个是最终的html的基础模板
    │   └── manifest.json
    ├── src
    │   ├── App.css             # App根组件的css
    │   ├── App.js              # App组件代码
    │   ├── App.test.js
    │   ├── index.css           # 启动文件样式
    │   ├── index.js            # 启动的文件（开始执行的入口）！！！！
    │   ├── logo.svg
    │   └── serviceWorker.js
    └── yarn.lock

```

### 常用命令

```
 #启动开发
 npm start
 #or
 yarn start

#启动测试
npm test
#or
yarn test

#构建生产版本
npm run build
#or
yarn build

#解压默认的webpack配置到配置文件中
npm run eject

```

### yarn包管理工具

```
 #yarn升级到最新版本
 npm install yarn@latest -g

 #查看yarn版本
 yarn --version
```
