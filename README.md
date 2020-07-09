# Part 3 | Mod 1

## 一、简答题

**1、当我们点击按钮的时候动态给 data 增加的成员是否是响应式数据，如果不是的话，如果把新增成员设置成响应式数据，它的内部原理是什么。**

```javascript
let vm = new Vue({
 el: '#el'
 data: {
  o: 'object',
  dog: {}
 },
 method: {
  clickHandler () {
   // 该 name 属性是否是响应式的
   this.dog.name = 'Trump'
  }
 }
})
```

**答**

- 不是响应式数据

  > 原因 [深入响应式原理](https://cn.vuejs.org/v2/guide/reactivity.html#%E5%AF%B9%E4%BA%8E%E5%AF%B9%E8%B1%A1)

- 解决方法

  使用 `Vue.set(object, propertyName, value)` 方法向嵌套对象添加响应式 property

  ```javascript
  vm.set(this.dog, 'name', 'Trump')
  ```

- **原理**

  > [源码地址](https://github.com/vuejs/vue/blob/dev/src/core/observer/index.js)

  `vm.set` 源码如图所示

  ![vm.set](https://tva1.sinaimg.cn/large/007S8ZIlgy1ggkiqrn0cbj30vr0u07ci.jpg)

- **原理说明**
  - 首先判断参数如果有问题，进行报错处理；
  - 然后判断操作的是否是 **数组**，如果是调用 Vue 重写的数组的 `splice` 方法，实现数组操作的数据可以响应式；
  - 再然后判断需要操作的属性是否在响应式数据中已经存在了，如果不是新增，说明这个属性本身就已经是响应式的了，不需要再进行响应式处理，所以可以直接对该属性进行赋值；
  - 最后就是对对象进行新增属性时候的处理了，
    - 首先还是一个判断参数 `target` 的有效性
    - 然后调用 `defineReactive` 对新增的属性进行响应式处理
    - 再调用 `dep.notify()` 通知对应 `watcher` 进行更新
    - 最后返回新增属性的值
  - PS：对于对象新增属性，重点就在手动调用 `defineReactive`

**2、请简述 Diff 算法的执行过程**

## 二、编程题

1、模拟 VueRouter 的 hash 模式的实现，实现思路和 History 模式类似，把 URL 中的 `#` 后面的内容作为路由的地址，可以通过 `hashchange` 事件监听路由地址的变化。

答：项目路径 `code/01-vue-router-hash`，未考虑地址栏参数等情况

2、在模拟 Vue.js 响应式源码的基础上实现 `v-html` 指令，以及 `v-on` 指令。

答：项目路径 `code/02-v-html-v-on`

3、参考 Snabbdom 提供的电影列表的示例，实现类似的效果

[源码地址](https://github.com/snabbdom/snabbdom/tree/master/examples/reorder-animation)

如图：
![Snabbdom exp movie](https://tva1.sinaimg.cn/large/007S8ZIlgy1ggkgusneqvj30zi0jl44d.jpg)
