

# React原理学习--Build your own React

这是一篇基于[Rodrigo Pombo](https://pomb.us/)的博客[Build your own React](https://pomb.us/build-your-own-react/) 简要了解React运作原理的学习笔记，React16.8版本。这篇笔记只是为了方便之后复习所作，整体基本是翻译原文，原文中代码会跟随设计思路渐近切换和高亮，有更好的交互体验，强烈建议看下原文。前端小小白，有问题请大家指正！！

## Step 0 :了解React、JSX和DOM的运作关系

首先忽略React的一些相关细节代码，从最简单的以下3行代码切入：

```jsx
//生成一个h1节点添加到root节点下
const element = <h1 title="foo">Hello</h1>
const container = document.getElementById("root")
ReactDOM.render(element, container)
```

JSX一种JavaScript语法扩展，在React中可以方便地用来显式定义UI。本质上，JSX为我们提供了创建React元素方法（`React.createElement(component, props, ...children)`）的语法糖。

首先第一行用JSX语法生成了一个element(为了便于区分，React构建的元素称为element，DOM 元素称为node)，经过Babel编译后变为JS。编译过程就是将JSX表达式中的tag name，props，children等作为参数调用React.creactElement函数生成React元素。

```js
//JSX语法编译过程
const element = <h1 title="foo">Hello</h1>
            |
            |
            V
const element = React.createElement(
  "h1", //tag name
  { title: "foo" }, //props
  "Hello" //children
)
//最终函数生成的对象
const element = {
  type: "h1",
  props: {
    title: "foo",
    children: "Hello",
  },
}
```

最终生成的React element就是一个包含两个属性type,props的对象（还包含其他属性，但暂时只关心这两个属性）。其中type可以是一个string，对应DOM node名称以及我们使用传统js方法document.createElement时传入的tagName。type也可以是一个function，但到Step VIII再解释。

props是一个对象属性，包含了JSX语法传入的所有属性的键值对以及children。在这个例子中children是一个字符串“Hello”，但通常是一个array，里面包含其他的React Elements，由于这样的嵌套关系每个React element也是一棵树。

除了第一行的JSX语法，第3行也是React代码，render的过程是React改变DOM的过程，它的编译过程简化如下：

```js
ReactDOM.render(element, container)
            |
            |
            V
const node = document.createElement(element.type) // 根据第一行中生成的element对象中的type属性创建DOM node,'h1'
node["title"] = element.props.title // 'foo' 绑定各个属性

//创建node的children
//这里使用creatTextNode的方式而不是innerText的方式，保证我们接下来对其他类型的孩子元素也可以用相同的方式创建
const text = document.createTextNode("")
text["nodeValue"] = element.props.children

//将构建的DOM nodes依次组装起来添加到定义的container中
node.appendChild(text)
container.appendChild(node)
```

到这里我们将所有React相关的语句都编译成了纯JS的操作。



## Step I: creatElement实现

在前1步中我们了解了JSX语句编译过程中调用creatElement函数**生成了一个包含type和props属性的JS对象**。实现creatElement就是构建这个对象的过程。

```js
const element = (
  <div id="foo">
    <a>bar</a>
    <b />
  </div>
)
            |
            |
            V
const element = React.createElement(
  "div",
  { id: "foo" },
  React.createElement("a", null, "bar"),
  React.createElement("b")
)

function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      children,
    },
  }
}
```

用扩展操作符...对props进行扩展，用rest运算符收集children元素，这样element元素中props属性的children属性就能对应一个array。

element的children可以是element或者string或者number，在上面的代码中我们只包含了element的情况，还需要为字符串和数字类型的children创建一种生成方法。

```js
function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...props,
		children: children.map(child =>
        typeof child === "object"
          ? child
          : createTextElement(child)
      ),
    },
  }
}

function createTextElement(text) {
  return {
    type: "TEXT_ELEMENT",
    props: {
      nodeValue: text,
      children: [],
    },
  }
}
```

==**注意：**==React中并不会包装原始值或在没用children的情况下创建空数组，但在此篇教程中为了简化实现，便于理解原文做了上述功能。接下来我们将用我们自己实现的类React功能的库Didact进行讲解和进一步实现。

```js
const Didact = {
  createElement,
}

const element = Didact.createElement(
  "div",
  { id: "foo" },
  Didact.createElement("a", null, "bar"),
  Didact.createElement("b")
)
```



## Step II: render初步实现

这一步中将实现我们自己的ReactDOM.render函数，这里只关注DOM添加的操作，更新和删除的步骤下面的步骤中再介绍。

render函数中，用传进的element.type属性创建一个DOM node并添加这个新建节点到container中，对每个孩子元素将递归调用这个步骤。

```js
function render(element, container) {
  //根据emlement.type创建DOM元素
  const dom =
    element.type == "TEXT_ELEMENT"
      ? document.createTextNode("")
      : document.createElement(element.type)
 
  //props赋值给新建的DOM node
  const isProperty = key => key !== "children"
  Object.keys(element.props)
    .filter(isProperty)
    .forEach(name => {
      dom[name] = element.props[name]
    })
  
  //对element的每个children递归调用render生成DOM元素并组装成树
  element.props.children.forEach(child =>
    render(child, dom)
  )

  container.appendChild(dom)
}
```



## Step III：unit式render

在编写更多功能前，我们还需要对上一步中的render进行完善，因为render中children是递归生成的，我们无法中断这个过程，只能等到整棵树构建完成。

如果这棵树很大，那么它的构建将阻断主线程较长时间，而当主线程中有诸如处理用户输入，保证动画平滑等需要较高优先级的操作时这样的等待是不利的。

所以我们将这整个render过程分成许多小单元(unit)，每个小单元执行完如果主线程有操作需要执行，则将会允许中断渲染。

```js
let nextUnitOfWork = null

function workLoop(deadline) {
  let shouldYield = false
  //render整个过程被分为许多unit，每执行完一个unit判断是否到允许中断的时间
  //当render完毕（没有unit）或到系统中断时间跳出循环
  while (nextUnitOfWork && !shouldYield) {
      //操作当前unit并返回下一个work unit
    nextUnitOfWork = performUnitOfWork(
      nextUnitOfWork
    )
    shouldYield = deadline.timeRemaining() < 1
  }
    //control交给浏览器主线程，实现浏览器主线程同render操作间的交替循环
  requestIdleCallback(workLoop)
}

//可以看作是一个没有明确时延的setTimeout，当主线程空闲时它将会执行回调函数
requestIdleCallback(workLoop) //react现在用scheduler package代替了这个方法，但是他们在思想上是一致的


function performUnitOfWork(nextUnitOfWork) {
  // TODO
}
```



## Step IV：Fibers

为了实现上一步中units式的工作，我们需要新建一个数据结构--Fiber树。每个element对应一个fiber，一个work unit内操作一个fiber。

建立这个数据结构的目的之一就是为了能便捷的找到下一个work unit需要操作的东西，基于这个目标，每个fiber有一个指向first child，一个指向紧邻的下一个sibling和一个指向parent的"指针"。

可以理解为，为了便于查找下一个work unit在原element两个属性{type,props{props,children array}}的基础上又添加了孩子，兄弟，父亲几个“指针”。

```jsx
Didact.render(
  <div>
    <h1>
      <p />
      <a />
    </h1>
    <h2 />
  </div>,
  container
)
```

![Fiber Tree](D:\vscode\Nyx\note-pei\front-end\React\images\fiber_tree.png)

在render中我们只执行创建root fiber然后将它赋值给nextUnitOfWork的操作，其余操作将在c中完成（如而上版本中render内创建DOM node的部分将被封装放到performUnitOfWork中完成）。

nextUnitOfWork被赋值后，requestIdleCallback(workLoop)调用workLoop，workLoop内将从当前nextUnitOfWork执行操作，以unit式的工作方式，创建整棵DOM树。

根据这个思想，我们将重写render，但是保留其中创建DOM node的部分并封装，供performUnitOfWork内调用。

```js
//上次实现时render中的create DOM node的部分
function createDom(fiber) {
  const dom =
    fiber.type == "TEXT_ELEMENT"
      ? document.createTextNode("")
      : document.createElement(fiber.type)

  const isProperty = key => key !== "children"
  Object.keys(fiber.props) //之前是原生js对象，element.props
    .filter(isProperty)
    .forEach(name => {
      dom[name] = fiber.props[name]
    })

  return dom
}

function render(element, container) {
   nextUnitOfWork = {
    dom: container,
    props: {
      children: [element],
    },
  }
}
let nextUnitOfWork = null
```

接下来实现performUnitOfWork，在这个函数中对每个fiber我们会做以下三件事：

- 创建node并添加到DOM中
- 为这个fiber的children（这里是props内的children array，而不是首孩子child“指针”）建立fibers
- 选择下一个fiber进入work unit。

确定下一个fiber的顺序为：

- 当前fiber有child，选第一个child作为下一个work unit
- 当前fiber无child，选sibling作为下一个
- 无child无sibling，选"uncle"即父节点的sibling。例如这个例子中的a-->h2
- 无child无sibling父节点也无sibling，则向上寻找知道找到父辈的sibling或者到达root，到达root则说明这个render以及完成。

fiber内的dom属性存储为当前fiber创建的真实的DOM node。

```js
function performUnitOfWork(fiber) {
  //1.创建node并添加到DOM中
  if (!fiber.dom) {
    fiber.dom = createDom(fiber)
  }

  if (fiber.parent) {
    fiber.parent.dom.appendChild(fiber.dom)
  }
    
  //2.为当前fiber的childrens创建fiber
  const elements = fiber.props.children
  let index = 0
  let prevSibling = null

  while (index < elements.length) {
    const element = elements[index]

    const newFiber = {
      type: element.type,
      props: element.props,
      parent: fiber, //每个fiber对象都有指向parent的“指针”
      dom: null,
     }
     
    //构建"父子指针"，如果是首孩子，则当前fiber的child指向这个新建的fiber
     if (index === 0) {
       fiber.child = newFiber
     } else {
       //构建“兄弟指针”,前一个children fiber的sibling指向当前children fiber
       prevSibling.sibling = newFiber
     }

     prevSibling = newFiber
     index++
   }
    
   //3.寻找下一个进入work unit的fiber：child-->sibling-->uncle
      if (fiber.child) {
          return fiber.child
      }
    //找自己的兄弟节点
      let nextFiber = fiber
      while (nextFiber) {
        if (nextFiber.sibling) {
          return nextFiber.sibling
        }
     //找父辈的兄弟节点     
        nextFiber = nextFiber.parent
      }

}
```



## Step V：构建完后再render

基于上一步的实现，我们每个unit中都会添加一个新的node到DOM中，但是在我们构建并渲染完整棵树前，每次unit结束浏览器主线程都可能会打断渲染，这样用户可能看到不完整的UI。

为解决这个问题，我们希望整棵DOM树都构建完成再提交渲染。首先不能在每个unit中生成一个node就将它添加到DOM中，因此我们删除performUnitOfWork中每生成一个新node就添加进DOM中的操作。

```js
//删除 performUnitOfWork中以下几行
if (fiber.parent) {
    fiber.parent.dom.appendChild(fiber.dom)
  }
```

然后我们用一个全局变量wipRoot（work in progress root）跟踪（保存）当前正构建的树的根节点的fiber。在workLoop内探测到整棵树都渲染完成（没有下一个work unit)则从 root fiber开始遍历，添加每个fiber内保存在fiber.dom中创建的DOM nodes到DOM树中。

