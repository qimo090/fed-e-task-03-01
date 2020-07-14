# 任务二：Vue Router 的实现原理

## 课程介绍

- Vue Router 基础回顾
- Hash 模式和 History 模式
- 模拟实现自己的 Vue Router

## Hash 和 History 模式

表现形式的区别

- hash 模式

  https://music.163.com/#/playlist?id=3102961863

- history 模式

  https://music.163.com/playlist/3102961863

原理的区别

- hash 模式是基于锚点，以及 `onhashchange` 事件
- history 模式是基于 HTML5 中的 `history` API
  - `history.pushState()` // IE10 以后才支持
  - `history.replaceState()`

## history 模式

History 模式的使用

- History 需要服务器的支持
- 单页应用中，服务端不存在类似 http://www.testurl.com/login 这样的地址，会返回找不到该页面 404
- 在服务端应该除了静态资源外都返回单页应用的 index.html

History Node.js

`原生 Node`

```javascript
const http = require('http')
const fs = require('fs')
const httpPort = 80

http
  .createServer((req, res) => {
    fs.readFile('index.htm', 'utf-8', (err, content) => {
      if (err) {
        console.log('We cannot open "index.htm" file.')
      }

      res.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8',
      })

      res.end(content)
    })
  })
  .listen(httpPort, () => {
    console.log('Server listening on: http://localhost:%s', httpPort)
  })
```

基于 Node.js 的 Express
对于 Node.js/Express，请考虑使用 [connect-history-api-fallback](https://github.com/bripkens/connect-history-api-fallback) 中间件。

```javascript
const path = require('path')
// 导入处理 history 模式的模块
const history = require('connect-history-api-fallback')
// 导入 express
const express = require('express')

const app = express()
// 注册处理 history 模式的中间件
app.use(history())
// 处理静态资源的中间件，网站根目录 ../web
app.use(express.static(path.join(__dirname, '../web')))

// 开启服务器，端口是 3000
app.listen(3000, () => {
  console.log('服务器开启，端口：3000')
})
```

`Nginx`

```text
location / {
  try_files $uri $uri/ /index.html;
}
```

## 实现原理

Vue 前置知识

- 插件
- 混入
- `Vue.observable()`
- 插槽
- `render` 函数
- 运行时和完整版的 Vue

### Hash 模式

- URL 中 `#` 后面的内容作为路径地址
- 监听 `hashchane` 事件
- 根据当前路由地址找到对应组件重新渲染

### History 模式

- 通过 `history.pushState()` 方法改变地址栏

  `pushState, replaceState` 只会改变地址栏，不会发起请求

- 监听 `popstate` 事件
- 根据当前路由地址找到对应组件重新渲染

### 回顾核心代码

```javascript
// --- router/index.js
// 注册组件
Vue.use(VueRouter)
// 创建路由对象
const router = new VueRouter({
  routes: [{ name: 'home', path: '/', component: homeComponent }],
})

// --- main.js
// 创建 Vue 实例，注册 router 对象
new Vue({
  router,
  render: h => h(App),
}).$mount('#app')
```

VueRouter 类图

- VueRouter
- 属性
  - `options`
  - `data`
  - `routeMap`
- 方法
  - `Constructor(Options): VueRouter`
  - `install(Vue): void`
  - `init(): void`
  - `initEvent(): void`
  - `createRouteMap(): void`
  - `initComponents(Vue): void`

### Vue 的构建版本

- 运行时版

  不支持 template 模板，需要打包的时候提前编译

- 完整版

  包含运行时和编译器，体积比运行时版大 10K 左右，程序运行的时候把模板转换成 render 函数

```javascript
let _Vue = null

export default class VueRouter {
  constructor(options) {
    this.options = options
    this.routeMap = {}
    this.data = _Vue.observable({
      current: window.location.pathname || '/',
    })
  }

  init() {
    this.createRouteMap()
    this.initComponents(_Vue)
    this.initEvent()
  }

  createRouteMap() {
    // 遍历所有路由规则，把路由规则解析成键值对的形式，存储到 routeMap 中
    this.options.routes.forEach(route => {
      this.routeMap[route.path] = route.component
    })
  }

  initComponents(Vue) {
    Vue.component('router-link', {
      props: {
        to: String,
      },
      // template: '<a :href="to"><slot /></a>',
      render(h) {
        return h(
          'a',
          {
            attrs: {
              href: this.to,
            },
            on: {
              click: this.clickHandler,
            },
          },
          [this.$slots.default]
        )
      },
      methods: {
        clickHandler(e) {
          history.pushState({}, '', this.to)
          this.$router.data.current = this.to
          e.preventDefault()
        },
      },
    })
    Vue.component('router-view', {
      render: h => {
        const component = this.routeMap[this.data.current]
        return h(component)
      },
    })
  }

  initEvent() {
    window.addEventListener('popstate', () => {
      this.data.current = window.location.pathname
    })
  }

  static install(Vue) {
    // 1.判断当前插件是否已经被安装
    if (VueRouter.install.installed) return
    VueRouter.install.installed = true
    // 2.把 Vue 构造函数记录到全局变量
    _Vue = Vue
    // 3. 把创建 Vue 实例时候传入的 router 对象注入到 Vue 实例上
    // 混入
    _Vue.mixin({
      beforeCreate() {
        if (this.$options.router) {
          _Vue.prototype.$router = this.$options.router
          this.$options.router.init()
        }
      },
    })
  }
}
```
