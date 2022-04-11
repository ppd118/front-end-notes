/**
 * ES5实现Promise
 *  1. 实现race方法，输入一组Promise数组（也可能是可迭代对象），返回一个Promise
 *  2. Promise的状态取决于第一个改变状态的Promise对象
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

Promise.prototype.catch=function(onRejected){
    return (this.then(undefined,onRejected))
}

Promise.resolve=function(value){
    return new Promise((resolve,reject)=>{
        if (value instanceof Promise){
            value.then(v=>{
                resolve(v)
            }, r=>{
                reject(r)
            })
        } else {
            resolve(value)
        }
    })        
}

Promise.reject=function(reason){
return new Promise((resolve,reject)=>{
    reject(reason)
})
}


Promise.all=function(promises){
    // 可能考的题目是可迭代对象，转化成arr就行
    // promises=Array.from(iterable)
    // then的时候用Promise.resolve转换成Promise对象
    return new Promise((resolve,reject)=>{
        let count=0
        let values=[]
        for (let i=0;i<promises.length;i++){
            promises[i].then(v=>{
                values[i]=v
                count++
                if (count===promises.length){
                    resolve(values)
                }
            },r=>{
                reject(r)
            })
        }
    })
    
}

/**********new***********/
Promise.race=function(promises){
    return new Promise((resolve,reject)=>{
        for (let p of promises){
            p.then(v=>{
                resolve(v)
            },r=>{
                reject(r)
            })
        }
    })
}