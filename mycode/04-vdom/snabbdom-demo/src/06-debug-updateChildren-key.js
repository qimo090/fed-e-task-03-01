import { h, init } from 'snabbdom'

const patch = init([])
let oldVnode = null
let newVnode = null
const app = document.getElementById('app')

newVnode = h('ul', [
  h('li', { key: 'a' }, '首页'),
  h('li', { key: 'b' }, '视频'),
  h('li', { key: 'c' }, '微博'),
])
oldVnode = patch(app, newVnode)

newVnode = h('ul', [
  h('li', { key: 'a' }, '首页'),
  h('li', { key: 'c' }, '微博'),
  h('li', { key: 'b' }, '视频'),
])

patch(oldVnode, newVnode)
