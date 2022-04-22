# 概览

常用Hook

- useState
- useEffect
- useContext

state相关

- useState
- useRef
- useReducer

memo相关

- memo
- useMemo
- useCallback

# useState

[源码解读](https://juejin.cn/post/7003489634994880520)

[state, setState]= useState(initialState)

调用setState()时的入参

- 可以是变量，state将被更新为传入的变量
- 可以是回调，将执行回调更新state

## 惰性初始化

使用场景：state的初值是由某一个函数的返回结果，直觉上可能会写成：

``` js
const [state, setState]=useState(init()) //请不要这样写
```

但是这样写会导致额外的开销：

- 函数式组件本质上是函数，在每一次重新渲染时，它的函数体就会全部重新执行一次，包括useState语句，那么本质上init就会多粗执行，如果其中涉及到开销很大的操作或是创建新对象的操作，就会造成资源大浪费

正确写法：

``` js
const [state, setState]=useState(init)
```

## state是一个快照

[React state快照详解](https://juejin.cn/post/7035501818989772836)

现象：

- setState之后打印state会发现打印出来的结果没改变
- setTimeout延迟打印出的state结果不是最新值
  - 解决方式：用useRef暂存state，然后打印ref的值

- setTimeout中setState(state+1)使state不能正常累加
  - 解决方式：setState(state=>state+1)


# useEffect

注意点

- 第一个输入参数：回调函数，执行时机
- 第二个输入参数：依赖项
- 返回值：组件卸载时执行

# useRef

[useRef文档](https://zh-hans.reactjs.org/docs/hooks-reference.html#useref)

通过useRef创建一个容器，在它的`.current`中可以保存一个任意类型的可变值，并且改变它的值不会引发渲染

可以用来解决的问题：

- 变量保存
- 获取DOM节点

## 变量保存

### 输出state实时值

延迟输出时，输出state的当前值，而不是触发setTimeout时的快照

``` jsx
const StateHook=()=>{
    const [count, setCount]=useState(0)
    const countRef=useRef()
    
    useEffect(()=>{
        // 每次count更新，用ref获取
        countRef.current=count
    },[count])

    function addCountHandler(){
        setCount(count+1)
    }
    
    function showHandler(){
        setTimeout(()=>{
            console.log("count: ",count);
            console.log("countRef: ",countRef.current);
        },3000)
    }

  
    return (
        <Fragment>
            <h1>count:{count}</h1>  
            <button onClick={addCountHandler}>addCount</button>
            <button onClick={showHandler}>show</button>

        </Fragment>
    )
}
```

### 在**函数式**场景下写**防抖**

函数式组件每次渲染结束后，内部的变量都会被释放，重新渲染时所有的变量都会被重新初始化，产生的结果就是每一次都注册和执行了 setTimeout 函数。

https://juejin.cn/post/7037288896979271693

``` js
// 防抖
export function useDebounce(fn, delay, dep = []) {
  const { current } = useRef({ fn, timer: null });
  useEffect(function () {
    current.fn = fn;
  }, [fn]);
  return useCallback(function f(...args) {
    if (current.timer) {
      clearTimeout(current.timer);
    }
    current.timer = setTimeout(() => {
      current.fn.call(this, ...args);
    }, delay);
  }, dep)
}
```

## 获取DOM节点

- 类似createRef，通过`useRef`创建一个变量`domRef`进行保存。
- 在`jsx`中通过`ref={domRef}`给对应元素节点添加属性。
- 在页面挂载后通过`domRef.current`就可以获取对应节点的真实DOM元素了。

``` jsx
const RefHook=()=>{
    const domRef=useRef()
    function showHandler(){
        // 打印输入框内容
        console.log(domRef.current.value)
    }

    return (
        <Fragment>
            <button onClick={showHandler}>show</button>
            <input ref={domRef} type="text" />
        </Fragment>
    )
}
```

# useContext

https://juejin.cn/post/6844904153584500749

用于组件之间共享状态，可以当作Redux的替代品，传递一些数据，避免逐层传参的情况，通常是用于：

- 兄弟节点之间
- 祖孙节点之间

**使用方式**：订阅、消费模式

1. 使用`createContext`创建上下文

2. 顶层组件：声明 `Provier` 组件，并声明 `value`属性

3. 后代组件：

   以前的方法：声明 `Consumer` 组件，这个 `Consumer`子组件，只能是唯一的一个函数，函数参数即是 `Context` 的负载

   使用`useContext`获取Context的负载

4. 如果有多个 `Context` ,`Provider` 和 `Consumer`任意的顺序嵌套即可。

**使用例**：https://www.jianshu.com/p/d39a3df09dd5

``` jsx
export const numberContext = React.createContext();
//它返回一个具有两个值的对象
//{Provider ， Consumer}
function App(){
  
  //使用Provider为所有子孙提供value值
  return (
    <numberContext.Provider value={520}>
        <div>
        <ShowAn />
        </div>
    </numberContext.Provider>
  )
}

import {numberContext} from '...'
function ShowAn(){
  //1. 使用Consumer从上下文获取value
  //2. 调用useContext，传入从React.createContext获取的上下文对象。
  const value = useContext(numberContext);
  return(
    // 1. 使用Consumer的写法
    // <numberContext.Consumer>
      // {value=><div>the answer is {value}</div>}
    // </numberContext.Consumer>
    // 2. 使用useContext的写法
    <div>
      the answer is {value}
    </div>

  )
}
```

# useReducer

state的一种替代方案，state管理简单状态逻辑，reducer管理复杂状态逻辑

原理上类似Array.prototype.reduce和Redux中的reducer

`useReducer(reducer, initialState)` 

- 接受2个参数，分别为 reducer 函数 和 初始状态
- 返回了一个包含两个元素的数组，分别为 state 和 dispatch 方法。
  - 调用dispatch方法可以派发事件
  - 事件被reducer函数接收
  - reducer函数执行改变state状态

``` jsx
import React, { useReducer } from 'react'

const initialState = 0
const reducer = (state, action) => {
  switch (action) {
    case 'increment':
      return state + 1
    case 'decrement':
      return state - 1
    case 'reset':
      return initialState
    default:
      return state
  }
}

// 三个按钮，按下后计数器+1，-1和清0
function CounterOne() {
  const [count, dispatch] = useReducer(reducer, initialState)
  return (
    <div>
      <div>Count - {count}</div>
      <button
        onClick={() => dispatch('increment')}
      >Increment</button>
      <button
        onClick={() => dispatch('decrement')}
      >Decrement</button>
      <button
        onClick={() => dispatch('reset')}
      >Reset</button>
    </div>
  )
}
```

进阶使用：https://juejin.cn/post/6844904157892050957

- state和action可以是一个对象，有多个属性
- useReducer+useContext实现跨组件传参
- useReducer+useEffect实现一些有复杂分支的异步操作

# memo相关

memo，useMemo，useCallback都是**性能优化**的手段，**不要**太依赖他们去**阻止渲染**

- 用这类方法创建的东西，初始化的开销比较大
- 实际上React的diff算法效率很高，多次触发渲染也没什么太大负担
- 推荐的使用场景：组件重新渲染、函数重新计算的成本太大了

## memo

类：PureComponent

[React.memo文档](https://zh-hans.reactjs.org/docs/react-api.html#reactmemo)

这是一个专门为**函数式**编程提供的高阶组件，它的核心思想在于**纯函数**：

- 纯函数的输出只取决于它的输入
- 纯函数不会产生外部可观测的变化

==针对函数式组件==

如果一个组件也是一个纯函数：输入相同的props时，返回的渲染结果相同，那么他就可以被包在memo里使用。

### 检查props变更

memo完成的事情：

- 输入组件，记忆该组件最后一次渲染时的渲染结果
- 检查该组件的输入参数props
  - 如果props变更，则重新渲染
  - 否则，直接返回上一次渲染结果

使用例：

父组件state更新触发重新渲染时，子组件也会重新渲染，这时候可以用memo记录子组件的渲染结果，如果props不变，就无需渲染

``` jsx
// 子组件
// 渲染一个长宽为100的方块，传入的参数为color确定背景色
function ColorCube({color}){
    return (
        <div style={{width:100, height:100, backgroundColor: color}}></div>
    )
}
const MemoedColorCube=memo(ColorCube)
// 父组件中
// <MemoedColorCube color="red"/>
```

### 比较props中的对象

props中引用类型的属性，只会做浅层对比，也就是比较引用值

此时引入memo的第二个输入参数：回调函数

- 输入参数：prevProps, nextProps，分别指向上一次渲染和这一场渲染时的props对象
- 返回值：boolean，为true时就不触发渲染

用第二个参数可以对引用类型的参数中的某个属性进行比较

使用例：

``` jsx
// 渲染一个长宽为100的方块，传入的参数为color确定背景色
function ColorCube({params: {color}){
    return (
        <div style={{width:100, height:100, backgroundColor: color}}></div>
    )
}
const MemoedColorCubeWithCallback=memo(ColorCube, (prev,next)=>{
    return prev.params.color===next.params.color
})
// <MemoedColorCubeWithCallback params={{color: "red"}}/>
```

## useMemo

[React.useMemo文档](https://zh-hans.reactjs.org/docs/hooks-reference.html#usememo)

通常用于避免在每一次渲染时重复进行**高开销**的计算

输入参数：函数，函数的依赖项数组

返回参数：memoized值

useMemo做的事情：

- 监听依赖项变化
  - 依赖项改变，重新执行函数，返回新的执行结果
  - 依赖项不改变，返回memoized值（上一次执行函数的结果）

请不要把每一个函数都包在useMemo里面，推荐的使用场景：

- 函数计算开销很大的情况
- 想要和memo结合使用的情况

### 避免高开销计算

**不推荐**：

以下操作就没必要用useMemo了

``` js
const sum=useMemo(()=>a+b,[a,b])
const fullName=useMemo(()=>`${firstName} ${lastName}`,[firstName,lastName])
```

可以直接写成

``` js
const sum=a+b
const fullName=`${firstName} ${lastName}`
```

**推荐**的案例：

注意这里监听数组也只是监听了引用值，举例只是说这里的操作高开销

``` js
const multipledValues=useMemo(()=>{
    numbers.map(i=>i*100)
},[...numbers])
```

``` js
const value=useMemo(()=>{
    numbers.reduce((acc,cur)=>acc+cur,0)
},[...numbers])
```

### memo+useMemo

考虑以下使用场景：

- 父组件向子组件传递一个属性，值为对象
- 希望这个对象的某一个属性值改变时，子组件才会重新渲染，否则维持之前的渲染结果即可

``` jsx
// 子组件
// 渲染一个长宽为100的方块，传入的参数为color确定背景色
function ColorCube({params: {color}){
    return (
        <div style={{width:100, height:100, backgroundColor: color}}></div>
    )
}
// 用子组件memo包起来
const MemoedColorCube=memo(ColorCube)

// 父组件
function App(){
    const [color, setColor]=useState("red")
    // color改变时，才改变params
    const params=useMemo(()=>{
        return {color}
    },[color])
    funcrion onClickHandle(){
        // todo...
    }
    return (
        <div>
        	<button onClick={onClickHandle}>changeColor</button>
        	<MemoedColorCube params={params}/>
		<div>
    )
}
```

## useCallback

useCallback其实是useMemo的一个语法糖：

- useMemo，主要用于缓存对象或是函数的执行结果
- useCallback，主要用于缓存**函数**

用useMemo缓存一个函数

``` js
const fn=useMemo(()=>{
    return function otherFn(){
        // todo...
    }
},[])
```

这样写比较麻烦，所以就产生了useCallback

```js
const fn=useCallback(otherFn,[])
```

useCallback完成的事情：

- 监听依赖项
  - 依赖项改变，则返回新函数对象
  - 依赖项不变，则保持原来的函数对象

### memo+useCallback

一般useCallback的使用场景在于：**避免回调函数造成渲染**

- 父组件向子组件传递一个回调函数
  - 由于函数式组件每次渲染都会重新执行，所以直接在函数体中定义的函数，每一次都是不同的，也就是一个新的引用值
  - 本质上回调函数的函数体不会因为重新渲染改变，所以不希望触发子组件重新渲染
- 解决：memo包子组件+useCallback包回调

``` jsx
// 子组件
// 渲染一个长宽为100的方块，传入的参数为color确定背景色
function ColorCube({params: {color}){
    return (
        <div style={{width:100, height:100, backgroundColor: color}}></div>
    )
}
// 用子组件memo包起来
const MemoedColorCube=memo(ColorCube)

// 父组件
function App(){
    const [color, setColor]=useState("red")
    // color改变时，才改变params
    const params=useMemo(()=>{
        return {color}
    },[color])
    // 回调用useCallback包起来
    const onClickHandle=useCallback(()=>{
        // todo...
    },[])
    return (
        <div>
        	<MemoedColorCube params={params} onClick={onClickHandle} />
		<div>
    )
}
```





## 更多案例

以防抖为例：



