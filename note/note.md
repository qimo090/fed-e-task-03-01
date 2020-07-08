> 首先回顾 Vue Router 的基本使用，以及 Hash 模式和 History 模式的区别，然后自己手写一个实现基 History 模式的前端路由，了解路由内部实现的原理；
>
> 接下来在数据响应式实现原理分析中，自己动手一个简易版本的 Vue；
>
> 最后掌握虚拟 DOM 的作用，通过一个虚拟 DOM 库 Snabbdom 真正了解什么是虚拟 DOM，以及 Diff 算法的实现和 key 的作用。

# 任务一：Vue.js 基础回顾

## 课程介绍

- 快速回顾 Vue.js 基础语法
- Vue Router 原理分析与实现
- 虚拟 DOM 库 Snabbdom 源码解析
- 响应式原理分析与实现
- Vue.js 源码分析

## Vue.js 框架基础

### Vue.js 基础结构

```html
<div id="app">
  <p>公司名称：{{ company.name }}</p>
  <p>公司地址：{{ company.address }}</p>
</div>
<script src="https://cdn.bootcdn.net/ajax/libs/vue/2.6.11/vue.js"></script>
<script>
  new Vue({
    el: '#app',
    data: {
      company: {
        name: '拉勾',
        address: '中关村创业大街籍海楼4层',
      },
    },
  })
</script>
```

```html
<div id="app"></div>
<script src="https://cdn.bootcdn.net/ajax/libs/vue/2.6.11/vue.js"></script>
<script>
  new Vue({
    data: {
      company: {
        name: '拉勾',
        address: '中关村创业大街籍海楼4层',
      },
    },
    render(h) {
      return h('div', [
        h('p', '公司名称：' + this.company.name),
        h('p', '公司地址：' + this.company.address),
      ])
    },
  }).$mount('#app')
</script>
```

### Vue.js 生命周期

