import { h, init } from 'snabbdom'

const patch = init([])
let oldVnode = null
let newVnode = null
const app = document.getElementById('app')

newVnode = h('ul', [
  h('li', '首页'),
  h('li', '视频'),
  h('li', '微博')
])
oldVnode = patch(app, newVnode)

newVnode = h('ul', [
  h('li', '首页'),
  h('li', '微博'),
  h('li', '视频')
])

patch(oldVnode, newVnode)
