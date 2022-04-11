const PENDING='pending'
const FULFILLED='fulfilled'
const REJECTED='rejected'

class Promise{
    constructor(executor){
        this.status=PENDING
        this.value=undefined
        this.reason=undefined
        let self=this

        function resolve(data){
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
        try{
            executor(resolve,reject)
        } catch(e){
            reject(e)
        }
    }

    then(onResolved,onRejected){
        if (this.status===FULFILLED){
            onResolved(this.value)
        }
        if (this.status===REJECTED){
            onRejected(this.reason)
        }
    }
}