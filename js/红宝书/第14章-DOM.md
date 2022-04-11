DOM，Document Object Model

- 文档对象模型，是HTML和XML文档 的编程接口。
- DOM表示由多层节点构成的文档
- 通过它开发者可以添 加、删除和修改页面的各个部分
- IE8及更低版本中：DOM是通过COM对象实现的。即DOM对象跟原生JavaScript对象具有不同的行为和功能

推荐直接看那个word文档的笔记，比较清晰，红宝书的太零碎了

# 14.1 节点层级

任何HTML/XML文档都可以用DOM树表示为一个有节点构成的层级结构，DOM中总共有12种节点类型

- document 根节点
- documentElement 文档元素，HTML中每个文档只有一个文档元素作最外层元素，即`<html>`

## 14.1.1 Node类型

Node是基准节点类型，是文档一个部分的抽象表示，所有其他类型 都继承Node。

### 01 节点属性

| 属性      | 含义                                           | 使用例                                                      |
| --------- | ---------------------------------------------- | ----------------------------------------------------------- |
| nodeType  | 表示节点类型，共12种，p634                     | someNode.nodeType == Node.ELEMENT_NODE                      |
| nodeName  | 取决于节点类型，元素节点的nodeName等于其标签名 | `if (someNode.nodeType == 1){ value = someNode.nodeName; }` |
| nodeValue | 取决于节点类型，元素节点的nodeValue等于null    | 使用nodeName和nodeValue前，最好先检查节点类型               |

### 02 节点关系

childNodes属性：包含NodeList实例

- 中括号访问或用item()方法，一般用中括号就可以
``` js
someNode.childNodes[0]
someNode.childNodes.item(0)
```
- NodeList虽然是类数组对象，但是还不是数组，转化成数组的方法，一般用Array.from
``` js
Array.from(someNode.childNodes) // ES6
Array.prototype.slice.call(someNode.childNodes,0)
```

根据父子同胞关系访问节点见图：
![](/img/ch14/1.png)

| 属性            | 返回值                   |
| --------------- | ------------------------ |
| childNodes      | 所有子元素NodeList       |
| hasChildNodes() | 布尔值，有子元素true     |
| parentNode      | 父元素                   |
| previousSibling | 前一同胞                 |
| nextSibling     | 后一同胞                 |
| firstChild      | 第一个子元素             |
| lastChild       | 最后一个子元素           |
| ownerDocument   | 文档节点（所有元素共享） |

### 03 操纵节点 *

| 方法           | 含义                                                         | 使用例                                               |
| -------------- | ------------------------------------------------------------ | ---------------------------------------------------- |
| appendChild()  | 在childNodes末尾插入节点，返回新节点                         | someNode.appendChild( newNode )                      |
| insertBefore() | 在参照节点前插入，参照节点为空，在末尾插入，返回新节点       | someNode.insertBefore( newNode, someNode.firstNode ) |
| replaceChild() | 插入新节点替换原节点，返回新节点                             | someNode.replaceChild( newNode, someNode.firstNode ) |
| removeChild()  | 移除节点，返回被移除的节点                                   | someNode.removeChild( someNode.firstNode )           |
| cloneNode()    | 返回一个一模一样的的节点并返回，输入参数是一个布尔值表示是否深拷贝：<br>true，则深复制，复制节点及其整个子DOM树（无父有子）<br>false，则只复制当前节点（无父无子） | someNode.replaceChild( true )                        |
| normalize()    | 处理文档子树中的文本节点，后面再说                           |                                                      |

## 14.1.2 Document类型

Document文档节点类型，特征：

- nodeType等于9； nodeName值为"#document"； nodeValue值为null； 
- parentNode值为null； ownerDocument值为null； 
- 子节点可以是DocumentType（最多一个）、Element（最多一 个）、ProcessingInstruction或Comment类型。

Document类型可以表示HTML页面或XML文档，但最常用的是document对象，以获取页面信息、操纵页面外观和底层结构。在浏览器中，文档对象document：

- 是HTMLDocument（继承Document）的实例，表示整个HTML页面
- document是window对象的属性，是全局对象

### 01 文档子节点

document对象访问子节点的快捷方式：

1. documentElement属性：指向HTML页面的`<html>`元素
2. body属性：指向`<body>`元素，因为这个元素用的最多

文档类型的子节点：

- Element：最多1个，就是`<html>`

- DocumentType：最多1个，声明doctype属性，该属性是只读的，不能改
- Comment：出现在`<html>`外的注释，不同浏览器对它的解析不同

```html
<!DOCTYPE html>
<!-- 第一条注释 -->
<html>
    <head>
    </head>
    <body>
    </body>
</html>
```

上一节提到的节点操作函数一般不用在Document上，没有意义

### 02 文档信息

document关于文档信息的属性

| 属性     | 含义                                                         |
| -------- | ------------------------------------------------------------ |
| title    | 文档标题，可以修改浏览器标题栏                               |
| URL      | 页面完整URL，不能设置                                        |
| domain   | 域名，可以设置，但不能设置URL中不包含的值<br>另，domain放松后就不能再收紧。<br>例：设置为`"wrox.com"`之后，就不能设置回`"p2p.wrox.com"`，后者会导致错误 |
| referrer | 来源，链接到当前页面的那个页面的URL，没有则`""`，不能设置    |

另，domain的使用场景：

页面包含来自不同子域的`<frame>`（已废弃）或`<iframe>`（[将另一个HTML页面嵌入到当前页面](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/iframe)）时，不同子域的页面不能通过Javascript通信，但是在每个页面上把domain设置为相同值，就可以互相通信了

### 03 定位元素

从DOM树上获取元素

