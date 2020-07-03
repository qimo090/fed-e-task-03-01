> 首先回顾 Vue Router 的基本使用，以及 Hash 模式和 History 模式的区别，然后自己手写一个实现基 History 模式的前端路由，了解路由内部实现的原理；接下来在数据响应式实现原理分析中，自己动手一个简易版本的 Vue；最后掌握虚拟 DOM 的作用，通过一个虚拟 DOM 库 Snabbdom 真正了解什么是虚拟 DOM，以及 Diff 算法的实现和 key 的作用。

# 任务一：Vue.js 基础回顾

## 课程介绍

+ 快速回顾 Vue.js 基础语法
+ Vue Router 原理分析与实现
+ 虚拟 DOM 库 Snabbdom 源码解析
+ 响应式原理分析与实现
+ Vue.js 源码分析

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
        address: '中关村创业大街籍海楼4层'
      }
    } 
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
        h('p', '公司地址：' + this.company.address)
      ])
    }
  }).$mount('#app')
</script>
```

### Vue.js 生命周期

[vue.js 生命周期](https://cn.vuejs.org/v2/guide/instance.html#%E7%94%9F%E5%91%BD%E5%91%A8%E6%9C%9F%E5%9B%BE%E7%A4%BA)

### Vue.js 语法和概念

+ 插值表达式
+ 指令
+ 计算属性和侦听器
+ Class 和 Style 绑定
+ 条件渲染 列表渲染
+ 表单输入绑定

+ 组件
+ 插槽
+ 插件
+ 混入 mixin
+ 深入响应式原理
+ 不同构建版本的 Vue

## Vue Router 的实现原理

### 课程介绍

+ Vue Router 基础回顾
+ Hash 模式和 History 模式
+ 模拟实现自己的 Vue Router

### Hash 和 History 模式

表现形式的区别
+ hash 模式
    https://music.163.com/#/playlist?id=3102961863
+ history 模式
    https://music.163.com/playlist/3102961863
    
原理的区别
+ hash 模式是基于锚点，以及 `onhashchange` 事件
+ history 模式是基于 HTML5 中的 `history` API
    + `history.pushState()` // IE10 以后才支持
    + `history.replaceState()`

### history 模式

History 模式的使用
+ History 需要服务器的支持
+ 单页应用中，服务端不存在类似 http://www.testurl.com/login 这样的地址，会返回找不到该页面 404
+ 在服务端应该除了静态资源外都返回单页应用的 index.html

# 任务二：Vue Router 原理实现

# 任务三：模拟 Vue.js 响应式原理
# 任务四：Virtual DOM 的实现原理
