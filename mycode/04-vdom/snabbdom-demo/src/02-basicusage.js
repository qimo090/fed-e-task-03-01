// 2. div > h1, p
import { h, init } from 'snabbdom'

let patch = init([])

let vnode = h('div#container', [
  h('h1', 'hello snabbdom'),
  h('p', '这是个P标签')
])

let app = document.querySelector('#app')

let oldVnode = patch(app, vnode)

setTimeout(() => {
  vnode = h('div#container', [
    h('h1', 'Hello World'),
    h('p', 'Hello P')
  ])
  patch(oldVnode, vnode)

  // 清空页面元素
  // patch(oldVnode, null) // 错误用法
  patch(oldVnode, h('!'))
}, 2000);