```js
function render(element, container) {
   nextUnitOfWork = {
    dom: container,
    props: {
      children: [element],
    },
  }
}
let nextUnitOfWork = null
         |
         |
         V
function render(element, container) {
    //保存当前正在构建的树的根节点的fiber
  wipRoot = {
    dom: container,
    props: {
      children: [element],
    },
  }
  nextUnitOfWork = wipRoot
}

let nextUnitOfWork = null
/**新增： work in progress root 保存当前正在构建的树的根节点***/ 
let wipRoot = null
/*******/   

function workLoop(deadline) {
  let shouldYield = false
  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(
      nextUnitOfWork
    )
    shouldYield = deadline.timeRemaining() < 1
  }
  /**新增：整棵树都渲染完成则commit***/ 
  if (!nextUnitOfWork && wipRoot) {
    commitRoot()
  }
  /*****/   
  requestIdleCallback(workLoop)
}
requestIdleCallback(workLoop)

function commitRoot() {
  commitWork(wipRoot.child)
  wipRoot = null
}

function commitWork(fiber) {
  if (!fiber) {
    return
  }
  const domParent = fiber.parent.dom
  domParent.appendChild(fiber.dom)
  commitWork(fiber.child)//第一个孩子
  commitWork(fiber.sibling)//兄弟节点
}
```



