# **Cookie**

## Cookie

HTTP 是无状态的。也就是说，HTTP 请求方和响应方间无法维护状态，都是一次性的，它不知道前后的请求都发生了什么。

HTTP Cookie（也叫 Web Cookie或浏览器 Cookie）是服务器发送到用户浏览器并保存在本地的一小块数据，它会在浏览器下次向**同一服务器**再发起请求时被携带并发送到服务器上。通常，它用于告知服务端两个请求是否来自同一浏览器，如保持用户的登录状态。Cookie 使基于无状态的 HTTP 协议记录稳定的状态信息成为了可能。

Cookie 主要用于以下三个方面：

- 会话状态管理（如用户登录状态、购物车、游戏分数或其它需要记录的信息）
- 个性化设置（如用户自定义设置、主题等）
- 浏览器行为跟踪（如跟踪分析用户行为等）

### Cookie包含字段及含义

浏览器开发者工具-->Application-->Cookie可以看到存储在本地的Cookie包含的字段，如下图所示。

![chrome-cookie](img\cookie\chrome-cookie.png)

- Name

  cookie名称
- Value

  cookie的值，对于认证cookie，value值包括web服务器所提供的访问令牌；
- Domain

  可以访问该cookie的域名，Cookie 机制并未遵循严格的同源策略，允许一个子域可以设置或获取其**父域的 Cookie**。当需要实现单点登录方案时，Cookie 的上述特性非常有用，然而也增加了 Cookie受攻击的危险，比如攻击者可以借此发动会话定置攻击。因而，浏览器禁止在 Domain 属性中设置.org、.com 等通用顶级域名、以及在国家及地区顶级域下注册的二级域名，以减小攻击发生的范围。
- Path

  请求URL中必须有此路径才能访问此cookie的页面路径。 比如domain是abc.com，path是 `/test`，那么只有 `/test`路径下的页面可以获取此cookie。
- ==**Expires/Max-Age**==

  时间 | Session

  此cookie的超时时间。若设置其值为一个时间，那么当到达此时间后，此cookie失效。不设置的话默认值是Session，意思是cookie会和session一起失效。当浏览器关闭(不是浏览器标签页，而是整个浏览器) 后，此cookie失效。
- Size

  cookie大小。不同浏览器对cookie有不同的大小限制，一般是4kb
- **==HttpOnly==**

  该属性用来设置cookie能否通过脚本来访问，默认为空，即可以通过脚本访问。如果设置为 `true`在客户端是不能通过js代码去设置cookie的，这种类型的cookie只能通过服务端来设置。该属性用于防止客户端脚本通过 `document.cookie`属性访问Cookie，有助于保护Cookie不被跨站脚本攻击窃取或篡改。但是，HTTPOnly的应用仍存在局限性，一些浏览器可以阻止客户端脚本对Cookie的读操作，但允许写操作；此外大多数浏览器仍允许通过XMLHTTP对象读取HTTP响应中的Set-Cookie头。
- **==Secure==**

  指定是否使用HTTPS安全协议发送Cookie。如果为 `true`则使用HTTPS安全协议，可以保护Cookie在浏览器和Web服务器间的传输过程中不被窃取和篡改。该方法也可用于Web站点的身份鉴别，即在HTTPS的连接建立阶段，浏览器会检查Web网站的SSL证书的有效性。但是基于兼容性的原因（比如有些网站使用自签署的证书）在检测到SSL证书无效时，浏览器并不会立即终止用户的连接请求，而是显示安全风险信息，用户仍可以选择继续访问该站点。
- **==SameSite==**

  同站：顶级域名相同站点，跟端口无关，比如大公司，一个顶级域名下有很多子域；samesite设置是跨域携带cookie的必要不充分条件。

  - strict：严格模式，只有同站才能发送cookie
  - Lax：relax的缩写，宽松模式，只有安全的跨站可以发送cookie
  - None：禁止samesite的限制，必须配合secure才能使用；
- SameParty
- Partition Key
- Priority

### Cookie特点

### 如何跨域携带Cookie？

    fetch、axios、jQuery三种方法都需要在服务端设置响应头`Access-Control-Allow-Credentials: true`。只是在默认情况下表现不同：fetch在默认情况下, 不管是同域还是跨域ajax请求都不会带上cookie, 只有当设置了 `credentials` 时才会带上该ajax请求所在域的cookie。

    axios和jQuery在**同域**ajax请求时会带上cookie, 跨域请求不会, 跨域请求需要设置 `withCredentials` 和服务端响应头

