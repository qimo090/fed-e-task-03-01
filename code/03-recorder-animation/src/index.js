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

var vnode

var nextKey = 11
var margin = 8
var sortBy = 'rank'
var totalHeight = 0
var originalData = [
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
var data = [
  originalData[0],
  originalData[1],
  originalData[2],
  originalData[3],
  originalData[4],
  originalData[5],
  originalData[6],
  originalData[7],
  originalData[8],
  originalData[9],
]

function changeSort(prop) {
  sortBy = prop
  data.sort((a, b) => {
    if (a[prop] > b[prop]) {
      return 1
    }
    if (a[prop] < b[prop]) {
      return -1
    }
    return 0
  })
  render()
}

function add() {
  var n = originalData[Math.floor(Math.random() * 10)]
  data = [
    { rank: nextKey++, title: n.title, desc: n.desc, elmHeight: 0 },
  ].concat(data)
  render()
  render()
}

function remove(movie) {
  data = data.filter(m => {
    return m !== movie
  })
  render()
}

function movieView(movie) {
  return h(
    'div.row',
    {
      key: movie.rank,
      style: {
        opacity: '0',
        transform: 'translate(-200px)',
        delayed: { transform: `translateY(${movie.offset}px)`, opacity: '1' },
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
      h('div', movie.desc),
      h('div.btn.rm-btn', { on: { click: [remove, movie] } }, 'x'),
    ]
  )
}

function render() {
  data = data.reduce((acc, m) => {
    var last = acc[acc.length - 1]
    m.offset = last ? last.offset + last.elmHeight + margin : margin
    return acc.concat(m)
  }, [])
  totalHeight = data[data.length - 1].offset + data[data.length - 1].elmHeight
  vnode = patch(vnode, view(data))
}

function view(data) {
  return h('div#container', [
    h('h1', 'Top 10 movies'),
    h('div', [
      h('a.btn.add', { on: { click: add } }, 'Add'),
      'Sort by: ',
      h('span.btn-group', [
        h(
          'a.btn.rank',
          {
            class: { active: sortBy === 'rank' },
            on: { click: [changeSort, 'rank'] },
          },
          'Rank'
        ),
        h(
          'a.btn.title',
          {
            class: { active: sortBy === 'title' },
            on: { click: [changeSort, 'title'] },
          },
          'Title'
        ),
        h(
          'a.btn.desc',
          {
            class: { active: sortBy === 'desc' },
            on: { click: [changeSort, 'desc'] },
          },
          'Description'
        ),
      ]),
    ]),
    h(
      'div.list',
      { style: { height: totalHeight + 'px' } },
      data.map(movieView)
    ),
  ])
}

window.addEventListener('DOMContentLoaded', () => {
  var container = document.getElementById('container')
  vnode = patch(container, view(data))
  render()
})