## Step VI：更新和删除时的render

前面的部分只实现了添加nodes到DOM中，这个部分将实现更新和删除nodes。

更新和删除需要将当前commit的fiber tree和上一次render中的fiber tree进行比较。因此还需要新建一个全局变量指向上一次的fiber tree root--->currentRoot，每次commit的时候都将当前commit的fiber root存到currentRoot中，并且每棵fiber tree都有一个属性指向上次commit的fiber root。

```js
function commitRoot() {
  commitWork(wipRoot.child)
  currentRoot = wipRoot //新增，用于存上一次commit的fiber tree的root
  wipRoot = null
}
function render(element, container) {
  wipRoot = {
    dom: container,
    props: {
      children: [element],
    },
    alternate: currentRoot,//新增，每一棵fiber tree都有一个属性指向上次commit的fiber tree root
  }
  nextUnitOfWork = wipRoot
}

let nextUnitOfWork = null
let currentRoot = null //新增
let wipRoot = null
```

我们首先将performUnitOfWork中为当前fiber的children新建fiber的部分拆出来，单独封装成一个函数，在这里面分别讨论增加，更新和删除的操作。

```js
function performUnitOfWork(fiber) {
  //1.创建DOM元素
  if (!fiber.dom) {
    fiber.dom = createDom(fiber)
  }
    
  //2.为当前fiber的children elements对比old fiber执行新增，更新和删除的操作
  const elements = fiber.props.children
  reconcileChildren(fiber, elements)
    
   //3.寻找下一个进入work unit的fiber：child-->sibling-->uncle
      if (fiber.child) {
          return fiber.child
      }
    //找自己的兄弟节点
      let nextFiber = fiber
      while (nextFiber) {
        if (nextFiber.sibling) {
          return nextFiber.sibling
        }
     //找父辈的兄弟节点     
        nextFiber = nextFiber.parent
      }
}


function reconcileChildren(wipFiber, elements){
    //elements是我们当前想渲染到dom中的，oldFiber是上一次渲染到dom中的，我们需要迭代比较这两者来决定应该执行什么操作
    let index = 0
    let oldFiber = wipFiber.alternate && wipFiber.alternate.child
    let prevSibling = null

    while (index < elements.length || oldFiber !=null) {
        const element = elements[index]
        const newFiber = null
        //这里我们用fiber和element中都存在的type进行比较,在React中用keys来比较能更好的探测到变化？？？？？？
        const sameType =
              oldFiber &&
              element &&
              element.type == oldFiber.type

        if (sameType) {
          // update the node
          //使用oldFiber的dom但更新props为element中的props
            newFiber = {
                type: oldFiber.type,
                props: element.props,
                dom: oldFiber.dom,
                parent: wipFiber,
                alternate: oldFiber,
                effectTag: "UPDATE", //新增一个标志属性，在commit阶段使用
          }
        }
        if (element && !sameType) {
          // add this node
            newFiber = {
                type: element.type,
                props: element.props,
                dom: null,
                parent: wipFiber,
                alternate: null,
                effectTag: "PLACEMENT",
          }
        }
        if (oldFiber && !sameType) {
          // delete the oldFiber's node
            oldFiber.effectTag = "DELETION" //由于此时没有新fiber只能将标记添加到oldFiber上？？？作用是什么
      		deletions.push(oldFiber) //但是当我们commit时是在wipRoot上，所以需要一个array跟踪这些fibers
        }
        
        
         if (index === 0) {
             wipFiber.child = newFiber
        else if (element) {
             prevSibling.sibling = newFiber  
         }
		
        prevSibling = newFiber
         
        //按层比较
        if(oldFiber){
            oldFiber = oldFiber.sibling
        }
        index++
   }
}

let nextUnitOfWork = null
let currentRoot = null 
let wipRoot = null
let deletions = null //新增，用于存储需要删除的node    
function render(element, container) {
  wipRoot = {
    dom: container,
    props: {
      children: [element],
    },
    alternate: currentRoot,
  }
  deletions = []
  nextUnitOfWork = wipRoot
}
```