| 方法                   | 含义                                                         | 使用例                                 |
| ---------------------- | ------------------------------------------------------------ | -------------------------------------- |
| getElementById()       | 接收id，返回第一个元素，没有则返回null，区分大小写           | `document.getElementById("myDiv")`     |
| getElementsByTagName() | 接收标签名，返回相应元素的HTMLCollection，HTML中不区分大小写（p645） | `document.getElementsByTagName("img")` |
| getElementsByName()    | 接收name属性，返回HTMLCollection。一般用于单选按钮，因为单选按钮必须有相同name属性 | ` document.getElementsByName("color")` |

HTML文档中，后两个方法返回HTMLCollection实例，类似于NodeList，他有一个`namedItem()`方法，可以按name返回某一项的引用

``` js
let images = document.getElementsByTagName("img");
let myImage = images.namedItem("myImage");
let myImage2 = images["myImage"]; //等效
//获取包含所有元素的HTMLCollection
let allElements = document.getElementsByTagName("*"); 
```

### 04 特殊集合

document暴露了几个特殊集合，返回HTMLCollection实例

- document.anchors包含文档中所有带`name`属性的元素。 
- document.forms包含文档中所有`<form>`元素 
  -  `document.getElementsByTagName ("form")`
- document.images包含文档中所有`<img>`元素 
  - `document.getElementsByTagName ("img")` 
- document.links包含文档中所有带`href`属性的`<a>`元素。

### 05 DOM兼容性检测

hasFeature()方法，已废弃

### 06 文档写入

document方法，在页面加载期间向文档流中动态写入内容

| 方法      | 含义                                           |
| --------- | ---------------------------------------------- |
| write()   | 接收字符串，写入文档流                         |
| writeln() | 接收字符串，在末尾追加换行符，写入文档流       |
| open()    | 打开文档流，调用上面两个方法写入就不用特意open |
| close()   | 关闭文档流                                     |

``` html
<html>
    <head>
    	<title>document.write() Example</title>
    </head>
    <body>
        <p>The current date and time is:
            <script type="text/javascript">
                    document.write("<strong>" + (new Date()).toString() + "</strong>");
            </script>
        </p>
    </body>
</html>
```

## 14.1.3 Element类型

特征：

- nodeType等于1； nodeName值为元素的**标签名**(tagName)； nodeValue值为null； 
- parentNode值为Document或Element对象； 
- 子节点可以 是Element、Text、Comment、ProcessingInstruction、CDATASection 类型。

### 01 HTML元素

所有HTML元素共有的标准属性：

- id，元素在文档中的唯一标识符； 
- title，包含元素的额外信息，通常以提示条形式展示；
- lang，元素内容的语言代码（很少用）；
- dir，语言的书写方向（"ltr"表示从左到右，"rtl"表示从右 到左，同样很少用）； 
- className，相当于class属性，用于指定元素的CSS类（因 为class是ECMAScript关键字，所以不能直接用这个名字）。

所有HTML元素及对应属性见**p653**

### 02 取得属性 *

**getAttribute()**：传入属性名（不区分大小写），返回属性值，自定义属性的属性值也可以返回（自定义属性名应该前缀`data-`以方便验证。）

``` html
<div id="myDiv" my_special_attribute="hello!"></div>
```

``` js
let value = div.getAttribute("my_special_attribute");
```

通过DOM对象访问的属性中有两个返回的值跟使用getAttribute() 取得的值不一样。

- style属性，用于为元素设定CSS 样式。
  - getAttribute()访问style属性，返回的是**CSS字符串**。
  - DOM对象的属性访问style属性，返回的是一个 （CSSStyleDeclaration）对象。DOM对象的style属性用于以编程 方式读写元素样式，因此不会直接映射为元素中style属性的字符 串值。 
- 事件处理程序（或者事件属性），比如 onclick。
  - 在元素上使用事件属性时（比如onclick），属性的值是 一段JavaScript代码。
  - 如果使用getAttribute()访问事件属性，则返 回的是字符串形式的源代码。
  - 而通过DOM对象的属性访问事件属性时返回的则是一个JavaScript函数（未指定该属性则返回null）。 这是因为onclick及其他事件属性是可以接受函数作为值的。

``` html
<div id="hello" style="color: red;">
        Hello!
</div>
<button id="btn" onclick="changeColor()">change color</button>
<script>
    let div=document.getElementById("hello")
    let btn=document.getElementById("btn")
    function changeColor(){
        div.setAttribute("style","color:blue;")
        console.log(div.getAttribute("style"))
    }
    console.log(div.getAttribute("style"))  // color: red;
    console.log(div.style)                  // CSSStyleDeclaration
    console.log(btn.getAttribute("onClick"))// changeColor()
    console.log(btn.onclick)                // ƒ onclick(event) {changeColor()}
</script>
```

### 03 设置属性 *

**setAttribute()**：传入属性和要修改的值，设置的属性名会规范为小写形式

removeAttribute()：从元素中删除属性

### 04 attributes属性

attributes属性包含一个NamedNodeMap实例，是一个类 似NodeList的“实时”集合。可以操作属性等于name的节点

元素的每个属性都表示为一个Attr节 点，并保存在这个NamedNodeMap对象中。

NamedNodeMap对象包含下 列方法： p657

- getNamedItem(name)，返回nodeName属性等于name的节点； 
- removeNamedItem(name)，删除nodeName属性等于name的节点； 
- setNamedItem(node)，向列表中添加node节点，以其nodeName 为索引； item(pos)，返回索引位置pos处的节点。

### 05 创建元素 *

document.createElement()方法创建新元素，输入参数为标签名，在HTML中不区分大小写

### 06 元素后代

childNotes属性，访问元素所有子节点
