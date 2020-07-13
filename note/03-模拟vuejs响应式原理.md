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