```js
function commitRoot() {
  deletions.forEach(commitWork) //需要删除的不在wipFiber上，用一个全局的array记录下来单独删除
  commitWork(wipRoot.child)
  currentRoot = wipRoot
  wipRoot = null
}

//上一版本中的commitWork只有新增操作，这一版本根据每个fiber的effectTag做出相应反应
function commitWork(fiber) {
  if (!fiber) {
    return
  }
  const domParent = fiber.parent.dom
  //domParent.appendChild(fiber.dom)
  
  //新增node
  if (
    fiber.effectTag === "PLACEMENT" &&
    fiber.dom != null
  ) {
    domParent.appendChild(fiber.dom)
  }else if (
     //更新node
    fiber.effectTag === "UPDATE" &&
    fiber.dom != null
  ) {
    updateDom(
      fiber.dom,
      fiber.alternate.props,
      fiber.props
    )
  } else if (fiber.effectTag === "DELETION") {
      //删除node
    domParent.removeChild(fiber.dom)
  }
    
  commitWork(fiber.child)
  commitWork(fiber.sibling)
}
```

接下来实现更新node的操作，对比oldFiber和newFiber中的props，如果props不存在则删除，不同则更新。需要注意的一项是node中事件的更新。事件的名称都以"on"开头，根据这个特性对事件属性进行过滤再相应处理。

