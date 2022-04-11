



## webpack是什么？实现什么功能？

“*webpack* 是一个现代 JavaScript 应用程序的***静态模块打包器(**module bundler)*。当 webpack 处理应用程序时，它会递归地构建一个***依赖关系图(dependency graph)***，其中包含应用程序需要的每个模块，然后将所有这些模块打包成一个或多个 *bundle*。"

​                                                                                                                                                                  ---webpack官方文档

## 核心概念

- 入口(entry)

  **入口起点(entry point)**指示 webpack 应该使用哪个模块，来作为构建其内部*依赖图*的开始。进入入口起点后，webpack 会找出有哪些模块和库是入口起点（直接和间接）依赖的。每个依赖项随即被处理，最后输出到称之为 *bundles* 的文件中。

- 输出(output)

  **output** 属性告诉 webpack 在哪里输出它所创建的 *bundles*，以及如何命名这些文件，默认值为 `./dist`。

- loader

  *loader* 让 webpack 能够去处理那些非 JavaScript 文件（webpack 自身只理解 JavaScript）。loader 可以将所有类型的文件转换为 webpack 能够处理的有效[模块](https://www.webpackjs.com/concepts/modules)，本质上，webpack loader 将所有类型的文件，转换为应用程序的依赖图（和最终的 bundle）可以直接引用的模块。

- 插件(plugins)

  插件目的在于解决 loader无法实现的**其他事**。与 Loader 用于转换特定类型的文件不同，**插件（Plugin）可以贯穿 Webpack 打包的生命周期，执行不同的任务**。由于**插件**可以携带参数/选项，因此必须在 webpack 配置中，向 `plugins` 属性传入 `new` 实例。

```js
//在webpack.config.js文件中添加以上配置。
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin'); // 通过 npm 安装
const webpack = require('webpack'); // 用于访问内置插件

module.exports = {
   //入口
  entry: './path/to/my/entry/file.js', 
   //出口
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'my-first-webpack.bundle.js'
  },
   //loader 
   module: {
       rules: [
          { test: /\.txt$/, use: 'raw-loader' } //test指示哪些文件应该被转换，use指示用哪个loader转换
        ]
  },
   //插件
  plugins: [
    new HtmlWebpackPlugin({template: './src/index.html'})
  ],
    //工作模式
  mode: 'development' 
  
};
```

-  webpack的mode字段告知 webpack 使用相应模式的内置优化，支持以下两个属性：

  ![mode](D:\vscode\Nyx\note-pei\front-end\image\webpack简要知识点\mode.png)

development模式为开发模式，打包更快，省了代码优化的步骤。production 生产模式，打包比较慢，开启压缩代码。

## 面试常问

- 配置相关

  - Loader
    - 用过哪些，有什么作用？
    - 如何编写？介绍思路。
  - Plugin
    - 用过哪些，有什么作用？
    - 如何编写？介绍思路
    - Loader和Plugin有什么区别？
  - Webpack optimize 有配置过吗？可以简单说说吗？
  - Babel 的如何配置？Babel 插件如何使用？

- 原理相关

  - Webpack 打包流程是怎样的？
  - tree-shaking 实现原理是怎样的？
  - Webpack 热更新（HMR）是如何实现？
  - Webpack 打包中 Babel 插件是如何工作的？

- 其他

  - Webpack 和 Rollup 有什么相同点与不同点？

  - Webpack5 更新了哪些新特性？

    

## 从0开始配置

### 1.安装

在项目文件夹下运行一下命令，安装webpack和webpack-cli

```
$ npm install webpack webpack-cli -D # 安装到本地依赖

//安装完成屏幕输出
+ webpack-cli@4.9.2
+ webpack@5.72.0
```

### 2.添加基础配置

在工作目录下新建./sre/index.js文件，文件内容如下：

```js
const a = 'Hello Webpack'
console.log(a)
module.exports = a;
```

在根目录下新建``webpack.config.js``文件，向内填入以下基本配置信息：

```js
const path = require('path')

module.exports = {
  mode: 'development', // 模式
  entry: './src/index.js', // 打包入口地址
  output: {
    filename: 'bundle.js', // 输出文件名
    path: path.join(__dirname, 'dist') // 输出文件目录
  }
}

```

直接在项目目录下运行``npx webpack``。根据设置将在dist目录下生成bundle.js文件就是将index.js打包好的文件。

### 3.常用Loader

介绍核心概念时我们提到webpack本身默认只支持处理JS文件（还有json文件），但是项目中还有html，css/less等等其他文件。这时候就需要借助Loader，将其他任何类型的文件转换为webpack可处理的文件。

- 安装css-loader来处理CSS

  ```
  npm install css-loader -D
  ```

- 新增./src/main.css

  ```css
  body {
    margin: 0 auto;
    padding: 0 20px;
    max-width: 800px;
    background: #f4f8fb;
  }
  ```

- 添加style-loader

    但是单靠 css-loader 是没有办法将样式加载到页面上。style-loader 就是将处理好的 css 通过 style 标签的形式添加到页面上。

    ```
    npm install style-loader -D
    ```
    style-loader 就是将处理好的 css 通过动态添加 style 标签的方式添加到页面上
    ```js
    const content = `${样式内容}`
    const style = document.createElement('style');
    style.innerHTML = content;
    document.head.appendChild(style);
    ```

- css3兼容性-- [postcss-loader](https://link.juejin.cn/?target=https%3A%2F%2Fwebpack.docschina.org%2Floaders%2Fpostcss-loader%2F)

  自动添加 CSS3 部分属性的浏览器前缀。

  ```
  npm install postcss postcss-loader postcss-preset-env -D
  ```

  创建 postcss 配置文件 `postcss.config.js`

  ```js
  // postcss.config.js
  module.exports = {
    plugins: [require('postcss-preset-env')]
  }
  
  ```

  创建 postcss-preset-env 配置文件 `.browserslistrc`

  ```
  # 换行相当于 and
  last 2 versions # 回退两个浏览器版本
  > 0.5% # 全球超过0.5%人使用的浏览器，可以通过 caniuse.com 查看不同浏览器不同版本占有率
  IE 10 # 兼容IE 10
  ```

- 引入less

  ```js
  $ npm install less-loader -D
  ```

- 在``webpack.config.js``文件中添加css-loader，style-loader，postcss-loader。

    ```js
    module: {
            rules: [ // 转换规则
                {
                    test: /\.css$/, //匹配所有的 css 文件
                    //test: /\.(l[e]|c)ss$/i, //匹配所有的 less/css 文件
                    // use: 对应的 Loader 名称，注意loader的执行顺序固定从后向前
                    use: ['style-loader',
                          'css-loader',
                          'postcss-loader',
                         'less-loader', ] 
                }
            ]
    }
    ```

- 图片loader

  ![图片loader.png](D:\vscode\Nyx\note-pei\front-end\image\webpack简要知识点\图片loader.png)

    ```js
    {
        test: /\.(jpe?g|png|gif)$/i, // 匹配图片文件
            use:[
                'file-loader' // 使用 file-loader
            ]
    }
    ```

- babel-loader

  在开发中我们想使用最新的 Js 特性，但是有些新特性的浏览器支持并不是很好，所以 Js 也需要做兼容处理，常见的就是将 ES6 语法转化为 ES5。

  为了避免 `webpack.config.js` 太臃肿，建议将 Babel 配置文件提取出来

  根目录下新增 `.babelrc.js`

  ```js
  // ./babelrc.js
  
  module.exports = {
    presets: [
      [
        "@babel/preset-env",
        {
          // useBuiltIns: false 默认值，无视浏览器兼容配置，引入所有 polyfill
          // useBuiltIns: entry 根据配置的浏览器兼容，引入浏览器不兼容的 polyfill
          // useBuiltIns: usage 会根据配置的浏览器兼容，以及你代码中用到的 API 来进行 polyfill，实现了按需添加
          useBuiltIns: "entry",
          corejs: "3.9.1", // 是 core-js 版本号
          targets: {
            chrome: "58",
            ie: "11",
          },
        },
      ],
    ],
  };
  
  
  ```

  

### 4.常用插件（plugin）

- [html-webpack-plugin](https://link.juejin.cn/?target=https%3A%2F%2Fwww.npmjs.com%2Fpackage%2Fhtml-webpack-plugin)--将打包后的.js或者.css文件自动引入到html文件中
- [clean-webpack-plugin](https://link.juejin.cn/?target=https%3A%2F%2Fwww.npmjs.com%2Fpackage%2Fclean-webpack-plugin)--每次打包前自动清空打包目录



## 原理学习





## 参考资料

- [🔥【万字】透过分析 webpack 面试题，构建 webpack5.x 知识体系 - 掘金 (juejin.cn)](https://juejin.cn/post/7023242274876162084)

- [概念 | webpack 中文网 (webpackjs.com)](https://www.webpackjs.com/concepts/)

- [腾讯面试官：兄弟，你说你会Webpack，那说说他的原理？ - 掘金 (juejin.cn)](https://juejin.cn/post/6987180860852142093)

