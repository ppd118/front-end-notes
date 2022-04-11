const PENDING='pending'
const FULFILLED='fulfilled'
const REJECTED='rejected'

class Promise{
    constructor(executor){
        this.status=PENDING
        this.value=undefined
        this.reason=undefined
        this.onResolvedCallbacks=[]
        this.onRejectedCallbacks=[]
        let self=this

        function resolve(data){
            if (self.status===PENDING){
                self.status=FULFILLED
                self.value=data
                setTimeout(()=>{
                    self.onResolvedCallbacks.forEach(callback=>callback(data))
                })
            }
        }
        function reject(data){
            if (self.status===PENDING){
                self.status=REJECTED
                self.reason=data
                setTimeout(()=>{
                    self.onRejectedCallbacks.forEach(callback=>callback(data))
                })
            }
        }
        try{
            executor(resolve,reject)
        } catch(e){
            reject(e)
        }
    }

    then(onResolved,onRejected){
        if (typeof onResolved !=='function') onResolved=value=>{return value}
        if (typeof onRejected !=='function') onRejected=reason=>{throw reason}

        let self=this
        return new Promise((resolve,reject)=>{
            function resolvePromise(type){
                try {
                    let result=type(type===onResolved?self.value:self.reason)
                    if (result instanceof Promise){
                        result.then(v=>resolve(v),r=>reject(r))
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

    catch(onRejected){
        return this.then(undefined,onRejected)
    }
}