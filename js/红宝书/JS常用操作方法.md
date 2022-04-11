# JS常用操作方法

## 数组

### 1. concat()

连接两个或多个数组。不改变现有数组，返回连接后的新数组。

```javascript
let a = [1,2,3]; 
let b = [3,3,4];
let res = a.concat(b); 
console.log(a); //[1,2,3]
console.log(b); //[3,3,4]
console.log(res); //[1,2,3,3,3,4]
```

### 2.join

join() 方法用于把数组中的所有元素放入一个[字符串](https://so.csdn.net/so/search?q=字符串&spm=1001.2101.3001.7020)。元素是通过指定的分隔符进行分隔的，默认使用’,'号分割，不改变原数组。

### 3.push()

push() 方法可向数组的末尾添加一个或多个元素，并返回新的长度。末尾添加，返回的是长度，会改变原数组。

### 4.pop()

pop() 方法用于删除并返回数组的最后一个元素。返回最后一个元素，会改变原数组。

### 5.shift()

shift() 方法用于把数组的第一个元素从其中删除，并返回第一个元素的值。返回第一个元素，改变原数组。

### 6.unshift()

unshift() 方法可向数组的开头添加一个或更多元素，并返回新的长度。返回新长度，改变原数组。

### 7.slice()

返回一个新的数组，包含从 start 到 end （不包括该元素）的 arrayObject 中的元素。返回选定的元素，该方法不会修改原数组。

### 8.splice()

splice() 方法可删除从 index 处开始的零个或多个元素，并且用参数列表中声明的一个或多个值来替换那些被删除的元素。如果从 arrayObject 中删除了元素，则返回的是含有被删除的元素的数组。splice() 方法会直接对数组进行修改。

### 9.substring()和substr()

相同点：如果只是写一个参数，两者的作用都一样：都是是截取字符串从当前下标以后直到字符串最后的字符串片段。
substr(startIndex);
substring(startIndex);

不同点：第二个参数
substr（startIndex,lenth）： 第二个参数是截取字符串的长度（从起始点截取某个长度的字符串）；
substring（startIndex, endIndex）： 第二个参数是截取字符串最终的下标 （截取2个位置之间的字符串,‘含头不含尾’）。

### 10.sort()

按照 Unicode code 位置排序，默认升序

### 11.reverse()

reverse() 方法用于颠倒数组中元素的顺序。返回的是颠倒后的数组，会改变原数组。

### 12.indexOf()和lastIndexOf()

都接受两个参数：查找的值、查找起始位置
不存在，返回 -1 ；存在，返回位置。indexOf 是从前往后查找， lastIndexOf 是从后往前查找。

### 13.every()

对数组的每一项都运行给定的函数，每一项都返回 ture,则返回 true

### 14.some()

对数组的每一项都运行给定的函数，任意一项都返回 ture,则返回 true

### 15.filter()

对数组的每一项都运行给定的函数，返回 结果为 ture 的项组成的数组

### 16.map()

对数组的每一项都运行给定的函数，返回每次函数调用的结果组成一个新数组

### 17.foEcah()

### ES6新增

### 1.find()

传入一个回调函数，找到数组中符合当前搜索规则的第一个元素，返回它，并且终止搜索。

### 2.findIndex()

传入一个回调函数，找到数组中符合当前搜索规则的第一个元素，返回它的下标，终止搜索。

### 3.fill()

用新元素替换掉数组内的元素，可以指定替换下标范围。

### 4.from()

将类似数组的对象（array-like object）和可遍历（iterable）的对象转为真正的数组

### 5.of()

用于将一组值，转换为数组。这个方法的主要目的，是弥补数组构造函数 Array() 的不足。因为参数个数的不同，会导致 Array() 的行为有差异。

### 6.includes()

判断数组中是否存在该元素，参数：查找的值、起始位置，可以替换 ES5 时代的 indexOf 判断方式。indexOf 判断元素是否为 NaN，会判断错误。

## **字符串**

### 1.charAt(pos)

返回指定位置的字符，如果超过字符串范围则返回空字符串。

### 2.charCodeAt(pos)

返回指定位置的UTF-16代码。**`codePointAt()`** 方法返回 一个 Unicode 编码点值的非负整数。fromCharCode()从 指定的 UTF-16 代码单元序列创建的字符串。

### 3.match(regexp)

返回字符串和一个正则表达式匹配的结果。

### 4.大小写转换

.toLowerCase()，toUpperCase()，首字母大写（str.charAt(0).toUpperCase() + str.slice(1)）

## Set

1.set.add()

2.set.delete()

3.set.has()

## Map

![Map与Object的区别](C:\Users\peipei\AppData\Roaming\Typora\typora-user-images\image-20220321170916472.png)

​				   map.set(key,value),   map.get(key)

​	

```javascript
for (let key of myMap.keys()) {
  console.log(key);
}
// 将会显示两个log。 一个是 "0" 另一个是 "1"

for (let value of myMap.values()) {
  console.log(value);
}
// 将会显示两个log。 一个是 "zero" 另一个是 "one"

for (let [key, value] of myMap.entries()) {
  console.log(key + " = " + value);
}
// 将会显示两个log。 一个是 "0 = zero" 另一个是 "1 = one"

//map对象可以合并，并且可以和数组合并
let merged = new Map([...first, ...second, [1, 'eins']]);
```

