# 前言

## 参考

- [视频：Redux Fundamentals](https://www.bilibili.com/video/BV1RF411v7cE) | [课件](https://stevekinney.github.io/redux-fundamentals/)

- [官方文档：Redux API](https://www.redux.org.cn/docs/api/)

探究的问题：

- useReducer和Redux有些相似，但是不同，哪里不同
- Redux可以脱离React存在，那么是什么把redux和react联系起来

## 预备知识

Redux基础：action，reducer，store

Redux三大原则：

- 单一数据源：**有且只有一个store**，里面有一个object tree，存储所有state
- state只读：修改state的唯一途径：**触发action**（store.diapatch触发action，reducer接收更新state）
- 纯函数修改state：reducer都是**纯函数**，接收之前的state和action，返回新action

## 概览

Redux对外暴露的API较少，有5个顶层API，4个StoreAPI

**顶级暴露的方法**

- [createStore(reducer, [preloadedState\], [enhancer])](https://www.redux.org.cn/docs/api/createStore.html)
- [combineReducers(reducers)](https://www.redux.org.cn/docs/api/combineReducers.html)
- [applyMiddleware(...middlewares)](https://www.redux.org.cn/docs/api/applyMiddleware.html)
- [bindActionCreators(actionCreators, dispatch)](https://www.redux.org.cn/docs/api/bindActionCreators.html)
- [compose(...functions)](https://www.redux.org.cn/docs/api/compose.html)

**Store API**

- Store
  - [getState()](https://www.redux.org.cn/docs/api/Store.html#getState)
  - [dispatch(action)](https://www.redux.org.cn/docs/api/Store.html#dispatch)
  - [subscribe(listener)](https://www.redux.org.cn/docs/api/Store.html#subscribe)
  - [replaceReducer(nextReducer)](https://www.redux.org.cn/docs/api/Store.html#replaceReducer)

# API

## 顶层API

``` js
// ES6
import { createStore } from 'redux'
// ES5 CommonJS
var createStore = require('redux').createStore;
```

### ==createStore==

[createStore(reducer, [preloadedState\], [enhancer])](https://www.redux.org.cn/docs/api/createStore.html)

创建一个store，储存所有state，**一个应用只应该有一个store！**

入参：

- reducer，函数，入参是state和action，返回值是新的state
- [preloadedState]，任意值，可以传入state的初值，但是一般喜欢在reducer里给state赋初值，所以一般没用
- [enhancer]，见applyMiddleware

返回值：

- 一个Store类型的对象，存储了全部的state，详见Store API

```js
const store=createStore(reducer)
```

### ==combineReducers==

[combineReducers(reducers)](https://www.redux.org.cn/docs/api/combineReducers.html)

面对复杂的状态更新逻辑，把一个reducer**拆分**为多个独立的函数，最后使用combineReducers合并成一个函数，作为createStore的输入

入参：

- reducers，对象，由多个reducer组合而成
  - key：键名，整合后统一的reducer中输出的state就以该键名拆分
  - value：state对应的reducer函数

返回值：

- 统一的reducer，**函数**，这个统一的reducer函数返回的state是一个对象，
  - key：与入参的对象的key一致
  - value：为入参的reducer对应管理的state

``` js
{
    count: xxx
    sjdakl: xxx
}

countReducer(state,action){
    if(){
        return {
            ...state
            count: djds
        }
    }
    return state
}



const rootReducer=combineReducers({
    counter: counterReducer, 
    todos: todosReducer
})
// rootReducer管理的state树是下面这个结构（对象）：
{
    counter: {
        // 由counterReducer管理的state
    } 
    todos:{
        // 由todosReducer管理的state
    }
}
```

注意点：

- 可以采用ES6语法，reducer函数命名与键名一致，这样写简便`combineReducers({counter, todos})`
- 每一个子reducer需要满足如下规则：
  - 未匹配到action时，必须**返回原state**，也就是switch - default中返回原state
  - state必须赋初值，且禁止为undefined，**禁止返回undefined**，不然报错
- 每一次dispatch action之后都会触发这个集成的reducer
  - **遍历**每一个子reducer，命中则返回新state，未命中则返回**默认值**（所以reducer一定要写默认返回值！）
  - 传入的集成reducer对象越**扁平**，遍历更新他的开销就越小


### ==bindActionCreators==

[bindActionCreators(actionCreators, dispatch)](https://www.redux.org.cn/docs/api/bindActionCreators.html)

**概念：Action creator**

一个创建 action 的函数，通常action的格式是：

``` js
{
    type: blabla, // action类型
    payload: blabla // action的负载
}
```

**bindActionCreators做了什么**

把多个action creator整合到一起，用store.dispatch统一包起来，这样就不用每次都写store.disatch了

入参

- actionCreator
  - 可以是函数，返回一个action对象
  - 可以是对象，它的value是一个action creator
- dispatch，函数，（Store.dispatch）

返回值

- 可以是函数或是对象，取决于第一个入参是函数还是对象
  - 入参是函数，返回函数，直接调用就能派发事件
  - 入参是对象，返回对象，每个属性值是新函数

``` js
// 假设有两个action creator
store.dispatch(increment(1));
store.dispatch(reset());
// 等价于, bindeActionCreators
const actions=bindActionCreators(
  { increment, decrement, reset },
  store.dispatch
);
actions.increment(1)
actions.reset()
// 等价于, compose
const dispatchIncrement=compose(store.dispatch,increment)
const dispatchReset=compose(store.dispatch,reset)
dispatchIncrement(1)
dispatchReset()
```

### applyMiddleware

[applyMiddleware(...middlewares)](https://www.redux.org.cn/docs/api/applyMiddleware.html)

#### enhancer

**概念：[Store enhancer](https://www.redux.org.cn/docs/Glossary.html)**

Store enhancer 是一个组合 store creator 的高阶函数，返回一个新的强化过的 store creator

- 内置API `createStore`就是一个标准的store creator
  - 入参：(reducer, [preloadedState\], [enhancer])
  - 返回值：store对象
- enhancer是一个函数，输入store creator，输出store creator
- 在enhancer内部可以对store creator做一些其他的处理

``` js
// 监控reducer执行时间的enhancer
const monitorEnhancer = (createStore) => {
  // 返回新的store creator
  return (reducer, initialState, enhancer) => {
    const monitorReducer = (state, action) => {
      const start = performance.now();
      const newState = reducer(state, action);
      const end = performance.now();
      const diff = end - start;
      console.log(diff);
      return newState;
    };
    // 返回值：调用createStore得到的store对象
    return createStore(monitorReducer, initialState, enhancer);
  };
};

const store= createStore(rootReducer, monitorEnhancer) // initialState可以省略的
```

存在多个enhancer的情况下，可以使用conpose把enhancer串起来

``` js
const enhancers = compose(logEnhancer, monitorEnhancer);
const store= createStore(rootReducer, enhancers);
```

#### ==middleware==

使用包含自定义功能的 middleware 来扩展 Redux 是一种推荐的方式

- middleware的本质，包装store的dispatch方法
- store enhancer的本质，包装store creator的reducer方法

这里主要介绍如何使用middleware来写enhancer，当然middleware也能干别的事（==todo==）

**自定义middleware**

middleware 的函数签名是 `store => next => action`

- 外层：接收store对象，返回一个函数，这个返回的函数如下：
  - 接收一个next方法，返回一个新函数：
    - 接收action对象
    - 可以调用next(action)，表示执行一次dispatch(action)
      - 实际上并没有真的执行，详见下一部分

> trick：记住首字母==snack==（`store=>next=>action`）

``` js
// 监控state变化和action
const logMiddleWare = (store) => (next) => (action) => {
  console.log("old state :", store.getState());
  console.log("will diapatch:", action);
  next(action);//dispatch(action),只执行一次
  console.log("new state :", store.getState());
};
```

#### applyMiddleware

[applyMiddleware(...middlewares)](https://www.redux.org.cn/docs/api/applyMiddleware.html)

入参：

- 任意个middleware函数
  - 这些函数会被逐个调用
  - 链式调用到最后一个middleware时，遇到next(action)时会真正执行dispatch(action)
  - 效果上看就是在dispatch操作外包了好几层middleware

``` js
// 创建store
const store = createStore(
  rootReducers,
  applyMiddleware(logMiddleWare, monitorMiddleWare)
);
```

### compose

[compose(...functions)](https://www.redux.org.cn/docs/api/compose.html)

组合函数，后一个函数的输出作为前一个函数的输入

`compose(funcA, funcB, funcC)` 等价于 `compose(funcA(funcB(funcC())))`）

## Store API

### getState

[getState()](https://www.redux.org.cn/docs/api/Store.html#getState)

返回当前的state树（其实是个对象）

``` js
const rootReducer=combineReducers({
    counter: counterReducer, 
    todos: todosReducer
})
const store=createStore(rootReducer)
store.getState()
// 返回值为如下格式
{
    counter: blabla,
    todos: blabla,
}
```

### ==dispatch==

[dispatch(action)](https://www.redux.org.cn/docs/api/Store.html#dispatch)

唯一改变state的途径

入参：
- action，一个对象，通常可以由action creator函数产生，默认的写法是有一个type属性
  - type：action的类型，通常是字符串常量
  - payload：可以带个值

返回值：
- 对象，要派发的action

``` js
const INCREMENT="INCREMENT"
const increment=(value)=>{
    return {
        type: INCREMENT
        payload: value
    }
}
store.dispatch(increment(5)) // 派发action
// 返回值如下，一般不关心它的返回值，因为真正重要的事情是派发这个对象到store
{
    type: INCREMENT
    payload: 5
}
```

### subscribe

[subscribe(listener)](https://www.redux.org.cn/docs/api/Store.html#subscribe)

监听state树的变化，每当dispatch action之后，就会触发listener回调函数

入参

- listener，回调函数，监听器
  - 通常可以在这个回调里调用store.getState()，查看state树

返回值：

- 函数，可以用来解绑监听器

``` js
// 绑定监听
let unsubscribe = store.subscribe(()=>{
    console.log((store.getState()))
})
// 取消监听
unsubscribe()
```

### replaceReducer

[replaceReducer(nextReducer)](https://www.redux.org.cn/docs/api/Store.html#replaceReducer)

替换当前store的reducer函数

# 示例代码

## 环境

可以使用codeSandbox调试

https://codesandbox.io/s/learn-redux-api-3y60r4

template：Vanilla JS

注意在package.json中添加依赖：

``` json
"dependencies": {
    "redux": "^4.0.5"
  },
```

## 需求1

- 2个state：counter（number）和todos（array）

- 5个action creator：
  - increment，decrement，reset，分别可以对使counter加减归零
  - addTodo，在todos加入一个元素
  - shiftTodo，去掉todos的第一个元素

``` js
import {
  createStore,
  combineReducers,
  bindActionCreators,
  compose,
  applyMiddleware
} from "redux";

// action type
const INCREMENT = "INCREMENT",
  DECREMENT = "DECREMENT",
  RESET = "RESET",
  ADDTODO = "ADDTODO",
  SHIFTTODO = "SHIFTTODO";

// reducers，注意一定要赋初值！
const counter = (state = 0, action) => {
  switch (action.type) {
    case INCREMENT:
      return state + action.payload;
    case DECREMENT:
      return state - action.payload;
    case RESET:
      return 0;
    default:
      return state;
  }
};

const todos = (state = [], action) => {
  switch (action.type) {
    case ADDTODO:
      return [...state, action.payload];
    case SHIFTTODO:
      let [, ...rest] = state;
      return rest;
    default:
      return state;
  }
};

// action creators
const increment = (value) => {
  return {
    type: INCREMENT,
    payload: value
  };
};

const decrement = (value) => {
  return {
    type: DECREMENT,
    payload: value
  };
};

const reset = () => {
  return {
    type: RESET
  };
};

const addTodo = (todo) => {
  return {
    type: ADDTODO,
    payload: todo
  };
};

const shiftTodo = () => {
  return {
    type: SHIFTTODO
  };
};

// 集成reducer
const rootReducers = combineReducers({ counter, todos });
// 创建store
const store = createStore(rootReducers);
// 集成actions
const actions = bindActionCreators(
  { increment, decrement, reset, addTodo, shiftTodo },
  store.dispatch
);

// 派发事件
// console.log(store.dispatch(increment(1)));
actions.increment(10);
actions.decrement(5);
actions.addTodo("learn Redux");
actions.addTodo("learn React");
actions.shiftTodo();
actions.reset();
```

## 需求2

在1的基础上，加入监听器

- 每一次更新state，打印当前state树

``` js
// 前面到action creator的部分都一样
// 添加监听器
const unsubscribe = store.subscribe(() => {
  console.log(store.getState());
});

// 派发事件
actions.increment(10);
actions.decrement(5);
actions.addTodo("learn Redux");
actions.addTodo("learn React");
actions.shiftTodo();
actions.reset();
// 取消监听
unsubscribe();
```

## 需求3

在1的基础上，加入 store enhancer，每一次调用reducer

- 打印reducer的执行时间
- 打印更新前后的state树

``` js
// 前面到action creator的部分都一样
// 集成reducer
const rootReducers = combineReducers({ counter, todos });

// 监控reducer执行时间的enhancer
const monitorEnhancer = (createStore) => {
  return (reducer, initialState, enhancer) => {
    const monitorReducer = (state, action) => {
      const start = performance.now();
      const newState = reducer(state, action);
      const end = performance.now();
      const diff = end - start;
      console.log("reducer execute time: ", diff);
      return newState;
    };
    return createStore(monitorReducer, initialState, enhancer);
  };
};

// 监控state 的enhancer
const logEnhancer = (createStore) => (reducer, initialState, enhancer) => {
  const logReducer = (state, action) => {
    console.log("old state: ", state);
    const newState = reducer(state, action);
    console.log("new state: ", newState);
    return newState;
  };
  return createStore(logReducer, initialState, enhancer);
};

// 集成enhancer
const enhancers = compose(logEnhancer, monitorEnhancer);

// 创建store
const store = createStore(rootReducers, enhancers);
// 集成actions
const actions = bindActionCreators(
  { increment, decrement, reset, addTodo, shiftTodo },
  store.dispatch
);

// 派发事件
actions.increment(10);
actions.decrement(5);
actions.addTodo("learn Redux");
actions.addTodo("learn React");
actions.shiftTodo();
actions.reset();
```

## 需求4

在3的基础上，使用applyMiddleware完成该功能

``` js
// 前面到action creator的部分都一样
// 集成reducer
const rootReducers = combineReducers({ counter, todos });

// middleWare
// 监控state变化和action
const logMiddleWare = (store) => (next) => (action) => {
  console.log("old state :", store.getState());
  console.log("will diapatch:", action);
  next(action);
  console.log("new state :", store.getState());
};

// 监控执行时间
const monitorMiddleWare = (store) => (next) => (action) => {
  const start = performance.now();
  next(action);
  const end = performance.now();
  const diff = end - start;
  console.log("reducer execute time: ", diff);
};

// 创建store
const store = createStore(
  rootReducers,
  applyMiddleware(logMiddleWare, monitorMiddleWare)
);
// 集成actions
const actions = bindActionCreators(
  { increment, decrement, reset, addTodo, shiftTodo },
  store.dispatch
);

// 派发事件
actions.increment(10);
actions.decrement(5);
actions.addTodo("learn Redux");
actions.addTodo("learn React");
actions.shiftTodo();
actions.reset();
```

