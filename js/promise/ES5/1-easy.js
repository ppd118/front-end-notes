/**
 * ES5实现Promise
 *  1. 实现构造函数，传入executor
 *  2. 实现3种方式改变Promise状态
 *  3. 实现then方法，满足同步调用情况：先改变状态，再指定回调
 *  4. then中指定的回调函数异步执行：用setTimeout包起来
 *  5. then中的回调函数由默认值
 */
const PENDING='pending'
const FULFILLED='fulfilled'
const REJECTED='rejected'

function Promise(executor){
    // 保存this指针，指向Promise对象
    const self=this
    this.status=PENDING
    this.value=undefined
    this.reason=undefined

    function resolve(data){
        // console.log(this);
        if (self.status===PENDING){
            self.status=FULFILLED
            self.value=data
        }
    }

    function reject(data){
        if (self.status===PENDING){
            self.status=REJECTED
            self.reason=data
        }
    }

    try {
        executor(resolve,reject)
    } catch (e){
        reject(e)
    }
    
}

Promise.prototype.then=function(onResolved,onRejected){
    // this指向Promise实例对象
    // // 给onResolved,onRejected设定默认值
    // if (typeof onResolved!=='function'){
    //     // 默认函数为值传递
    //     onResolved=(value)=>{return value}
    // }
    // if (typeof onRejected!=='function'){
    //     // 默认函数为异常穿透
    //     onRejected=(reason)=>{throw reason}
    // }

    if (this.status===FULFILLED){
        setTimeout(()=>onResolved(this.value))
    }
    if (this.status===REJECTED){
        setTimeout(()=>onRejected(this.reason))
    }
}