```js
const isEvent = key => key.startsWith("on")
const isProperty = key => key !== "children" && !isEvent(key)
const isNew = (prev, next) => key =>
  prev[key] !== next[key]
const isGone = (prev, next) => key => !(key in next)
function updateDom(dom, prevProps, nextProps) {
  // Remove old properties
  Object.keys(prevProps)
    .filter(isProperty)
    .filter(isGone(prevProps, nextProps))
    .forEach(name => {
      dom[name] = ""
    })

  // Set new or changed properties
  Object.keys(nextProps)
    .filter(isProperty)
    .filter(isNew(prevProps, nextProps))
    .forEach(name => {
      dom[name] = nextProps[name]
    })
    
    //Remove old or changed event listeners
  Object.keys(prevProps)
    .filter(isEvent)
    .filter(
      key =>
        !(key in nextProps) ||
        isNew(prevProps, nextProps)(key) //change 需要先删除原有的listener
    )
    .forEach(name => {
      const eventType = name
        .toLowerCase()
        .substring(2)
      dom.removeEventListener(
        eventType,
        prevProps[name]
      )
    })
    // Add event listeners
  Object.keys(nextProps)
    .filter(isEvent)
    .filter(isNew(prevProps, nextProps))
    .forEach(name => {
      const eventType = name
        .toLowerCase()
        .substring(2)
      dom.addEventListener(
        eventType,
        nextProps[name]
      )
    })
}

const Didact = {
  createElement,
  render,
}
```



## Step VII：函数式组件

接下来我们将添加生成函数式组件的部分。使用下面这个简单的函数式组件生成一个h1 node。

```js
function App(props) {
  return Didact.createElement(
    "h1",
    null,
    "Hi ",
    props.name
  )
}
const element = Didact.createElement(App, {
  name: "foo",
})
```

函数式组件同一般DOM node的生成有两点不同：

- 由函数式组件生成的fiber没有dom这一属性，也就是还未为其生成真正的DOM node
- 函数式组件的children通过运行函数得到，而不是通过fiber.props.children得到。

```js
function performUnitOfWork(fiber) {
  const isFunctionComponent =
    fiber.type instanceof Function
  //判断是否是函数式组件
  if (isFunctionComponent) {
    updateFunctionComponent(fiber)
  } else {
    updateHostComponent(fiber)
  }
  
    //返回下一个work unit
  if (fiber.child) {
    return fiber.child
  }
  let nextFiber = fiber
  while (nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling
    }
    nextFiber = nextFiber.parent
  }
}

//对函数式组件，则通过执行该函数，获得解析成原生元素组成的组件，再像对待普通元素一样reconcileChildren
function updateFunctionComponent(fiber) {
    //像这个例子中fiber.type是APP函数，执行它返回h1元素
   const children = [fiber.type(fiber.props)]
   reconcileChildren(fiber, children)
}
//对原生元素则执行和之前一样的操作
function updateHostComponent(fiber) {
  if (!fiber.dom) {
    fiber.dom = createDom(fiber)
  }
  reconcileChildren(fiber, fiber.props.children)
}
```

由于函数式组件没有dom，所以在commitWork中也需要做相应更改，首先需要沿fiber tree向上寻找到一个有dom的fiber，将函数式组件中children的dom添加进去。同样在删除时，也需要做相应检查，当fiber没有dom时删除有dom的fiber children。也就是说在真实的DOM树中不存在名为类式组件名的DOM，DOM中只存在解析为一般html元素的结果。而fiber tree中既有一般元素生成的fiber也有类式组件生成的fiber。我们操作DOM是通过对比fiber tree实现的，因此删除和添加的时候都需要检测当前fiber是否存在dom才能相应对DOM进行操作。

