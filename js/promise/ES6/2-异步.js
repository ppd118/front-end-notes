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
                setTimeout(()=> {
                    self.onResolvedCallbacks.forEach(callback=>callback(data))
                })
            }
        }
        function reject(data){
            if (self.status===PENDING){
                self.status=REJECTED
                self.reason=data
                setTimeout(()=> {
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
        if (this.status===FULFILLED){
            setTimeout(()=> onResolved(this.value))
        }
        if (this.status===REJECTED){
            setTimeout(()=> onRejected(this.reason))
        }
        if (this.status===PENDING){
            this.onResolvedCallbacks.push(onResolved)
            this.onRejectedCallbacks.push(onRejected)
        }
    }
}