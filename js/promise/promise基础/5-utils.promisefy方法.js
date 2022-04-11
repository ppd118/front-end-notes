// 参考文档：
//     http://nodejs.cn/api/util/util_promisify_original.html
// utils.promisify：
//     - Node.js内置方法
//     - 采用遵循常见的错误优先的回调风格的函数
//         （也就是将 (err, value) => ... 回调作为最后一个参数）
//     - 并返回一个返回 promise 的版本
// 意义：不用手动写promise，直接把回调函数风格的函数转变成它的promise版

const util=require('util')
const fs=require('fs')
// util.promisify返回一个promise对象
let myReadFile= util.promisify(fs.readFile)

myReadFile('./resource/content.txt').then(
    value=>{
        console.log(value.toString());
    },
    reason=>{
        console.log(reason);
    }
)