```js
function commitWork(fiber) {
  if (!fiber) {
    return
  }

  let domParentFiber = fiber.parent
  //新增，用于寻找存在dom的parent，将函数式组件中children的fiber的dom添加到其中
  while (!domParentFiber.dom) {
    domParentFiber = domParentFiber.parent
  }
  const domParent = domParentFiber.dom

  if (
    fiber.effectTag === "PLACEMENT" &&
    fiber.dom != null
  ) {
    domParent.appendChild(fiber.dom)
  } else if (
    fiber.effectTag === "UPDATE" &&
    fiber.dom != null
  ) {
    
    updateDom(
      fiber.dom,
      fiber.alternate.props,
      fiber.props
    )
  } else if (fiber.effectTag === "DELETION") {
      //删除node
    //domParent.removeChild(fiber.dom)
      commitDeletion(fiber, domParent)
  }
    
  commitWork(fiber.child)
  commitWork(fiber.sibling)
}

function commitDeletion(fiber, domParent) {
  if (fiber.dom) {
    domParent.removeChild(fiber.dom)
  } else {
    commitDeletion(fiber.child, domParent)
  }
}
```



## Step VIII：Hooks--useState实现

有了函数式组件，接下来我们将要实现useState。使用下面这个经典的计数组件，每点击一次，数字加1。

```jsx
const Didact = {
  createElement,
  render,
  useState,
}

/**  Didact.createElement */
function Counter() {
  const [state, setState] = Didact.useState(1)
  return (
    <h1 onClick={() => setState(c => c + 1)}>
      Count: {state}
    </h1>
  )
}
const element = <Counter />
const container = document.getElementById("root")
Didact.render(element, container)
```

我们需要在function component的fiber中添加一个hooks array来实现同一个component中多次使用useState。

```js
let wipFiber = null
let hookIndex = null

function updateFunctionComponent(fiber) {
  wipFiber = fiber
  hookIndex = 0
  wipFiber.hooks = []
  const children = [fiber.type(fiber.props)] //从头至尾运行函数
  reconcileChildren(fiber, children)
}
```

```js
//useState除了返回一个state外还返回一个更新这个函数的setState function
function useState(initial) {
  const oldHook =
    wipFiber.alternate &&
    wipFiber.alternate.hooks &&
    wipFiber.alternate.hooks[hookIndex]
   const hook = {
    state: oldHook ? oldHook.state : initial,
    queue: [],
  }
  
  //下一次渲染时从oldHook取state和action，计算新state更新到newHook上
  const actions = oldHook ? oldHook.queue : []
  actions.forEach(action => {
    hook.state = action(hook.state)
  })

  const setState = action => {
    //每次setState，都设置一个新的wipRoot作为下一个work unit，workLoop就可以进入新的渲染
    //也就是说这样写每次setState都会触发渲染，在updateQueue里注册任务
    //但是react真正的实现中有batchUpdate机制，也就是合并更新，在同一个事务（？）中的setState会进行state合并
    //React 18后，所有的setState都会是异步的也就是都会合并更新？？autoUpdate
    hook.queue.push(action)
    wipRoot = {
      dom: currentRoot.dom,
      props: currentRoot.props,
      alternate: currentRoot,
    }
    nextUnitOfWork = wipRoot
    deletions = []
  }

  wipFiber.hooks.push(hook)
  hookIndex++
  return [hook.state, setState]
}
```



## 结语

这个教程中模拟React基础功能的实现，但还有很多React的特性和优化没有实现，例如：

- 在 Didact 中，我们在render时遍历整个树。而React 用一些方法来跳过没有任何变化的整个子树。
- 我们还在commit阶段遍历整个树。React 保留了一个链表，其中仅包含被影响到的fiber，并且仅作用于这些fiber。
- 每次我们构建一个新的工作树时（wipRoot），我们都会为每个fiber创建新对象。React 从之前的tree中重复使用fiber。
- 当 Didact 在渲染阶段收到新的更新时，它会丢弃正在进行的工作树并从根重新开始。React 使用时间戳标记每个更新，并使用它来决定哪个更新具有更高的优先级。
- …



## 衍生问题

