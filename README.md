# Part 3 | Mod 1

> 首先回顾 Vue Router 的基本使用，以及 Hash 模式和 History 模式的区别，然后自己手写一个实现基 History 模式的前端路由，了解路由内部实现的原理；
>
> 接下来在数据响应式实现原理分析中，自己动手一个简易版本的 Vue；
>
> 最后掌握虚拟 DOM 的作用，通过一个虚拟 DOM 库 Snabbdom 真正了解什么是虚拟 DOM，以及 Diff 算法的实现和 key 的作用。

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
  - PS：对于对象新增属性，响应式处理的重点就在于手动调用 `defineReactive`

**2、请简述 Diff 算法的执行过程**

**答**

1.  `updateChildren()` 函数的执行，主要是利用 **双指针**
2.  首先定义 `oldStartIdx`、`newStartIdx`、`oldEndIdx` 以及 `newEndIdx` 分别是新老两个 VNode 的两边的索引，同时 `oldStartVnode`、`newStartVnode`、`oldEndVnode` 以及 `newEndVnode` 分别指向这几个索引对应的 VNode 节点。
3.  接下来是一个 while 循环，在这过程中，`oldStartIdx`、`newStartIdx`、`oldEndIdx` 以及 `newEndIdx` 会逐渐向中间靠拢。
4.  首先当新旧开始和新旧结束节点不存在的时候，对应的索引向中间靠拢，并更新对应的节点的指向
5.  接下来是将 `oldStartIdx`、`newStartIdx`、`oldEndIdx` 以及 `newEndIdx` 两两比对的过程，一共会出现 2\*2=4 种情况。
    1.  首先是新旧开始节点和新旧结束节点如果相同，直接进行 pathVnode，同时索引向后或向前移动一位
    2.  然后是两种交叉情况，
        1. 旧开始和新结束节点相同，先 `patchVnode`，再将旧开始节点移动到旧结束节点后面，更新索引和对应节点，`++oldStartIdx`，`--newEndIdx`
        2. 旧结束和新开始节点相同，先 `patchVnode`，再将旧结束节点移动到旧开始节点前面，更新索引和对应节点，`--oldEndIdx`，`++newStartIdx`
6.  最后是当以上情况都不符合的时候

    创建一个 key 和 index 对应的 map 表，可以根据某一个 key 的值，快速地从 `oldKeyToIdx`（`createKeyToOldIdx` 的返回值）中获取相同 key 的节点的索引 `idxInOld`，然后找到相同的节点

    1.  如果没有找到相同的节点，则通过 `createElm` 创建一个新节点，并将 `newStartIdx` 向后移动一位。
    2.  否则如果找到了节点，同时它符合 `sameVnode`，则将这两个节点进行 `patchVnode`，将该位置的老节点赋值 `undefined`（之后如果还有新节点与该节点 key 相同可以检测出来提示已有重复的 key ），同时将 `newStartVnode.elm` 插入到 `oldStartVnode.elm` 的前面。同理，`newStartIdx` 往后移动一位。
    3.  如果不符合 `sameVnode`，只能创建一个新节点插入到 parentElm 的子节点中，`newStartIdx` 往后移动一位。

7.  最后一步，当 while 循环结束以后，如果 `oldStartIdx` > `oldEndIdx`，说明老节点比对完了，但是新节点还有多的，需要将新节点插入到真实 DOM 中去，调用 `addVnodes` 将这些节点插入即可。
8.  同理，如果满足 `newStartIdx` > `newEndIdx` 条件，说明新节点比对完了，老节点还有多，将这些无用的老节点通过 `removeVnodes` 批量删除即可。

## 二、编程题

**1、模拟 VueRouter 的 hash 模式的实现，实现思路和 History 模式类似，把 URL 中的 `#` 后面的内容作为路由的地址，可以通过 `hashchange` 事件监听路由地址的变化**。

答：项目路径 `code/01-vue-router-hash`，未考虑地址栏参数等情况

**2、在模拟 Vue.js 响应式源码的基础上实现 `v-html` 指令，以及 `v-on` 指令。**

答：项目路径 `code/02-v-html-v-on`

**3、参考 Snabbdom 提供的电影列表的示例，实现类似的效果**

[源码地址](https://github.com/snabbdom/snabbdom/tree/master/examples/reorder-animation)

如图：
![Snabbdom exp movie](https://tva1.sinaimg.cn/large/007S8ZIlgy1ggkgusneqvj30zi0jl44d.jpg)
