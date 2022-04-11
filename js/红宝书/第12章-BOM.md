# **第12章 BOM**

## 本章内容

* 理解BOM的核心——window对象
* 控制窗口及弹窗
* 通过location对象获取页面信息
* 使用navigator对象了解浏览器
* 通过history对象操作浏览器历史

BOM提供了与网页无关的浏览器功能对象。

<!--more-->

## 1. window对象

### 1.1 Global作用域

window对象被复用为ES的Global对象，所以通过var声明的所有全局变量和函数都会变成window对象的属性和方法。**如果使用let或者const代替var则不会把变量添加给全局对象。**

### 1.2 窗口

* **窗口位置：** moveTo()和moveBy()方法移动窗口，都接收两个参数，前者接收移动到的新位置的绝对坐标x和y,后者接收相对于当前位置移动的像素数。
* **窗口大小：** outerWidth和outerHeight返回浏览器窗口自身的大小，innerWidth和innerHeight返回浏览器窗口中页面视口的大小。在移动设备上，window.innerWidth和window.innerHeight返回视口的大小，也就是屏幕上页面可视区域的大小。
* **窗口缩放：** 可以使用resizeTo()和resizeBy()方法调整窗口大小。这两个方法都接收两个参数，resizeTo()接收新的宽度和高度值，而resizeBy()接收宽度和高度各要缩放多少。
* **打开窗口：** window.open(url, 目标窗口名，特性字符串，新窗口在浏览器历史记录中是否替代当前加载页面的布尔值)。将在目标窗口内打开url。特性字符串用于指定新窗口的配置，是一个逗号分隔的设置字符串，包含以下选项。window.open()会返回一个对新建窗口的引用，使用改返回对象.close()方法可以关闭新打开的窗口（只适用于open创建的新窗口）。关闭窗口以后，窗口的引用虽然还在，但只能用于检查其closed属性。
  ![img](image/第12章-BOM/1645517649462.png)
  ```javascript
  window.open("http://www.wrox.com/",
    "wroxWindow",
    "height=400,width=400,top=10,left=10,resizable=yes");
  ```

这行代码会打开一个可缩放的新窗口，大小为400像素×400像素，位于离屏幕左边及顶边各10像素的位置。

### 1.3 视口

可以使用window.scroll()、scrollTo()和scrollBy()方法滚动页面。这3个方法都接收表示相对视口距离的和坐标，这两个参数在前两个方法中表示要滚动到的坐标，在最后一个方法中表示滚动的距离。

### 1.4 定时器

* setTimeout(函数，等待的毫秒数)，等待毫秒时间后执行函数。在指定时间后将任务加入到任务队列，如果队列为空则立即执行代码否则等前面任务完成后才执行。

  ```javascript
  // 在1秒后显示警告框
  setTimeout(() => alert("Hello world!"), 1000);
  ```
* setInterval(函数，间隔毫秒数)，每间隔毫秒数执行函数???怎么中断（eventloop）
* clearTimeout(ID)，前面两个代码都会返回一个表示该超时排期的数值ID，使用clearTimeOut(ID)可在指定时间到达前取消任务。
* 注意：所有超时执行的代码（函数）都会在全局作用域中的一个匿名函数中运行，因此函数中的this值在非严格模式下始终指向window，而在严格模式下是undefined。如果给setTimeout()提供了一个箭头函数，那么this会保留为定义它时所在的作用域。

### 1.5 系统对话框

* 警告框：alert(字符串)，在浏览器上显示字符串内容（传入非字符串会经toString()转换为字符串），有一个”OK“按钮。
* 确认框：confirm(字符串)，在浏览器对话框中显示字符串内容，有”OK“确认按钮和"Cancel"取消按钮，该函数有返回值，用户点击”OK“返回true否则返回false用于知道程序接下来的运行
* 提示框：prompt(显示给用户的文本， 文本框默认值)。有”OK“确认按钮和"Cancel"取消按钮和一个可供用户输入的文本框，单击OK返回文本框中的值，单击Cancel或关闭文本框则返回null。

## 2. location对象

提供了当前窗口中加载文档的信息及常用导航功能。即使window属性也是document属性，window.location和document.location指向同一个对象。

### 2.1 url解析值

#### 2.1.1 location自带解析

例如当前加载为http://foouser:barpassword@www.wrox.com:80/WileyCDA/?q=javascript#contents

![](image/第12章-BOM/1645689883035.png)![](image/第12章-BOM/1645689897360.png)

#### 2.1.2 URLSearchParams

给URLSearchParams构造函数传入一个查询字符串，就可以创建一个实例。使用get()、set()和delete()等方法对查询字符串执行相应操作。

```javascript
let qs = "?q=javascript&num=10";
let searchParams = new URLSearchParams(qs);
alert(searchParams.toString()); // " q=javascript&num=10"
searchParams.has("num"); // true
searchParams.get("num"); // 10
searchParams.set("page", "3");
alert(searchParams.toString()); // " q=javascript&num=10&page=3"
searchParams.delete("q");
alert(searchParams.toString()); // " num=10&page=3"

```

### 2.2 网页重加载

* 转入新的url并在历史记录中增加一条记录。除了hash之外，只要修改location的任意一个属性，就会导致页面重新加载新URL。

  ```javascript
  //这3种方法都会立即启动导航到新URL的操作
  location.assign("http://www.wrox.com");
  window.location = "http://www.wrox.com";
  location.href = "http://www.wrox.com";
  ```
* 不增添浏览记录的方法：location.replace(url)
* 重新加载当前页

  ```javascript
  location.reload(); // 重新加载，可能是从缓存加载
  location.reload(true); // 重新加载，从服务器加载
  ```

## 3.navigator对象

navigator对象的属性通常用于确定浏览器的类型。p589

### 3.1 检测插件

通过window.navigator的plugins数组来确定。数组中每一项包含以下属性：

- name：插件名称。
- description：插件介绍。
- filename：插件的文件名。
- length：由当前插件处理的MIME类型数量。

## 4. screen对象

不常用，保存的是浏览器窗口外面的客户端显示器的信息。
![](image/第12章-BOM/1645692223519.png)

## 5. history对象

表示**当前**窗口**首次**使用以来用户的导航历史记录，这个对象不会暴露用户访问过的URL，但可以通过它在不知道实际URL的情况下前进和后退。

- go:go()方法可以在用户历史记录中沿任何方向导航，可以前进也可以后退。
  ```javascript
   // 后退一页
   history.go(-1);
   // 前进一页
   history.go(1);
   // 导航到最近的wrox.com页面
   history.go("wrox.com");
   // 导航到最近的nczonline.net页面
   history.go("nczonline.net");
   // 后退一页
   history.back();
   // 前进一页
   history.forward();
  ```
- length: history.length表示历史记录中有多少个条目。
- H5新增：pushState(state对象， ”title“, "baz.html（相对url)")。pushState()方法执行后，状态信息就会被推到历史记录中，浏览器地址栏也会改变以反映新的相对URL。但浏览器页不会向服务器发送请求。