- fetch

  为fetch()方法的init对象设置credentials属性

  ```js
  fetch(url, {
      //有3个属性值
      //include：跨域ajax带上cookie
      //same-origin：同域ajax带cookie
      //omit：默认，任何情况都不带cookie
      credentials: "include", 

  })
  ```
- axios

  设置withCredentials

  ```js
  axios.get('http://server.com', {withCredentials: true})
  ```
- JQuery

  ```js
  $.ajax({
      method: 'get',
      url: 'http://server.com',
      xhrFields: {
          withCredentials: true
      }
  })
  ```

## Cookie、Session与Token的联系

- **Session**

  session是状态管理的一种解决方案。Session 代表着服务器和客户端一次会话的过程。Session 对象存储特定用户会话所需的属性及配置信息。这样，当用户在应用程序的 Web 页之间跳转时，存储在 Session 对象中的变量将不会丢失，而是在整个用户会话中一直存在下去。当客户端关闭会话，或者 Session 超时失效时会话结束。
- **Session与Cookie的关系**

  - **cookie是实现session认证的一种途径**

    ![](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2019/5/13/16aafb5d90f398e2~tplv-t2oaga2asx-zoom-in-crop-mark:1304:0:0:0.awebp)

    用户第一次请求服务器的时候，服务器根据用户提交的相关信息，创建创建对应的 Session ，请求返回时将此 Session 的唯一标识信息 **SessionID** 返回给浏览器，浏览器接收到服务器返回的 SessionID 信息后，会将此信息存入到 Cookie 中，同时 Cookie 记录此 SessionID 属于哪个域名。

    当用户第二次访问服务器的时候，请求会自动判断此域名下是否存在 Cookie 信息，如果存在自动将 Cookie 信息也发送给服务端，服务端会从 Cookie 中获取 SessionID，再根据 SessionID 查找对应的 Session 信息，如果没有找到说明用户没有登录或者登录失效，如果找到 Session 证明用户已经登录可执行后面操作。

    根据以上流程可知，SessionID 是连接 Cookie 和 Session 的一道桥梁，大部分系统也是根据此原理来验证用户登录状态。
  - **cookie与session的不同**

    - 作用范围不同，Cookie 保存在客户端（浏览器），Session 保存在服务器端。
    - 存取方式的不同，Cookie 只能保存 ASCII，Session 可以存任意数据类型，一般情况下我们可以在 Session 中保持一些常用变量信息，比如说 UserId 等。
    - 有效期不同，Cookie 可设置为长时间保持，比如我们经常使用的默认登录功能，Session 一般失效时间较短，客户端关闭或者 Session 超时都会失效。
    - 隐私策略不同，Cookie 存储在客户端，比较容易遭到不法获取，早期有人将用户的登录名和密码存储在 Cookie 中导致信息被窃取；Session 存储在服务端，安全性相对 Cookie 要好一些。
    - 存储大小不同， 单个 Cookie 保存的数据不能超过 4K，Session 可存储数据远高于 Cookie。
- **Token**

  session存储在服务端，但是通常服务端是集群，而用户请求过来会走一次负载均衡，不一定打到哪台机器上。那一旦用户后续接口请求到的机器和他登录请求的机器不一致，或者登录请求的机器宕机了，session 就失效了。

  token是状态管理问题下的另一种解决方案。token 的流程是这样的：

  - 用户登录，服务端校验账号密码，获得用户信息
  - 把用户信息、token 配置（如过期时间）编码成 token，通过 cookie set 到浏览器
  - 此后用户请求业务接口，通过 cookie 携带 token
  - 接口校验 token 有效性，进行正常业务接口处理

  session的问题是验证信息存储在服务端带来的问题，而token将验证信息存储在服务端就避免了这个问题。token可以存储在cookie中，也可以存储在localStorage中（发送的时候携带在请求头'Authorization'字段）。
