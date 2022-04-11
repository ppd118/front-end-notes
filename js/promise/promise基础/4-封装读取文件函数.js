// 需求：封装一个函数 myReadFile()
// 参数：path 文件路径
// 返回：promise对象

const { resolve } = require('path')



function myReadFile(path){
    return p=new Promise((resolve,reject)=>{
        require('fs').readFile(path,(err,data)=>{
            if (err) reject(err)
            else resolve(data)
        })
    })
}

// 封装在函数里面就可以在调用时定义then
myReadFile('./resource/content.txt').then(
    value=>console.log(value.toString()),
    reason=>console.log(reason)
)