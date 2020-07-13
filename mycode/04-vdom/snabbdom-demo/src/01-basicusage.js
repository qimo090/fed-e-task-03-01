import { h, init } from 'snabbdom'

// 1. hello world
// init 参数：数组/模块
//      返回值：patch 函数，作用是对比两个 vnode 的差异更新到真实 DOM
let patch = init([])

// 第一个参数：标签 + 选择器
// 第二个参数：如果是字符串的话就是标签中的内容
let vnode = h('div#container.cls', 'hello world')

let app = document.querySelector('#app')

// patch 第一个参数：VNode | DOM Element，内部会把 DOM Element s转换成 VNode
//       第二个参数：VNode
//       返回值：VNode
let oldVNode = patch(app, vnode)

// 假设的时刻
setTimeout(() => {
  vnode = h('div', 'Hello Snabbdom')
  patch(oldVNode, vnode)
}, 2000)
