import { init, h } from 'snabbdom'
// 1. 导入模块
import style from 'snabbdom/modules/style'
import eventlisteners from 'snabbdom/modules/eventlisteners'
// 2. 注册模块
let patch = init([style, eventlisteners])
// 3. 使用 h() 函数的第二个参数传入模块需要的数据
let vnode = h('div', {
  style: {
    backgroundColor: 'red',
  },
  on: {
    click: eventHandler
  }
}, [
  h('h1', 'Hello Snabbdom'),
  h('p', '这是 p 标签')
])

function eventHandler () {
  console.log('click !!!');
}

let app = document.querySelector('#app')

patch(app, vnode)
