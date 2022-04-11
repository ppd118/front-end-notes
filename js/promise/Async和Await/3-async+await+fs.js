/**
 * 需求：读取resource目录下的三个文件 1.html 2.html 3.html
 *       最后拼接输出
 */
 const fs=require('fs')
 const util=require('util')
/**
 * 1. 直接回调，回调地狱
 */
function callback(){
    

    fs.readFile('./resource/1.html',(err,data1)=>{
        if (err) throw err
        fs.readFile('./resource/2.html',(err,data2)=>{
            if (err) throw err
            fs.readFile('./resource/3.html',(err,data3)=>{
                if (err) throw err
                console.log(data1+data2+data3);
            })
        })
    })
}

/**
 * 2. async & await
 */
async function callbackAsync(){
    try{    
        const myReadfile=util.promisify(fs.readFile)
        // 读取文件
        let data1= await myReadfile('./resource/1.html')
        let data2= await myReadfile('./resource/2.html')
        let data3= await myReadfile('./resource/3.html')

        console.log(data1+data2+data3);
    } catch(e){
        console.log(e.code);
    }

}

// callback()
callbackAsync()
