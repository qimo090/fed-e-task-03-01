class Observer {
  constructor (data) {
    this.walk(data)
  }
  walk (data) {
    // 1.判断data是否是对象
    if (!data || typeof data !== 'object') return
    // 2.遍历data对象的所有属性
    Object.keys(data).forEach(key => {
      this.defineReactive(data, key, data[key])
    })
  }
  // 数据响应式
  defineReactive (data, key, val) {
    // 创建依赖容器，负责收集依赖，并发送通知
    let dep = new Dep()
    // 递归进行data中的数据响应化
    this.walk(val)
    Object.defineProperty(data, key, {
      enumerable: true,
      configurable: true,
      get: () => {
        // 收集依赖
        Dep.target && dep.addSub(Dep.target)
        return val
      },
      set: (newValue) => {
        if (newValue === val) return
        val = newValue
        // 通知，给新赋值的数据进行响应式处理，比如 msg: 'msg' => msg: { title: 'msg' }
        this.walk(newValue)
        // 发送通知
        dep.notify()
      }
    })
  }
}