- **总结**

  - HTTP 是无状态的，为了维持前后请求，需要前端存储标记
  - cookie 是一种完善的标记方式，通过 HTTP 头或 js 操作，有对应的安全策略，是大多数状态管理方案的基石
  - session 是一种状态管理方案，前端通过 cookie 存储 id，后端存储数据，但后端要处理分布式问题
  - token 是另一种状态管理方案，相比于 session 不需要后端存储，数据全部存在前端，解放后端，释放灵活性。token 的编码技术，通常基于 base64，或增加加密算法防篡改，jwt 是一种成熟的编码方案在复杂系统中，token 可通过 service token、refresh token 的分权，同时满足安全性和用户体验
  - session 和 token 的对比就是「用不用cookie」和「后端存不存」的对比
  - 单点登录要求不同域下的系统「一次登录，全线通用」，通常由独立的 SSO 系统记录登录状态、下发 ticket，各业务系统配合存储和认证 ticket

## cookie、localstorage与sessionStorage的区别

LocalStorage与sessionStrorage都是HTML5引入的一种新的存储方式。

### LocalStorage

LocalStorage是HTML5新引入的特性，由于有的时候我们存储的信息较大，Cookie就不能满足我们的需求，这时候LocalStorage就派上用场了。

**LocalStorage的优点：**

- 在大小方面，LocalStorage的大小一般为5MB，可以储存更多的信息
- LocalStorage是持久储存，并不会随着页面的关闭而消失，除非主动清理，不然会永久存在
- 仅储存在本地，不像Cookie那样每次HTTP请求都会被携带

**LocalStorage的缺点：**

- 存在浏览器兼容问题，IE8以下版本的浏览器不支持
- 如果浏览器设置为隐私模式，那我们将无法读取到LocalStorage
- LocalStorage受到同源策略的限制，即端口、协议、主机地址有任何一个不相同，都不会访问

**LocalStorage的常用API：**

```js
// 保存数据到 localStorage
localStorage.setItem('key', 'value');

// 从 localStorage 获取数据
let data = localStorage.getItem('key');

// 从 localStorage 删除保存的数据
localStorage.removeItem('key');

// 从 localStorage 删除所有保存的数据
localStorage.clear();

// 获取某个索引的Key
localStorage.key(index)
```

**LocalStorage的使用场景：**

- 有些网站有换肤的功能，这时候就可以将换肤的信息存储在本地的LocalStorage中，当需要换肤的时候，直接操作LocalStorage即可
- 在网站中的用户浏览信息也会存储在LocalStorage中，还有网站的一些不常变动的个人信息等也可以存储在本地的LocalStorage中

### SessionStorage

SessionStorage和LocalStorage都是在HTML5才提出来的存储方案，SessionStorage 主要用于临时保存同一窗口(或标签页)的数据，刷新页面时不会删除，关闭窗口或标签页之后将会删除这些数据。

**SessionStorage与LocalStorage对比：**

- SessionStorage和LocalStorage都在**本地进行数据存储**；
- SessionStorage也有同源策略的限制，但是SessionStorage有一条更加严格的限制，SessionStorage**只有在同一浏览器的同一窗口下才能够共享**；
- LocalStorage和SessionStorage**都不能被爬虫爬取**；

**SessionStorage的常用API：**

```js
// 保存数据到 sessionStorage
sessionStorage.setItem('key', 'value');

// 从 sessionStorage 获取数据
let data = sessionStorage.getItem('key');

// 从 sessionStorage 删除保存的数据
sessionStorage.removeItem('key');

// 从 sessionStorage 删除所有保存的数据
sessionStorage.clear();

// 获取某个索引的Key
sessionStorage.key(index)
```

**SessionStorage的使用场景**

- 由于SessionStorage具有时效性，所以可以用来存储一些网站的游客登录的信息，还有临时的浏览记录的信息。当关闭网站之后，这些信息也就随之消除了。

## 参考资料

- [你真的了解 Cookie 和 Session 吗 - 掘金 (juejin.cn)](https://juejin.cn/post/6844903842773991431)
- [Cookie的设置、读取以及是否自动携带问题 - 掘金 (juejin.cn)](https://juejin.cn/post/6844903648384778247)
- [前后端数据交互(六)——ajax 、fetch 和 axios 优缺点及比较 - 掘金 (juejin.cn)](https://juejin.cn/post/7006106575769174053)
- [面试：彻底理解Cookie以及Cookie安全 - 掘金 (juejin.cn)](https://juejin.cn/post/6844904102544031757)
- [前端鉴权的兄弟们：cookie、session、token、jwt、单点登录 - 掘金 (juejin.cn)](https://juejin.cn/post/6898630134530752520)
- [HTTP协议之涉及到cookie字段 - 掘金 (juejin.cn)](https://juejin.cn/post/6992546929137680415)