[vue.js 生命周期](https://cn.vuejs.org/v2/guide/instance.html#%E7%94%9F%E5%91%BD%E5%91%A8%E6%9C%9F%E5%9B%BE%E7%A4%BA)

### Vue.js 语法和概念

- 插值表达式
- 指令
- 计算属性和侦听器
- Class 和 Style 绑定
- 条件渲染 列表渲染
- 表单输入绑定

- 组件
- 插槽
- 插件
- 混入 mixin
- 深入响应式原理
- 不同构建版本的 Vue

# Vue Router 的实现原理

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

# 任务三：模拟 Vue.js 响应式原理

## 课程目标

- 模拟一个最小版本的 Vue
- 响应式原理在面试的常问问题
- 学习别人优秀的经验，转换为自己的经验
- 实际项目中出问题的原理层面的解决
  - 给 Vue 示例新增一个成员是否是响应式的？
  - 给属性重新赋值成对象，是否是响应式
- 为学习 Vue 源码做铺垫

## 准备工作

- 数据驱动
- 响应式的核心原理
- 发布订阅模式和观察者模式

### 数据驱动

- 数据响应式、双向绑定、数据驱动
- 数据响应式
  - 数据模型仅仅是普通的 JavaScript 对象，而当我们修改数据时，视图会进行更新，避免了繁琐的 DOM 操作，提高开发效率
- 双向绑定
  - 数据改变，视图改变；视图改变，数据也随之变化
  - 我们可以使用 `v-model` 在表单元素上创建双向数据绑定
- 数据驱动是 Vue 最独特的特征之一

  - 开发过程中仅需要关注数据本身，不需要关心数据是如何渲染到视图

### 数据响应式的核心原理

Vue 2.x

- [Vue 2.x 深入响应式原理](https://cn.vuejs.org/v2/guide/reactivity.html)
- [MDN Object.defineProperty](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty)
- 浏览器兼容 IE8 以上（不兼容 IE8）

```javascript
// 模拟 Vue 中的 data 选项
let data = {
  msg: 'hello',
}

// 模拟 Vue 的实例
let vm = {}

// 数据劫持，当访问或者修改 vm 中的成员的时候，做一些额外的操作
Object.defineProperty(vm, 'msg', {
  // 可枚举
  enumerable: true,
  // 可配置
  configurable: true,
  get() {
    console.log('get:', data.msg)
    return data.msg
  },
  set(newValue) {
    console.log('set:', newValue)
    if (newValue === data.msg) return
    data.msg = newValue
    document.querySelector('#app').textContent = data.msg
  },
})

// 测试
vm.msg = 'Hello World'
console.log(vm.msg)
```

Vue 3.x

- [MDN Proxy](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Proxy)
- 直接监听对象，而非属性
- ES6 中新增，IE 不指出，性能由浏览器优化

```javascript
// 模拟 Vue 中的 data 选项
let data = {
  msg: 'hello',
  count: 0,
}

// 模拟 Vue 实例
let vm = new Proxy(data, {
  get(target, key) {
    console.log('get, key:', key, target[key])
    return target[key]
  },
  set(target, key, newValue) {
    console.log('set, key:', key, newValue)
    if (target[key] === newValue) return
    target[key] = newValue
    document.querySelector('#app').textContent = target[key]
  },
})

// 测试
vm.msg = 'Hello World'
console.log(vm.msg)
```

## 发布订阅模式和观察者模式

### 发布/订阅模式

- 发布/订阅模式

  - 订阅者
  - 发布者
  - 消息中心

    我们假定存在一个"消息中心"，某个任务执行完成，就向消息中心"发布"(publish)一个信号，其他任务可以向消息中心"订阅"(subscribe)这个信号，从而直到什么时候可以自己开始执行，这就叫做 **"发布订阅模式"** (publish-subscribe pattern)

- Vue 的自定义事件

  - [Vue 官网-自定义事件](https://cn.vuejs.org/v2/guide/migration.html#dispatch-%E5%92%8C-broadcast-%E6%9B%BF%E6%8D%A2)

  ```javascript
  let vm = new Vue()

  vm.$on('dataChange', () => {
    console.log('dataChange')
  })

  vm.$emit('dataChange')
  ```

- 兄弟组件通信过程

  ```javascript
  // eventBus.js
  // 事件中心
  let eventBus = new Vue()

  // --- ComponentA.vue
  // 发布者
  methods = {
    addTodo() {
      // 发布消息（事件）
      eventBus.$emit('add-todo', { text: this.newTodoText })
      this.newTodoText = ''
    },
  }

  // --- ComponentB.vue
  // 订阅者
  let vue = {
    created() {
      // 订阅消息（事件）
      eventBus.$on('add-todo', this.addTodo)
    },
  }
  ```

- 模拟 Vue 自定义事件的实现

  ```javascript
  // 事件触发器
  class EventEmitter {
    constructor() {
      this.subs = Object.create(null)
    }

    // 注册事件
    $on(eventType, handler) {
      this.subs[eventType] = this.subs[eventType] || []
      this.subs[eventType].push(handler)
    }
    // 触发事件
    $emit(eventType) {
      if (this.subs[eventType]) {
        this.subs[eventType].forEach(handler => {
          handler()
        })
      }
    }
  }

  let em = new EventEmitter()
  em.$on('click', () => {
    console.log('click1')
  })
  em.$on('click', () => {
    console.log('click2')
  })

  em.$emit('click')
  ```

### 观察者模式

- 观察者（订阅者） - `Watcher`
  - `update()` 当事件发生时，具体要做的事情
- 目标（发布者）- `Dep`
  - `subs` 数组：存储所有的观察者
  - `addSub()` 事件：添加观察者
  - `notify()` 事件：当事件发生，调用所有的观察者的 `update()` 方法
- 没有消息中心

总结

- **观察者模式**

  是由具体目标调度，比如当事件触发，Dep 就是去调用观察者的方法，所以观察者模式与发布者之间是存在依赖的

- **发布订阅模式**

  由统一的调度中心调用，因此发布者和订阅者不需要知道对方的存在

![Observer-PublishSubscribe](https://tva1.sinaimg.cn/large/007S8ZIlgy1ggi5vwbynuj30ba08ywfk.jpg)

## 响应式原理模式

### 整体分析

- Vue 基本结构
- 打印 Vue 实例进行观察
- 整体结构
  ![vue](https://tva1.sinaimg.cn/large/007S8ZIlgy1ggi69oub9jj30xk0ay3zj.jpg)
  自我解读：
  页面的首次渲染
  先执行 Observer 进行数据响应式处理，并给每个属性创建对应的 Dep（依赖存放的容器，这时候是个空的容器）
  然后执行 Compiler 编译模板，解析指令和插值表达式，并 new Watcher 创建观察者，在 new 的过程中，触发 getter 函数将自身（即 watcher）放到 Dep 里面，形成了依赖
  当修改某个属性的时候，触发 setter 函数，先修改模型 Model 里面的数据，然后 dep 进行 notify 通知该 dep 中的 subs 中的所有 watcher 触发 update 函数，再触发 new Watcher 时候定义的回调函数，修改视图 View，这样就达到视图和模型的双向绑定的目的
- Vue

  把 data 中的成员注入到 Vue 实例，并且把 data 中的成员转成 getter/setter

- Observer

  能够对数据对象的所有属性进行监听，如有变动可拿到最新值并通知 Dep

### Vue

- 功能
  - 负责接受初始化的参数（选项）
  - 负责把 `data` 中的属性注入到 `Vue` 实例，转换成 `getter/setter`
  - 负责调用 `Observer` 监听 `data` 中所有属性的变化
  - 负责调用 `Compiler` 解析指令和插值表达式
- 结构
  - Vue
    - `$options`
    - `$el`
    - `$data`
    - `_proxyData()`
- 代码

  ```javascript
  class Vue {
    constructor(options) {
      // 1.通过属性保存选项的数据
      this.$options = options || {}
      this.$data = options.data || {}
      this.$el =
        typeof options.el === 'string'
          ? document.querySelector(options.el)
          : options.el
      // 2.把 data 中的成员转换成 getter/setter，并注入到 Vue 实例中
      this._proxyData(this.$data)
      // 3.调用 observer 对象，监听数据的变化
      // 4.调用 compiler 对象，解析指令和插值表达式
    }

    _proxyData(data) {
      // 遍历 data 中的所有属性
      Object.keys(data).forEach(key => {
        // 把 data 的属性注入到 Vue 实例中
        Object.defineProperty(this, key, {
          enumerable: true,
          configurable: true,
          get() {
            return data[key]
          },
          set(newValue) {
            if (newValue === data[key]) return
            data[key] = newValue
          },
        })
      })
    }
  }
  ```

### Observer

- 功能
  - 负责把 data 选项中的属性转换成响应式数据
  - 如果 data 中的某个属性也是对象，把该属性也转换成响应式数据
  - 数据变化时发送通知
- 结构
  - Observer
    - `walk(data)`
    - `defineReactive(data, key, value)`
- 代码

  ```javascript
  class Observer {
    constructor(data) {
      this.walk(data)
    }
    walk(data) {
      // 1.判断data是否是对象
      if (!data || typeof data !== 'object') return
      // 2.遍历data对象的所有属性
      Object.keys(data).forEach(key => {
        this.defineReactive(data, key, data[key])
      })
    }
    // 数据响应式
    defineReactive(data, key, val) {
      this.walk(val)
      Object.defineProperty(data, key, {
        enumerable: true,
        configurable: true,
        get: () => {
          return val
        },
        set: newValue => {
          if (newValue === val) return
          val = newValue
          // 通知，给新赋值的数据进行响应式处理，比如 msg: 'msg' => msg: { title: 'msg' }
          this.walk(newValue)
        },
      })
    }
  }

  class Vue {
    constructor(options) {
      // 1.通过属性保存选项的数据
      this.$options = options || {}
      this.$data = options.data || {}
      this.$el =
        typeof options.el === 'string'
          ? document.querySelector(options.el)
          : options.el
      // 2.把 data 中的成员转换成 getter/setter，并注入到 Vue 实例中
      this._proxyData(this.$data)
      // 3.调用 observer 对象，监听数据的变化
      new Observer(this.$data)
      // 4.调用 compiler 对象，解析指令和插值表达式
    }

    _proxyData(data) {
      // 遍历 data 中的所有属性
      Object.keys(data).forEach(key => {
        // 把 data 的属性注入到 Vue 实例中
        Object.defineProperty(this, key, {
          enumerable: true,
          configurable: true,
          get() {
            return data[key]
          },
          set(newValue) {
            if (newValue === data[key]) return
            data[key] = newValue
          },
        })
      })
    }
  }
  ```

### Compiler

- 功能
  - 负责编译模板，解析指令和插值表达式
  - 负责页面的首次渲染
  - 当数据变化后重新渲染视图
- 结构
  - Compiler
  - 属性
    - `el`
    - `vm`
  - 方法
    - `compile`
    - `compileElement(node)`
    - `compileText(node)`
    - `isDirective(attrName)`
    - `isTextNode(node)`
    - `isElementNode(node)`
- 代码

  ```javascript
  class Compiler {
    constructor(vm) {
      this.el = vm.$el
      this.vm = vm
      this.compile(this.el)
    }

    // 编译模板，处理文本节点和元素节点
    compile(el) {
      let childNodes = el.childNodes
      Array.from(childNodes).forEach(node => {
        if (this.isTextNode(node)) {
          // 处理文本节点
          this.compileText(node)
        } else if (this.isElementNode(node)) {
          // 处理元素节点
          this.compileElement(node)
        }

        // 判断 node 节点是否有子节点，如果有，递归调用 compile
        if (node.childNodes && node.childNodes.length) {
          this.compile(node)
        }
      })
    }

    // 编译元素节点，处理指令
    compileElement(node) {
      // console.log(node.attributes)
      // 遍历所有的属性节点
      Array.from(node.attributes).forEach(attr => {
        // 判断是否是指令
        let attrName = attr.name
        if (this.isDirective(attrName)) {
          // v-text => text, v-model => model ...
          attrName = attrName.substr(2)
          let key = attr.value
          this.update(node, key, attrName)
        }
      })
    }
    update(node, key, attrName) {
      let updateFn = this[`${attrName}Updater`]
      updateFn && updateFn(node, this.vm[key])
    }
    // 处理 v-text 指令
    textUpdater(node, value) {
      node.textContent = value
    }
    // 处理 v-model 指令
    modelUpdater(node, value) {
      node.value = value
    }

    // 编译文本节点，处理插值表达式
    compileText(node) {
      // console.dir(node)
      // {{  msg }}
      let reg = /{{(.+?)}}/
      let value = node.textContent
      if (reg.test(value)) {
        let key = RegExp.$1.trim()
        node.textContent = value.replace(reg, this.vm[key])
      }
    }
    // 判断元素是否是指令
    isDirective(attrName) {
      return attrName.startsWith('v-')
    }
    // 判断节点是否是文本节点
    isTextNode(node) {
      return node.nodeType === 3
    }
    // 判断节点是否是元素节点
    isElementNode(node) {
      return node.nodeType === 1
    }
  }

  class Vue {
    constructor(options) {
      // 1.通过属性保存选项的数据
      this.$options = options || {}
      this.$data = options.data || {}
      this.$el =
        typeof options.el === 'string'
          ? document.querySelector(options.el)
          : options.el
      // 2.把 data 中的成员转换成 getter/setter，并注入到 Vue 实例中
      this._proxyData(this.$data)
      // 3.调用 observer 对象，监听数据的变化
      new Observer(this.$data)
      // 4.调用 compiler 对象，解析指令和插值表达式
      new Compiler(this)
    }

    _proxyData(data) {
      // 遍历 data 中的所有属性
      Object.keys(data).forEach(key => {
        // 把 data 的属性注入到 Vue 实例中
        Object.defineProperty(this, key, {
          enumerable: true,
          configurable: true,
          get() {
            return data[key]
          },
          set(newValue) {
            if (newValue === data[key]) return
            data[key] = newValue
          },
        })
      })
    }
  }
  ```

### Dep

Dependency
![Dep](https://tva1.sinaimg.cn/large/007S8ZIlly1ggiu2ceqmsj31460eimyx.jpg)

- 功能
  - 收集依赖，添加观察者（Watcher）
  - 通知所有的观察者
- 结构
  - Dep
  - 属性
    - `subs`
  - 方法
    - `addSub(sub)`
    - `notify()`

### Watcher

![Watcher](https://tva1.sinaimg.cn/large/007S8ZIlly1ggitlah4fmj316g0bqtab.jpg)

- 功能
  - 当数据变化触发依赖， `dep` 通知所有的 `Watcher` 实例更新视图
  - 自身实例化的时候往 `dep` 中添加自己
- 结构
  - Watcher
  - 属性
    - `vm`
    - `key`
    - `cb`
    - `oldValue`
  - 方法
    - `update()`

## 总结

- 问题
  - 给属性重新赋值成对象，是否是响应式的？_Yes_
  - 给 Vue 实例新增一个成员是否是响应式的？*No*s
- 通过下图回顾整体流程
  ![new Vue](https://tva1.sinaimg.cn/large/006tNbRwly1g9wn15bw9uj314q0lwwi7.jpg)

# 任务四：Virtual DOM 的实现原理

## 课程目标

- 了解什么是虚拟 DOM，以及虚拟 DOM 的作用
- Snabbdom 的基本使用
- Snabbdom 的源码解析

## 虚拟 DOM

### 什么是 Virtual DOM ?

- Virtual DOM 是由普通的 JS 对象来描述 DOM 对象，因为不是真实的 DOM 对象，所以叫 Virtual DOM
- 真实 DOM 成员示例

  ```javascript
  let element = document.querySelector('#app')
  let s = ''
  for (let key in element) {
    s += key + ','
  }
  // 打印结果
  ;('align,title,lang,translate,dir,hidden,accessKey,draggable,spellcheck,autocapitalize,contentEditable,isContentEditable,inputMode,offsetParent,offsetTop,offsetLeft,offsetWidth,offsetHeight,style,innerText,outerText,oncopy,oncut,onpaste,onabort,onblur,oncancel,oncanplay,oncanplaythrough,onchange,onclick,onclose,oncontextmenu,oncuechange,ondblclick,ondrag,ondragend,ondragenter,ondragleave,ondragover,ondragstart,ondrop,ondurationchange,onemptied,onended,onerror,onfocus,onformdata,oninput,oninvalid,onkeydown,onkeypress,onkeyup,onload,onloadeddata,onloadedmetadata,onloadstart,onmousedown,onmouseenter,onmouseleave,onmousemove,onmouseout,onmouseover,onmouseup,onmousewheel,onpause,onplay,onplaying,onprogress,onratechange,onreset,onresize,onscroll,onseeked,onseeking,onselect,onstalled,onsubmit,onsuspend,ontimeupdate,ontoggle,onvolumechange,onwaiting,onwebkitanimationend,onwebkitanimationiteration,onwebkitanimationstart,onwebkittransitionend,onwheel,onauxclick,ongotpointercapture,onlostpointercapture,onpointerdown,onpointermove,onpointerup,onpointercancel,onpointerover,onpointerout,onpointerenter,onpointerleave,onselectstart,onselectionchange,onanimationend,onanimationiteration,onanimationstart,ontransitionend,dataset,nonce,autofocus,tabIndex,click,attachInternals,focus,blur,enterKeyHint,onpointerrawupdate,namespaceURI,prefix,localName,tagName,id,className,classList,slot,attributes,shadowRoot,part,assignedSlot,innerHTML,outerHTML,scrollTop,scrollLeft,scrollWidth,scrollHeight,clientTop,clientLeft,clientWidth,clientHeight,attributeStyleMap,onbeforecopy,onbeforecut,onbeforepaste,onsearch,elementTiming,previousElementSibling,nextElementSibling,children,firstElementChild,lastElementChild,childElementCount,onfullscreenchange,onfullscreenerror,onwebkitfullscreenchange,onwebkitfullscreenerror,hasAttributes,getAttributeNames,getAttribute,getAttributeNS,setAttribute,setAttributeNS,removeAttribute,removeAttributeNS,toggleAttribute,hasAttribute,hasAttributeNS,getAttributeNode,getAttributeNodeNS,setAttributeNode,setAttributeNodeNS,removeAttributeNode,attachShadow,closest,matches,webkitMatchesSelector,getElementsByTagName,getElementsByTagNameNS,getElementsByClassName,insertAdjacentElement,insertAdjacentText,setPointerCapture,releasePointerCapture,hasPointerCapture,insertAdjacentHTML,requestPointerLock,getClientRects,getBoundingClientRect,scrollIntoView,scroll,scrollTo,scrollBy,scrollIntoViewIfNeeded,animate,computedStyleMap,before,after,replaceWith,remove,prepend,append,querySelector,querySelectorAll,requestFullscreen,webkitRequestFullScreen,webkitRequestFullscreen,onbeforexrselect,ariaAtomic,ariaAutoComplete,ariaBusy,ariaChecked,ariaColCount,ariaColIndex,ariaColSpan,ariaCurrent,ariaDisabled,ariaExpanded,ariaHasPopup,ariaHidden,ariaKeyShortcuts,ariaLabel,ariaLevel,ariaLive,ariaModal,ariaMultiLine,ariaMultiSelectable,ariaOrientation,ariaPlaceholder,ariaPosInSet,ariaPressed,ariaReadOnly,ariaRelevant,ariaRequired,ariaRoleDescription,ariaRowCount,ariaRowIndex,ariaRowSpan,ariaSelected,ariaSort,ariaValueMax,ariaValueMin,ariaValueNow,ariaValueText,ariaDescription,ELEMENT_NODE,ATTRIBUTE_NODE,TEXT_NODE,CDATA_SECTION_NODE,ENTITY_REFERENCE_NODE,ENTITY_NODE,PROCESSING_INSTRUCTION_NODE,COMMENT_NODE,DOCUMENT_NODE,DOCUMENT_TYPE_NODE,DOCUMENT_FRAGMENT_NODE,NOTATION_NODE,DOCUMENT_POSITION_DISCONNECTED,DOCUMENT_POSITION_PRECEDING,DOCUMENT_POSITION_FOLLOWING,DOCUMENT_POSITION_CONTAINS,DOCUMENT_POSITION_CONTAINED_BY,DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC,nodeType,nodeName,baseURI,isConnected,ownerDocument,parentNode,parentElement,childNodes,firstChild,lastChild,previousSibling,nextSibling,nodeValue,textContent,hasChildNodes,getRootNode,normalize,cloneNode,isEqualNode,isSameNode,compareDocumentPosition,contains,lookupPrefix,lookupNamespaceURI,isDefaultNamespace,insertBefore,appendChild,replaceChild,removeChild,addEventListener,removeEventListener,dispatchEvent,')
  ```

- 可以使用 Virtual DOM 来描述真实 DOM，示例

  ```javascript
  vdom = {
    sel: 'div',
    data: {},
    children: undefined,
    text: 'Hello Virtual DOM',
    elm: undefined,
    key: undefined,
  }
  ```

### 为什么使用 Virtual DOM ?

- 手动操作 DOM 比较麻烦，还需要考虑浏览器兼容问题，虽然有 jQuery 等库简化 DOM 操作，但是随着项目的复杂，DOM 操作复杂提升
- 为了简化 DOM 的复杂操作于是出现了各种 MVVM 框架，MVVM 框架解决了视图和状态的同步问题
- 为了简化视图的操作我们可以使用模板引擎，但是模板引擎没有解决跟踪状态变化的问题，于是 Virtual DOM 出现了
- Virtual DOM 的好处是当状态改变时不需要立即更新 DOM，只需要创建一个虚拟 DOM 树来描述 DOM，Virtual DOM 内部将弄清楚如何高效（Diff）的更新 DOM
- 参考 GitHub 上 [virtual-dom](https://github.com/Matt-Esch/virtual-dom) 的描述
  - 虚拟 DOM 可以维护程序的状态，跟踪上一次的状态
  - 通过比较前后两次状态的差异更新真实 DOM

### 使用 DOM 的作用

- 维护视图和状态的关系
- 复杂视图情况下提升渲染性能
- 除了渲染 DOM 之外，还可以实现 SSR(Nuxt.js/Next.js)，原生应用(Weex/React Native)，小程序(mpvue/uni-app)等

### Virtual DOM 库

- [Snabbdom](https://github.com/snabbdom/snabbdom)
  - Vue 2.x 内部使用的 Virtual DOM 就是改造的 Snabbdom
  - 大约 200 SLOC(Single Line of Code)
  - 可以通过模块扩展
  - 源码使用 TypeScript 开发
  - 最快的 Virtual DOM 之一
- [virtual-dom](https://github.com/Matt-Esch/virtual-dom)

## Snabbdom

> 以下例子 snabbdom 版本为 0.7.0

### 创建项目

- 打包工具为了方便使用 [Parcel](https://parceljs.org/)
- 创建项目，并安装 Parcel

  ```shell
  # 创建项目目录
  mkdir snabbdom-demo
  # 进入项目目录
  cd snabbdom-demo
  # 创建 package.json
  yarn init -y
  # 本地安装 parcel
  yarn add parcel-bundler
  ```

- 配置 package.json 和 scripts

  ```json
  {
    "scripts": {
      "dev": "parcel index.html --open",
      "build": "parcel build index.html"
    }
  }
  ```

* 创建项目结构

  ```text
  src
    01-basicusage.js
  index.html
  package.json
  ```

### 导入 Snabbdom

文档地址 https://github.com/snabbdom/snabbdom

**安装 Snabbdom**

```shell script
yarn add snabbdom@0.7.0
```

**导入 Snabbdom**

- Snabbdom 的官网 demo 中导入使用的是 common.js 模块化规范，我们使用更流行的 ESM 模块化语法 `import`
- 关于模块化的语法青参考阮一峰老师的 Module 的语法
- ES6 模块与 CommonJS 模块的差异

  ```javascript
  import { init, h, thunk } from 'snabbdom'
  ```

- Snabbdom 的核心仅提供了最基本的功能，只导出了三个函数 `init, h, thunk`

  - `init` 是一个高阶函数，返回 `patch`
  - `h` 返回虚拟节点 VNode，这个函数在 Vue.js 2.x 中见过

    ```javascript
    new Vue({
      router,
      store,
      render: h => h(App),
    }).$mount('#app')
    ```

  - `thunk` 是一个优化策略，可以在处理不可变数据时使用

- **注意** 导入时候不能使用 `import snabbdom from 'snabbdom'`
  - 原因：`node_modules/snabbdom.ts` 末尾导出使用的是 `export` 导出 API，没有使用 `export default` 进行默认导出

### Snabbdom 模块

Snabbdom 的核心库并不能处理元素的属性/样式/事件等，如果需要处理的话，可以使用模块

**常用模块**

- 官方提供了 6 个模块
  - `attributes`
    - 设置 DOM 元素的属性，使用 `setAttributes()`
    - 处理布尔类型的属性
  - `props`
    - 和 `attributes` 模块类似，设置 DOM 元素的属性 `element[attr] = value`
    - 不处理布尔类型的属性
  - `class`
    - 切换类样式
    - 注意：给元素设置类名是通过 `sel` 选择器
  - `dataset`
    - 设置 `sata-*` 的自定义属性
  - `eventlisteners`
    - 注册和移除事件
  - `style`
    - 设置行内样式，支持动画
    - `delayed/remove/destroy`

**模块使用**

- 模块使用步骤

  - 导入需要的模块
  - `init()` 中注册模块
  - 使用 `init()` 函数创建 VNode 函数，可以把第二个参数设置为对象，其他参数往后移

  ```javascript
  import { init, h } from 'snabbdom'
  // 1. 导入模块
  import style from 'snabbdom/modules/style'
  import eventlisteners from 'snabbdom/modules/eventlisteners'
  // 2. 注册模块
  let patch = init([style, eventlisteners])
  // 3. 使用 h() 函数的第二个参数传入模块需要的数据
  let vnode = h(
    'div',
    {
      style: {
        backgroundColor: 'red',
      },
      on: {
        click: eventHandler,
      },
    },
    [h('h1', 'Hello Snabbdom'), h('p', '这是 p 标签')]
  )

  function eventHandler() {
    console.log('click !!!')
  }
  ```

### Snabbdom 源码解析

#### 如何学习源码

- 先宏观了解
- 带着目的看源码
- 看源码的过程要不求甚解
- 调试
- 参考资料

#### Snabbdom 的核心

- 使用 `h()` 函数创建 JavaScript 对象 (VNode) 描述真实 DOM
- `init()` 设置模块，创建 `patch()`
- `patch()` 比较新旧两个 VNode
- `patch()` 把变化的内容更新到真实 DOM 上

#### Snabbdom 源码

- [源码地址](https://github.com/snabbdom/snabbdom)
- src 目录结构

### h 函数

- `h()` 函数介绍

  - 在使用 Vue 的时候见过

    ```javascript
    new Vue({
      router,
      store,
      render: h => h(App),
    }).$mount('#app')
    ```

  - `h()` 函数最早见于 [hyperscript](https://github.com/hyperhype/hyperscript) ， 使用 JavaScript 创建超文本
  - Snabbdom 中的 `h()` 函数不是用来创建创建超文本，而是创建 VNode

- 函数重载

  - 概念
    - **参数个数** 或 **类型** 不同的函数
    - JavaScript 中没有重载的概念
    - TypeScript 中有重载，不过重载的实现还是通过代码调整参数
  - 重载的示例

    ```javascript
    function add(a, b) {
      console.log(a + b)
    }
    function add(a, b, c) {
      console.log(a + b + c)
    }
    add(1, 2)
    add(1, 2, 3)
    ```

- 源码位置：`src/h.ts`

  ```typescript
  import { vnode, VNode, VNodeData } from './vnode'
  import * as is from './is'

  function addNS(
    data: any,
    children: Array<VNode> | undefined,
    sel: string | undefined
  ): void {
    data.ns = 'http://www.w3.org/2000/svg'
    if (sel !== 'foreignObject' && children !== undefined) {
      for (let i = 0; i < children.length; ++i) {
        let childData = children[i].data
        if (childData !== undefined) {
          addNS(
            childData,
            (children[i] as VNode).children as Array<VNode>,
            children[i].sel
          )
        }
      }
    }
  }
  // h 函数的重载
  export function h(sel: string): VNode
  export function h(sel: string, data: VNodeData): VNode
  export function h(sel: string, text: string): VNode
  export function h(
    sel: string,
    children: Array<VNode | undefined | null>
  ): VNode
  export function h(sel: string, data: VNodeData, text: string): VNode
  export function h(
    sel: string,
    data: VNodeData,
    children: Array<VNode | undefined | null>
  ): VNode
  export function h(sel: any, b?: any, c?: any): VNode {
    var data: VNodeData = {},
      children: any,
      text: any,
      i: number
    // 处理参数，实现重载机制
    if (c !== undefined) {
      // 处理三个参数的情况
      // sel, data, children/text
      data = b
      if (is.array(c)) {
        children = c
      }
      // 如果 c 是字符串或数字
      else if (is.primitive(c)) {
        text = c
      }
      // 如果 c 是 VNode
      else if (c && c.sel) {
        children = [c]
      }
    } else if (b !== undefined) {
      // 处理两个参数的情况
      // 如果 b 是数组
      if (is.array(b)) {
        children = b
      }
      // 如果 b 是字符串或数字
      else if (is.primitive(b)) {
        text = b
      }
      // 如果 b 是 VNode
      else if (b && b.sel) {
        children = [b]
      } else {
        data = b
      }
    }
    if (is.array(children)) {
      // 处理 children 中的原始值（String/Number）
      for (i = 0; i < children.length; ++i) {
        // 如果 child 是 String/Number，创建文本节点
        if (is.primitive(children[i]))
          children[i] = (vnode as any)(
            undefined,
            undefined,
            undefined,
            children[i]
          )
      }
    }
    if (
      sel[0] === 's' &&
      sel[1] === 'v' &&
      sel[2] === 'g' &&
      (sel.length === 3 || sel[3] === '.' || sel[3] === '#')
    ) {
      // 如果是 svg，添加命名空间
      addNS(data, children, sel)
    }
    return vnode(sel, data, children, text, undefined)
  }
  // 导出模块
  export default h
  ```

### vnode

```typescript
import { Hooks } from './hooks'
import { AttachData } from './helpers/attachto'
import { VNodeStyle } from './modules/style'
import { On } from './modules/eventlisteners'
import { Attrs } from './modules/attributes'
import { Classes } from './modules/class'
import { Props } from './modules/props'
import { Dataset } from './modules/dataset'
import { Hero } from './modules/hero'

export type Key = string | number

export interface VNode {
  // 选择器
  sel: string | undefined
  // 节点数据：属性/样式/事件等
  data: VNodeData | undefined
  // 子节点：和 text 互斥
  children: Array<VNode | string> | undefined
  // 记录 vnode 对应的真实 DOM
  elm: Node | undefined
  // 节点中的内容，和 children 互斥
  text: string | undefined
  // 优化性能使用
  key: Key | undefined
}

export interface VNodeData {
  props?: Props
  attrs?: Attrs
  class?: Classes
  style?: VNodeStyle
  dataset?: Dataset
  on?: On
  hero?: Hero
  attachData?: AttachData
  hook?: Hooks
  key?: Key
  ns?: string // for SVGs
  fn?: () => VNode // for thunks
  args?: Array<any> // for thunks
  [key: string]: any // for any other 3rd party module
}

export function vnode(
  sel: string | undefined,
  data: any | undefined,
  children: Array<VNode | string> | undefined,
  text: string | undefined,
  elm: Element | Text | undefined
): VNode {
  let key = data === undefined ? undefined : data.key
  return {
    sel: sel,
    data: data,
    children: children,
    text: text,
    elm: elm,
    key: key,
  }
}

export default vnode
```

### patch 的整体过程

Snabbdom

- `patch(oldVnode, newVnode)`
- 打补丁，把新节点中变化的内容渲染到真实 DOM，最后返回新节点作为下一次处理的旧节点
- 对比新旧 VNode 是否是相同节点（节点的 `key` 和 `sel` 相同）
- 如果不是相同节点，删除之前的内容，重新渲染
- 如果是相同节点，再判断新的 VNode 是否有 `text` ，如果有并且和 `oldVnode` 的 `text` 不同，直接更新文本内容
- 如果新的 VNode 有 `children` ，判断子节点是否有变化，判断子节点的过程使用的就是 `diff` 算法
- `diff` 过程只进行同层级比较

![diff](https://tva1.sinaimg.cn/large/007S8ZIlgy1ggjq0gna03j31ay0mkdt6.jpg)
