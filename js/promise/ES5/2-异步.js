/**
 * ES5实现Promise
 *  1. 实现then方法，满足**异步**调用情况：先指定回调，再改变状态
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
    /**********new***********/
    // 存储回调函数，方便异步执行
    this.onResolvedCallbacks=[]
    this.onRejectedCallbacks=[]

    function resolve(data){
        if (self.status===PENDING){
            self.status=FULFILLED
            self.value=data
            /**********new***********/
            // 异步：执行onResolvedCallbacks中的回调
            setTimeout(()=>{
                self.onResolvedCallbacks.forEach(callback=>callback(data))  
            })
        }
    }

    function reject(data){
        if (self.status===PENDING){
            self.status=REJECTED
            self.reason=data
            /**********new***********/
            // 异步：执行onResolvedCallbacks中的回调
            setTimeout(()=>{
                self.onRejectedCallbacks.forEach(callback=>callback(data))
            })
        }
    }

    try {
        executor(resolve,reject)
    } catch (e){
        reject(e)
    }
    
}

Promise.prototype.then=function(onResolved,onRejected){
    // this指向self实例对象

    // 给onResolved,onRejected设定默认值
    if (typeof onResolved!=='function'){
        // 默认函数为值传递
        onResolved=(value)=>{return value}
    }
    if (typeof onRejected!=='function'){
        // 默认函数为异常穿透
        onRejected=(reason)=>{throw reason}
    }

    if (this.status===FULFILLED){
        setTimeout(()=>onResolved(this.value))
    }
    if (this.status===REJECTED){
        setTimeout(()=>onRejected(this.reason))
    }
    /**********new***********/
    if (this.status===PENDING){
        this.onResolvedCallbacks.push(onResolved)
        this.onRejectedCallbacks.push(onRejected)
    }
}