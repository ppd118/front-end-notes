// 需求：将resourse目录下的content文件读入

const fs=require('fs');

// 1. 普通方法：回调函数
// 参数：
// readFile(path: fs.PathOrFileDescriptor, 
//          options: { encoding?: null; flag?: string; } & EventEmitter.Abortable, 
//          callback: (
//              err: NodeJS.ErrnoException, 
//              data: Buffer) => void): void
// fs传参解释：文件路径，回调，err是出现的错误，data是读取到的参数
// fs.readFile('./resource/content.txt',(err,data)=>{
//     // 如果出错，抛出错误
//     if (err) throw err
//     // 未出错，正常处理
//     else console.log(data.toString());
// })

// 2. Promise方法

let p=new Promise((resolve,reject)=>{
    fs.readFile('./resource/content.txt',(err,data)=>{
        // 如果出错，抛出错误
        if (err) reject(err)
        // 未出错，正常处理
        else resolve(data)
    })
    
})

p.then((value)=>{
    console.log(value.toString());
},(reason)=>{
    throw reason
})