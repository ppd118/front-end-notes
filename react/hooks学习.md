# HOOKS


- [HOOKS](#hooks)
  - [参考资料](#参考资料)
  - [引入原因](#引入原因)
  - [useState()](#usestate)
    - [介绍](#介绍)
    - [使用](#使用)
      - [1. 声明State变量](#1-声明state变量)
      - [2. 读取 State](#2-读取-state)
      - [3. 更新State](#3-更新state)
  - [useEffect()](#useeffect)
  - [Hook使用规则](#hook使用规则)

---
<!-- /TOC -->

## 参考资料
- [官方hook介绍](https://react.docschina.org/docs/hooks-intro.html)
- [ahooks对使用hooks一些问题的探讨]([React Hooks 使用误区，驳官方文档 - 掘金 (juejin.cn)](https://juejin.cn/post/7046358484610187277))
## 引入原因
Hook 是 React 16.8 的新增特性。它可以让你在不编写 class 的情况下使用 state 以及其他的 React 特性，在函数式组件中完成生命周期、状态管理、逻辑服用等开发工作的能力。使用类式编程时："除了代码复用和代码管理会遇到困难外，我们还发现 class 是学习 React 的一大屏障。你必须去理解 JavaScript 中 this 的工作方式，这与其他语言存在巨大差异。还不能忘记绑定事件处理器。"

---

## useState()   

### 介绍
- useState 就是一个 Hook 通过在函数组件里调用它来给组件添加一些内部 state。
- React 会在重复渲染时保留这个 state。它类似 class 组件的 this.setState，但是它不会把新的 state 和旧的 state 进行合并。

### 使用 
#### 1. 声明State变量
  useState 会返回一对值：当前state和一个让你更新state的函数，你可以在事件处理函数中或其他一些地方调用这个函数。
  ```js
  function ExampleWithManyStates() {
  // 声明多个 state 变量！
  //列表中前一个为state名，后一个为state更新的函数。ueseState括号内为赋给变量的初值
  const [age, setAge] = useState(42); 
  const [fruit, setFruit] = useState('banana');
  const [todos, setTodos] = useState([{ text: 'Learn Hooks' }]);
  // ...
}
  ```

#### 2. 读取 State
```js
// 在class中需要通过this访问
 <p>You clicked {this.state.count} times</p>

//  在函数中则可直接调用
  <p>You clicked {count} times</p>
```

#### 3. 更新State
```js
// 在class中通过this.setState()来更新
  <button onClick={() => this.setState({ count: this.state.count + 1 })}>
    Click me
  </button>

// 在函数式编程中调用声明时的set函数更新
  <button onClick={() => setCount(count + 1)}>
    Click me
  </button>
```

setState()可能是异步执行的。

---------------------------------------------------------------
## useEffect()
useEffect Hook 可以看做类式编程中中 componentDidMount，componentDidUpdate 和 componentWillUnmount 这三个函数的组合。

类式组件中，若需要在组件渲染后都执行某项操作，则需要在componentDidMount 和componentDidUpdate 函数中都编写操作代码（即同时指定组件初次渲染和更新时都执行操作函数）。

而函数式组件中，使用useEffect（）hook,默认情况下它会在每次渲染后都执行。
```js
// 每次点击都将点击次数在title中更新显示
function Example() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    document.title = `You clicked ${count} times`;
  });
}
```

useEffect()实现类式编程中挂载和删除的操作（挂载后return 删除函数），原类式编程中componentDidMount 和 componentWillUnmount 之间相互对应用于实现上述功能。
```js
import React, { useState, useEffect } from 'react';

function FriendStatus(props) {
  const [isOnline, setIsOnline] = useState(null);

  useEffect(() => {
    function handleStatusChange(status) {
      setIsOnline(status.isOnline);
    }
    // 挂载
    ChatAPI.subscribeToFriendStatus(props.friend.id, handleStatusChange);
    // 清除挂载
    // 每个 effect 都可以返回一个清除函数。如此可以将添加和移除订阅的逻辑放在一起。它们都属于 effect 的一部分。
    return function cleanup() {
      ChatAPI.unsubscribeFromFriendStatus(props.friend.id, handleStatusChange);
    };
  });

  if (isOnline === null) {
    return 'Loading...';
  }
  return isOnline ? 'Online' : 'Offline';
}
```

Hook 允许我们按照代码的用途分离他们， 而不是像生命周期函数那样将同一个功能的不同部分分割到不同的生命周期函数中。React 将按照 effect 声明的顺序依次调用组件中的每一个 effect。


**通过跳过 Effect 进行性能优化:**  有时我们并不需要每次渲染都执行更新操作，在 class 组件中，我们可以通过在 componentDidUpdate 中添加对 prevProps 或 prevState 的比较逻辑解决。在Hook中，只要传递state数组作为 useEffect 的第二个可选参数，特定state在两次重渲染之间没有发生变化，则react会 跳过对 effect 的调用
```js
useEffect(() => {
  document.title = `You clicked ${count} times`;
}, [count]); // 仅在 count 更改时更新
```

使用这种优化时要注意
- 需确保数组中包含了所有外部作用域中会随时间变化并且在 effect 中使用的变量，否则代码会引用到先前渲染中的旧变量。
- 如果想执行只运行一次的 effect（仅在组件挂载和卸载时执行），可以传递一个空数组（[]）作为第二个参数。这就告诉 React 你的 effect 不依赖于 props 或 state 中的任何值，所以它永远都不需要重复执行。
  
  
  
## useRef()

useRef()可以解决延迟调用造成的闭包问题。一下几种场景是延时调用：

1. 使用 setTimeout、setInterval、Promise.then 等
2. useEffect 的卸载函数

```js
const getUsername = () => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve('John');
    }, 3000);
  })
}

function Demo() {
  const [count, setCount] = useState(0);

  // setTimeout 会造成闭包问题
  useEffect(() => {
    const timer = setTimeout(() => {
      console.log(count);
    }, 3000);
    return () => {
      clearTimeout(timer);
    }
  }, [])

  // setInterval 会造成闭包问题
  useEffect(() => {
    const timer = setInterval(() => {
      console.log(count);
    }, 3000);
    return () => {
      clearInterval(timer);
    }
  }, [])

  // Promise.then 会造成闭包问题
  useEffect(() => {
    getUsername().then(() => {
      console.log(count);
    });
  }, [])

  // useEffect 卸载函数会造成闭包问题
  useEffect(() => {
    return () => {
      console.log(count);
    }
  }, []);

  return (
    <button
      onClick={() => setCount(c => c + 1)}
    >
      click
    </button>
  )
}

```

在以上示例代码中，四种情况均会出现闭包问题，永远输出 `0`。这四种情况的根因都是一样的，我们看一下代码的执行顺序：

1. 组件初始化，此时 `count = 0`
2. 执行 useEffect，此时 useEffect 的函数执行，JS 引用链记录了对 `count=0` 的引用关系
3. 点击 button，count 变化，但对之前的引用已经无能为力了

解决办法，用useRef()存在延时调用的回调函数中会取到的值，以确保每次取到的都是最新值，避免延时调用带来闭包问题。

```js
const [count, setCount] = useState(0);

// 通过 ref 来记忆最新的 count
const countRef = useRef(count);
countRef.current = count;

useEffect(() => {
  const timer = setTimeout(() => {
    console.log(countRef.current)
  }, 3000);
  return () => {
    clearTimeout(timer);
  }
}, [])

......
```



## useCallBack()

useCallback 可以记住函数，避免函数重复生成，这样函数在传递给子组件时，可以避免子组件重复渲染，提高性能。

但我们要注意，提高性能还必须有另外一个条件，子组件必须使用了 `shouldComponentUpdate` 或者 `React.memo` 来忽略同样的参数重复渲染。useCallBack()的使用还可能造成代码可读性变差。**一般项目中不用考虑性能优化的问题，也就是不要使用 useCallback 了**。



## useMemo()

适量使用，一些简单的场景下就不必要使用了。

```js
// 没有使用 useMemo
const memoizedValue = computeExpensiveValue(a, b);

// 使用 useMemo，当a,b值变化时才会重新执行函数
const memoizedValue = useMemo(() => computeExpensiveValue(a, b), [a, b]);

```

```js
const a = 1;
const b = 2;

//const c = useMemo(()=> a + b, [a, b]);
//直接计算a+b明显比记录a,b再比较值是否改变的开销小
const c = a + b; 
```



## Hook使用规则

- **只在最顶层使用 Hook**  
不要在循环，条件或嵌套函数中调用 Hook， 确保总是在你的 React 函数的最顶层调用他们。遵守这条规则，你就能确保 **Hook 在每一次渲染中都按照同样的顺序被调用**。这让 React 能够在多次的 useState 和 useEffect 调用之间保持 hook 状态的正确。
- **只在 React 函数中调用 Hook**  
不要在普通的 JavaScript 函数中调用 Hook。可以在只在 React 函数中调用 Hook,在自定义 Hook 中调用其他 Hook.
