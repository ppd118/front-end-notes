/**
 * ES5实现Promise
 *  1. 实现then方法链式调用，返回Promise对象
 *  - 回调函数可以没有返回值，相当于返回undefined
 *  - 回调函数返回非Promise，then返回一个成功的Promise，值为回调的返回值
 *  - 回调函数返回Promise，then返回值根据这个Promise确定
 *  - 回调函数抛出错误，then返回一个失败的Promise
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
    // 存储回调函数，方便异步执行
    this.onResolvedCallbacks=[]
    this.onRejectedCallbacks=[]

    function resolve(data){
        if (self.status===PENDING){
            self.status=FULFILLED
            self.value=data
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
    // 保存this指针，指向Promise对象
    const self=this

    /**********new***********/
    return new Promise((resolve,reject)=>{
        // this指向调用then的Promise对象
        // console.log(this);

        // 给onResolved,onRejected设定默认值
        if (typeof onResolved!=='function'){
            // 默认函数为值传递
            onResolved=(value)=>{return value}
        }
        if (typeof onRejected!=='function'){
            // 默认函数为异常穿透
            onRejected=(reason)=>{throw reason}
        }

        // 封装，输入参数为onResolved,onRejected
        function resolvePromise(type){
            // 满足以下情况
            // 1. 回调返回Promise对象，then返回值根据这个情况调整
            // 2. 回调返回非Promise，then返回成功的Promise
            // 3. 回调函数出错，then返回失败的Promise
            // 因为这里的this指向调用它的上下文，也就是返回的新Promise
            // 要改成指向调用then的那个Promise对象，所以是self
            try{
                let result=type(type===onResolved?self.value:self.reason)
                if (result instanceof Promise){
                    result.then(value=>{
                        resolve(value)
                    },reason=>{
                        reject(reason)
                    })
                } else {
                    resolve(result)
                }
            } catch(e){
                reject(e)
            }  
        }

        if (this.status===FULFILLED){
            setTimeout(()=>resolvePromise(onResolved))
            
        }
        if (this.status===REJECTED){
            setTimeout(()=>resolvePromise(onRejected))
        }
        if (this.status===PENDING){
            this.onResolvedCallbacks.push(()=>resolvePromise(onResolved))
            this.onRejectedCallbacks.push(()=>resolvePromise(onRejected))
        }
    })

}
