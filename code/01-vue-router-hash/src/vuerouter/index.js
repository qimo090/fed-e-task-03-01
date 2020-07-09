let _Vue = null

export default class VueRouter {
  constructor (options) {
    this.options = options
    this.routeMap = {}
    this.data = _Vue.observable({
      // 当前路由
      current: this.getHash() || '/',
    })
  }

  init () {
    this.createRouteMap()
    this.initComponents(_Vue)
    this.initEvent()
  }

  // 遍历所有路由规则，把路由规则解析成键值对的形式，存储到 routeMap 中
  createRouteMap () {
    this.options.routes.forEach(route => {
      this.routeMap[route.path] = route.component
    })
  }

  // 创建两个组件 <router-link /> 和 <router-view />
  initComponents (Vue) {
    Vue.component('router-link', {
      props: {
        to: String,
      },
      render (h) {
        return h('a', {
          attrs: {
            href: '#' + this.to,
          },
          on: {
            click: this.clickHandler,
          },
        }, [this.$slots.default])
      },
      methods: {
        clickHandler (e) {
          const href = window.location.href
          const index = href.indexOf('#')
          const base = href.slice(0, index)
          // 修改地址栏 和 history，多次点击同一路由不加入 history 栈
          if (href.slice(index + 1) !== this.to) {
            window.history.pushState(null, '', base + '#' + this.to)
          }
          // 修改页面视图
          this.$router.data.current = this.to
          // 阻止 a 标签的默认事件
          e.preventDefault()
        },
      },
    })
    Vue.component('router-view', {
      render: (h) => {
        const component = this.routeMap[this.data.current]
        return h(component)
      },
    })
  }

  // 监听 hashchange 事件
  initEvent () {
    window.addEventListener('hashchange', () => {
      this.data.current = this.getHash()
    })
  }

  // 获取 hash 值，如http://localhost:8080/#/about => /about
  getHash () {
    let href = window.location.href
    const index = href.indexOf('#')
    href = href.slice(index + 1)
    return href
  }

  static install (Vue) {
    // 1.判断当前插件是否已经被安装
    if (VueRouter.install.installed) return
    VueRouter.install.installed = true
    // 2.把 Vue 构造函数记录到全局变量
    _Vue = Vue
    // 3. 把创建 Vue 实例时候传入的 router 对象注入到 Vue 实例上
    // 混入
    _Vue.mixin({
      beforeCreate () {
        if (this.$options.router) {
          _Vue.prototype.$router = this.$options.router
          this.$options.router.init()
        }
      },
    })
  }
}
