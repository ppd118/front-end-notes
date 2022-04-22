## ==Redux==

### 1. 添加依赖

``` sh
cnpm install --save redux
cnpm install --save react-redux
cnpm install --save-dev redux-devtools-extension
```

chrome插件：Redux DevTools

### 2. 核心概念

http://cn.redux.js.org/tutorials/essentials/part-1-overview-concepts/

- **state**：驱动应用的真实数据源头
- **view**：基于当前状态的 UI 声明性描述
- **actions**：根据用户输入在应用程序中发生的事件，并触发状态更新

#### store action reducer

store：状态树

- state：store的一个快照
- state改变会引起view的变化

action：事件派发

- view接收到事件，派发action

reducer：接收state和action

- 类似于事件监听器

- 根据以前的state和接收到的action，改变state

#### Redux数据流

具体来说，对于 Redux，我们可以将这些步骤分解为更详细的内容：

- 初始启动：
  - 使用最顶层的 root reducer 函数创建 Redux store
  - store 调用一次 root reducer，并将返回值保存为它的初始 `state`
  - 当 UI 首次渲染时，UI 组件访问 Redux store 的当前 state，并使用该数据来决定要呈现的内容。同时监听 store 的更新，以便他们可以知道 state 是否已更改。
- 更新环节：
  - 应用程序中发生了某些事情，例如用户单击按钮
  - dispatch 一个 action 到 Redux store，例如 `dispatch({type: 'counter/increment'})`
  - store 用之前的 `state` 和当前的 `action` 再次运行 reducer 函数，并将返回值保存为新的 `state`
  - store 通知所有订阅过的 UI，通知它们 store 发生更新
  - 每个订阅过 store 数据的 UI 组件都会检查它们需要的 state 部分是否被更新。
  - 发现数据被更新的每个组件都强制使用新数据重新渲染，紧接着更新网页

##### reducer

创建reducer，传入的参数是state和action

- state要有默认值
- 根据action.type判断怎样修改state

``` jsx
const defaultState= {
    cityName: "北京"
}

const city= (state=defaultState,action)=>{
    switch(action.type){
        case INIT_CITY:
            return {
                cityName: action.cityName
            }
        case CHANGE_CITY:
            return {
                cityName: action.cityName
            }
        default:
            return state
    }
}

export default city
```

用 [`combineReducers`](http://cn.redux.js.org/api/combinereducers) 来把多个 reducer 创建成一个rootReducer

``` js
import { combineReducers } from "redux";
import city from "./city";

const rootReducer= combineReducers({
    city
})

export default rootReducer
```

##### store

创建store，应用中只创建一个 store！接收rootReducer

``` js
import { createStore } from "redux";
import { composeWithDevTools } from "redux-devtools-extension"
import rootReducer from "../reducers";

const store= createStore(rootReducer, composeWithDevTools())

export default store
```

用Provider传递store

``` jsx
import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'

import App from './App'
import store from './store'

ReactDOM.render(
  // Render a `<Provider>` around the entire `<App>`,
  // and pass the Redux store to as a prop
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
)
```

##### action

创建action creator函数，每次调用会返回一个action对象

``` js
function changeCity(cityName){
    return{
        type: INIT_CITY,
        cityName
    }
}
```

派发action，在DOM中useDispatch派发action对象

``` jsx
import { useSelector, useDispatch } from "react-redux";

const City=()=>{

    const city=useSelector(state => state.city)
    const dispatch=useDispatch()
    console.log(city);

    function onCityEvent(city){       
        dispatch(changeCity(city))
    }
    
    return (
        <div onClick={()=>onCityEvent(city)}></div>
    )
}
```

### ==问题：reducer互相影响==

https://segmentfault.com/q/1010000012062981

注意default应该返回传入的state快照