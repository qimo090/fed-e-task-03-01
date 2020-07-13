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