- React生命周期-v>=16.04

  - 生命周期速查表

    ![react16生命周期](D:\vscode\Nyx\note-pei\front-end\React\images\react生命周期.png)

  - [React15和React16生命周期对比，初识Fiber - 掘金 (juejin.cn)](https://juejin.cn/post/6892604247893147656)

  - **`static getDerivedStateFromProps(props, state)`**

    v16新增，从名字上就可以看出，该方法是用来**根据父组件传递过来的`props`来更新自身的`state`**的一个方法`getDerivedStateFromProps`并不是用来代替`componentWillMount`方法的，它是用来替换`componentWillReceiveProps`的。**注意：**

    - `getDerivedStateFromProps`是一个静态方法，声明的使用static，也就是说在其内部拿不到组件实例的 this，这就导致无法在 getDerivedStateFromProps 里面做任何类似于 this.fetch()、不合理的 this.setState（会导致死循环的那种）这类可能会产生副作用的操作。背后是React 16 在强制推行“只用 getDerivedStateFromProps 来完成 props 到 state 的映射”这一最佳实践。意在确保生命周期函数的行为更加可控可预测，从根源上帮开发者避免不合理的编程方式，避免生命周期的滥用

    - 它应返回一个对象来更新 state，如果返回 `null` 则不更新任何内容。

    - 不管原因是什么，都会在***每次*渲染前触发**getDerivedStateFromProps。componentWillReceiveProps仅在父组件**重新渲染**时触发。

      

  - `getSnapshotBeforeUpdate(prevProps, prevState)`	

    v16新增，`getSnapshotBeforeUpdate()` 在最近一次渲染输出（提交到 DOM 节点）之前调用。它使得组件能在发生更改之前从 DOM 中捕获一些信息（例如，滚动位置）。此生命周期方法的任何返回值将作为参数传递给 `componentDidUpdate()`。

    

  - 在 Fiber 机制下，render 阶段是允许暂停、终止和重启的。当一个任务执行到一半被打断后，下一次渲染线程抢回主动权时，这个任务被重启的形式是“重复执行一遍整个任务”而非“接着上次执行到的那行代码往下走”。这就导致 render 阶段的生命周期都是有可能被重复执行的。

    带着这个结论，我们再来看看 React 16 打算废弃的是哪些生命周期：

    - componentWillMount；

    - componentWillUpdate；

    - componentWillReceiveProps。

      这些生命周期的共性，就是它们都处于 render 阶段，都可能重复被执行，而且由于这些 API 常年被滥用，它们在重复执行的过程中都存在着不可小觑的风险。


​    

- React什么时候会触发render？

  - 可以从图中看到组件挂载时的Render阶段，props发生变化时（浅比较，若指向不变，指向的值变了也不会重新渲染），	setState()，forceUpdate()都会触发render

  - forceUpdate()

    - ```js
      component.forceUpdate(callback)
      ```

    - 默认情况下，当组件的 state 或 props 发生变化时，组件将重新渲染。如果 `render()` 方法依赖于其他数据，则可以调用 `forceUpdate()` 强制让组件重新渲染。

      调用 `forceUpdate()` 将致使组件调用 `render()` 方法，此操作会跳过该组件的 `shouldComponentUpdate()`。但其子组件会触发正常的生命周期方法，包括 `shouldComponentUpdate()` 方法。
      
      

- 如何避免不必要的render

  - **shouldComponentUpdate**(nextProps,nextState)，返回一个布尔值，用于确定render是否执行。

  - memo和useCallBack结合使用，在父子组件间传递函数

    

- setState是同步还是异步

  - `setState` 本身代码的执行肯定是同步的，这里的异步是指是多个 state 会合成到一起进行批量更新（浅合并）。 同步还是异步取决于它被调用的环境。

  - 如果 `setState` 在 React 能够控制的范围被调用，它就是**异步**的。比如**合成事件处理函数**([SyntheticEvent](https://zh-hans.reactjs.org/docs/events.html#gatsby-focus-wrapper)，浏览器的原生事件的跨浏览器包装器，有原生事件的两个方法`stopPropagation()` 和 `preventDefault()`。)，**生命周期函数**， 此时会进行批量更新，也就是将状态合并后再进行 DOM 更新。

    ```js
    function App() {
      const [count, setCount] = useState(0);
      const [flag, setFlag] = useState(false);
    
      function handleClick() {
        setCount(c => c + 1); // Does not re-render yet
        setFlag(f => !f); // Does not re-render yet
        // React will only re-render once at the end (that's batching!)
      }
    
      return (
        <div>
          <button onClick={handleClick}>Next</button>
          <h1 style={{ color: flag ? "blue" : "black" }}>{count}</h1>
        </div>
      );
    }
    
    ```

  - 如果 `setState` 在原生 JavaScript 控制的范围被调用，它就是**同步**的。比如原生事件处理函数，promises、setTimeout，Ajax 回调函数中，此时 `setState` 被调用后会立即更新 DOM 。

    ```js
    unction App() {
      const [count, setCount] = useState(0);
      const [flag, setFlag] = useState(false);
    
      function handleClick() {
        fetchSomething().then(() => {
          // React 17 and earlier does NOT batch these because
          // they run *after* the event in a callback, not *during* it
          setCount(c => c + 1); // Causes a re-render
          setFlag(f => !f); // Causes a re-render
        });
      }
    
      return (
        <div>
          <button onClick={handleClick}>Next</button>
          <h1 style={{ color: flag ? "blue" : "black" }}>{count}</h1>
        </div>
      );
    }
    
    ```

  - [React 18 批量更新减少渲染次数 - 掘金 (juejin.cn)](https://juejin.cn/post/6982433531792195621)，全是批量更新了

    

- useEffect()执行顺序

  - 默认是在每轮**渲染结束**后在一个**延迟事件**中被调用，但可以设置第二个参数让他在**某些值改变**的时候执行。

  - 回调函数内return的函数称为清除函数，用于清除订阅，计时器ID，移除事件监听等，为防止内存泄漏，清除函数会在**组件卸载前执行。**

  - 如果组件多次渲染，在执行下一个effect前，上一个effect就已经被清除。

  - 与useLayoutEffect()的异同

    **同：**

    - **运用效果：**useEffect 与 useLayoutEffect 两者都是用于处理副作用，这些副作用包括改变 DOM、设置订阅、操作定时器等。在函数组件内部操作副作用是不被允许的，所以需要使用这两个函数去处理。
    - **使用方式：**useEffect 与 useLayoutEffect 两者底层的函数签名是完全一致的，都是调用的 mountEffectImpl方法，在使用上也没什么差异，基本可以直接替换。

    **异：**

    - **使用场景：**useEffect 在 React 的渲染过程中是被异步调用的，用于绝大多数场景；而 useLayoutEffect 会在所有的 DOM 变更之后同步调用，主要用于处理 DOM 操作、调整样式、避免页面闪烁等问题。也正因为是同步处理，所以需要避免在 useLayoutEffect 做计算量较大的耗时任务从而造成阻塞。
    
    - **使用效果：**useEffect是按照顺序执行代码的，改变屏幕像素之后执行（先渲染，后改变DOM），当改变屏幕内容时可能会产生闪烁；useLayoutEffect是改变屏幕像素之前就执行了（会推迟页面显示的事件，先改变DOM后渲染），不会产生闪烁。**useLayoutEffect总是比useEffect先执行。**
    
      

- React Diff算法

  **策略一：忽略节点跨层级操作场景，提升比对效率。（基于树进行对比）**

  这一策略需要进行树比对，即对树进行分层比较。树比对的处理手法是非常“暴力”的，即两棵树只对同一层次的节点进行比较，如果发现节点已经不存在了，则该节点及其子节点会被完全删除掉，不会用于进一步的比较，这就提升了比对效率。

  

  **策略二：如果组件的 class 一致，则默认为相似的树结构，否则默认为不同的树结构。（基于组件进行对比）**

  在组件比对的过程中：

  - 如果组件是同一类型则进行树比对；
  - 如果不是则直接放入补丁中。

  只要父组件类型不同，就会被重新渲染。这也就是为什么 shouldComponentUpdate、PureComponent 及 React.memo 可以提高性能的原因。

  

  **策略三：同一层级的子节点，可以通过标记 key 的方式进行列表对比。（基于节点进行对比）**

  元素比对主要发生在同层级中，通过标记节点操作生成补丁。节点操作包含了插入、移动、删除等。其中节点重新排序同时涉及插入、移动、删除三个操作，所以效率消耗最大，此时策略三起到了至关重要的作用。通过标记 key 的方式，React 可以直接移动 DOM 节点，降低内耗。

- react hook的真实实现

  [React技术揭秘 (iamkasong.com)](https://react.iamkasong.com/preparation/newConstructure.html)
