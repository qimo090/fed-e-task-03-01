import { h, init } from 'snabbdom'
import eventlistenersModule from 'snabbdom/modules/eventlisteners'
import propsModule from 'snabbdom/modules/props'
import styleModule from 'snabbdom/modules/style'
import classModule from 'snabbdom/modules/class'

const patch = init([
  eventlistenersModule,
  propsModule,
  styleModule,
  classModule,
])

// 老的 vnode
let vnode
// 行数据的 key
let nextKey = 11
// 外边距
let margin = 8
// 排序方式
let sortBy = 'rank'
// 列表高度
let totalHeight = 0
// 原始数据
let originalData = [
  {
    rank: 1,
    title: '肖申克的救赎',
    desc: '希望让人自由',
    elmHeight: 0,
  },
  {
    rank: 2,
    title: '霸王别姬',
    desc: '风华绝代',
    elmHeight: 0,
  },
  {
    rank: 3,
    title: '阿甘正传',
    desc: '一部美国近现代史',
    elmHeight: 0,
  },
  {
    rank: 4,
    title: '这个杀手不太冷',
    desc: '怪蜀黍和小萝莉不得不说的故事',
    elmHeight: 0,
  },
  {
    rank: 5,
    title: '美丽人生',
    desc: '最美的谎言',
    elmHeight: 0,
  },
  {
    rank: 6,
    title: '泰坦尼克号',
    desc: '失去的才是永恒的',
    elmHeight: 0,
  },
  {
    rank: 7,
    title: '千与千寻',
    desc: '最好的宫崎骏，最好的久石让',
    elmHeight: 0,
  },
  {
    rank: 8,
    title: '辛德勒的名单',
    desc: '拯救一个人，就是拯救整个世界',
    elmHeight: 0,
  },
  {
    rank: 9,
    title: '盗梦空间',
    desc: '诺兰给了我们一场无法盗取的梦',
    elmHeight: 0,
  },
  {
    rank: 10,
    title: '忠犬八公的故事',
    desc: '永远都不能忘记你所爱的人',
    elmHeight: 0,
  },
]

// 列表渲染的数据数组
let data = [...originalData]

/**
 * 数组排序
 * @param {string} prop 排序方式
 */
function changeSort(prop) {
  sortBy = prop // 排序方式变更
  data.sort((a, b) => {
    if (a[prop] > b[prop]) return 1
    if (a[prop] < b[prop]) return -1
    return 0
  })
  render()
}

/**
 * 添加一条数据到列表头部
 */
function add() {
  // 在原始数据中随机取一条
  let n = originalData[Math.floor(Math.random() * 10)]
  // 将取到的数据插入到列表数组头部
  data = [
    { rank: nextKey++, title: n.title, desc: n.desc, elmHeight: 0 },
  ].concat(data)
  render()
  render()
}

/**
 * 根据电影名称删除对应电影
 * @param {string} moive 电影名
 */
function remove(moive) {
  data = data.filter(m => m !== moive)
  render()
}

/**
 * 列表行 渲染规则
 * @param {string} movie 电影名
 */
function movieView(movie) {
  return h(
    'li.row',
    {
      key: movie.rank,
      style: {
        opacity: '0',
        transform: 'translate(-200px)',
        delayed: {
          transform: `translateY(${movie.offset}px)`,
          opacity: '1',
        },
        remove: {
          opacity: '0',
          transform: `translateY(${movie.offset}px) translateX(200px)`,
        },
      },
      hook: {
        insert: vnode => {
          movie.elmHeight = vnode.elm.offsetHeight
        },
      },
    },
    [
      h('div', { style: { fontWeight: 'bold' } }, movie.rank),
      h('div', movie.title),
      h('div', { style: { color: '#666' } }, movie.desc),
      h(
        'div.btn.rm-btn',
        {
          on: {
            click: [remove, movie],
          },
        },
        'x'
      ),
    ]
  )
}

/**
 * 列表的整体渲染规则
 */
function render() {
  data = data.reduce((acc, m) => {
    let last = acc[acc.length - 1]
    m.offset = last ? last.offset + last.elmHeight + margin : margin
    return acc.concat(m)
  }, [])
  const { offset, elmHeight } = data[data.length - 1]
  totalHeight = offset + elmHeight
  vnode = patch(vnode, view(data))
}

/**
 * 页面整体的布局和内容
 * @param {object[]} data 列表数据
 */
function view(data) {
  return h('div#container', [
    h('h1', '豆瓣电影 Top 10'),
    h('div', [
      h(
        'a.btn.add',
        {
          on: {
            click: add,
          },
        },
        'Add'
      ),
      '排序：',
      h('span.btn-group', [
        h(
          'a.btn.rank',
          {
            class: { active: sortBy === 'rank' },
            on: { click: [changeSort, 'rank'] },
          },
          '排行'
        ),
        h(
          'a.btn.title',
          {
            class: { active: sortBy === 'title' },
            on: { click: [changeSort, 'title'] },
          },
          '标题'
        ),
        h(
          'a.btn.desc',
          {
            class: { active: sortBy === 'desc' },
            on: { click: [changeSort, 'desc'] },
          },
          '描述'
        ),
      ]),
    ]),
    h(
      'ul.list',
      { style: { height: totalHeight + 'px' } },
      data.map(movieView)
    ),
  ])
}

// 当初始的 HTML 文档被完全加载和解析完成之后，DOMContentLoaded 事件被触发，而无需等待样式表、图像和子框架的完全加载。
window.addEventListener('DOMContentLoaded', () => {
  let container = document.querySelector('#container')
  vnode = patch(container, view(data))
  render()
})
