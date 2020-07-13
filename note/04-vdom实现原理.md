# 任务四：Virtual DOM 的实现原理

## 课程目标

- 了解什么是虚拟 DOM，以及虚拟 DOM 的作用
- Snabbdom 的基本使用
- Snabbdom 的源码解析

## 虚拟 DOM

### 什么是 Virtual DOM ?

- Virtual DOM 是由普通的 JS 对象来描述 DOM 对象，因为不是真实的 DOM 对象，所以叫 Virtual DOM
- 真实 DOM 成员示例

  ```javascript
  let element = document.querySelector('#app')
  let s = ''
  for (let key in element) {
    s += key + ','
  }
  // 打印结果
  ;('align,title,lang,translate,dir,hidden,accessKey,draggable,spellcheck,autocapitalize,contentEditable,isContentEditable,inputMode,offsetParent,offsetTop,offsetLeft,offsetWidth,offsetHeight,style,innerText,outerText,oncopy,oncut,onpaste,onabort,onblur,oncancel,oncanplay,oncanplaythrough,onchange,onclick,onclose,oncontextmenu,oncuechange,ondblclick,ondrag,ondragend,ondragenter,ondragleave,ondragover,ondragstart,ondrop,ondurationchange,onemptied,onended,onerror,onfocus,onformdata,oninput,oninvalid,onkeydown,onkeypress,onkeyup,onload,onloadeddata,onloadedmetadata,onloadstart,onmousedown,onmouseenter,onmouseleave,onmousemove,onmouseout,onmouseover,onmouseup,onmousewheel,onpause,onplay,onplaying,onprogress,onratechange,onreset,onresize,onscroll,onseeked,onseeking,onselect,onstalled,onsubmit,onsuspend,ontimeupdate,ontoggle,onvolumechange,onwaiting,onwebkitanimationend,onwebkitanimationiteration,onwebkitanimationstart,onwebkittransitionend,onwheel,onauxclick,ongotpointercapture,onlostpointercapture,onpointerdown,onpointermove,onpointerup,onpointercancel,onpointerover,onpointerout,onpointerenter,onpointerleave,onselectstart,onselectionchange,onanimationend,onanimationiteration,onanimationstart,ontransitionend,dataset,nonce,autofocus,tabIndex,click,attachInternals,focus,blur,enterKeyHint,onpointerrawupdate,namespaceURI,prefix,localName,tagName,id,className,classList,slot,attributes,shadowRoot,part,assignedSlot,innerHTML,outerHTML,scrollTop,scrollLeft,scrollWidth,scrollHeight,clientTop,clientLeft,clientWidth,clientHeight,attributeStyleMap,onbeforecopy,onbeforecut,onbeforepaste,onsearch,elementTiming,previousElementSibling,nextElementSibling,children,firstElementChild,lastElementChild,childElementCount,onfullscreenchange,onfullscreenerror,onwebkitfullscreenchange,onwebkitfullscreenerror,hasAttributes,getAttributeNames,getAttribute,getAttributeNS,setAttribute,setAttributeNS,removeAttribute,removeAttributeNS,toggleAttribute,hasAttribute,hasAttributeNS,getAttributeNode,getAttributeNodeNS,setAttributeNode,setAttributeNodeNS,removeAttributeNode,attachShadow,closest,matches,webkitMatchesSelector,getElementsByTagName,getElementsByTagNameNS,getElementsByClassName,insertAdjacentElement,insertAdjacentText,setPointerCapture,releasePointerCapture,hasPointerCapture,insertAdjacentHTML,requestPointerLock,getClientRects,getBoundingClientRect,scrollIntoView,scroll,scrollTo,scrollBy,scrollIntoViewIfNeeded,animate,computedStyleMap,before,after,replaceWith,remove,prepend,append,querySelector,querySelectorAll,requestFullscreen,webkitRequestFullScreen,webkitRequestFullscreen,onbeforexrselect,ariaAtomic,ariaAutoComplete,ariaBusy,ariaChecked,ariaColCount,ariaColIndex,ariaColSpan,ariaCurrent,ariaDisabled,ariaExpanded,ariaHasPopup,ariaHidden,ariaKeyShortcuts,ariaLabel,ariaLevel,ariaLive,ariaModal,ariaMultiLine,ariaMultiSelectable,ariaOrientation,ariaPlaceholder,ariaPosInSet,ariaPressed,ariaReadOnly,ariaRelevant,ariaRequired,ariaRoleDescription,ariaRowCount,ariaRowIndex,ariaRowSpan,ariaSelected,ariaSort,ariaValueMax,ariaValueMin,ariaValueNow,ariaValueText,ariaDescription,ELEMENT_NODE,ATTRIBUTE_NODE,TEXT_NODE,CDATA_SECTION_NODE,ENTITY_REFERENCE_NODE,ENTITY_NODE,PROCESSING_INSTRUCTION_NODE,COMMENT_NODE,DOCUMENT_NODE,DOCUMENT_TYPE_NODE,DOCUMENT_FRAGMENT_NODE,NOTATION_NODE,DOCUMENT_POSITION_DISCONNECTED,DOCUMENT_POSITION_PRECEDING,DOCUMENT_POSITION_FOLLOWING,DOCUMENT_POSITION_CONTAINS,DOCUMENT_POSITION_CONTAINED_BY,DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC,nodeType,nodeName,baseURI,isConnected,ownerDocument,parentNode,parentElement,childNodes,firstChild,lastChild,previousSibling,nextSibling,nodeValue,textContent,hasChildNodes,getRootNode,normalize,cloneNode,isEqualNode,isSameNode,compareDocumentPosition,contains,lookupPrefix,lookupNamespaceURI,isDefaultNamespace,insertBefore,appendChild,replaceChild,removeChild,addEventListener,removeEventListener,dispatchEvent,')
  ```

- 可以使用 Virtual DOM 来描述真实 DOM，示例

  ```javascript
  vdom = {
    sel: 'div',
    data: {},
    children: undefined,
    text: 'Hello Virtual DOM',
    elm: undefined,
    key: undefined,
  }
  ```

### 为什么使用 Virtual DOM ?

- 手动操作 DOM 比较麻烦，还需要考虑浏览器兼容问题，虽然有 jQuery 等库简化 DOM 操作，但是随着项目的复杂，DOM 操作复杂提升
- 为了简化 DOM 的复杂操作于是出现了各种 MVVM 框架，MVVM 框架解决了视图和状态的同步问题
- 为了简化视图的操作我们可以使用模板引擎，但是模板引擎没有解决跟踪状态变化的问题，于是 Virtual DOM 出现了
- Virtual DOM 的好处是当状态改变时不需要立即更新 DOM，只需要创建一个虚拟 DOM 树来描述 DOM，Virtual DOM 内部将弄清楚如何高效（Diff）的更新 DOM
- 参考 GitHub 上 [virtual-dom](https://github.com/Matt-Esch/virtual-dom) 的描述
  - 虚拟 DOM 可以维护程序的状态，跟踪上一次的状态
  - 通过比较前后两次状态的差异更新真实 DOM

### 使用 DOM 的作用

- 维护视图和状态的关系
- 复杂视图情况下提升渲染性能
- 除了渲染 DOM 之外，还可以实现 SSR(Nuxt.js/Next.js)，原生应用(Weex/React Native)，小程序(mpvue/uni-app)等

### Virtual DOM 库

- [Snabbdom](https://github.com/snabbdom/snabbdom)
  - Vue 2.x 内部使用的 Virtual DOM 就是改造的 Snabbdom
  - 大约 200 SLOC(Single Line of Code)
  - 可以通过模块扩展
  - 源码使用 TypeScript 开发
  - 最快的 Virtual DOM 之一
- [virtual-dom](https://github.com/Matt-Esch/virtual-dom)

## Snabbdom

> 以下例子 snabbdom 版本为 0.7.0

### 创建项目

- 打包工具为了方便使用 [Parcel](https://parceljs.org/)
- 创建项目，并安装 Parcel

  ```shell
  # 创建项目目录
  mkdir snabbdom-demo
  # 进入项目目录
  cd snabbdom-demo
  # 创建 package.json
  yarn init -y
  # 本地安装 parcel
  yarn add parcel-bundler
  ```

- 配置 package.json 和 scripts

  ```json
  {
    "scripts": {
      "dev": "parcel index.html --open",
      "build": "parcel build index.html"
    }
  }
  ```

* 创建项目结构

  ```text
  src
    01-basicusage.js
  index.html
  package.json
  ```

### 导入 Snabbdom

- 看文档的意义
  - 学习任何一个库都要先看文档
  - 通过文档了解库的作用
  - 看文档提供的示例，自己快速实现一个 demo
  - 通过文档查看 API 的使用
- 文档地址
  - https://github.com/snabbdom/snabbdom
  - [中文文档](https://github.com/coconilu/Blog/issues/152)

**安装 Snabbdom**

```shell script
yarn add snabbdom@0.7.0
```

**导入 Snabbdom**

- Snabbdom 的官网 demo 中导入使用的是 common.js 模块化规范，我们使用更流行的 ESM 模块化语法 `import`
- 关于模块化的语法青参考阮一峰老师的 [Module 的语法](https://es6.ruanyifeng.com/#docs/module)
- ES6 模块与 CommonJS 模块的差异

  ```javascript
  import { init, h, thunk } from 'snabbdom'
  ```

- Snabbdom 的核心仅提供了最基本的功能，只导出了三个函数 `init, h, thunk`

  - `init` 是一个高阶函数，返回 `patch`
  - `h` 返回虚拟节点 VNode，这个函数在 Vue.js 2.x 中见过

    ```javascript
    new Vue({
      router,
      store,
      render: h => h(App),
    }).$mount('#app')
    ```

  - `thunk` 是一个优化策略，可以在处理不可变数据时使用

- **注意** 导入时候不能使用 `import snabbdom from 'snabbdom'`
  - 原因：`node_modules/snabbdom.ts` 末尾导出使用的是 `export` 导出 API，没有使用 `export default` 进行默认导出

### Snabbdom 模块

Snabbdom 的核心库并不能处理元素的属性/样式/事件等，如果需要处理的话，可以使用模块

**常用模块**

- 官方提供了 6 个模块
  - `attributes`
    - 设置 DOM 元素的属性，使用 `setAttributes()`
    - 处理布尔类型的属性
  - `props`
    - 和 `attributes` 模块类似，设置 DOM 元素的属性 `element[attr] = value`
    - 不处理布尔类型的属性
  - `class`
    - 切换类样式
    - 注意：给元素设置类名是通过 `sel` 选择器
  - `dataset`
    - 设置 `sata-*` 的自定义属性
  - `eventlisteners`
    - 注册和移除事件
  - `style`
    - 设置行内样式，支持动画
    - `delayed/remove/destroy`

**模块使用**

- 模块使用步骤

  - 导入需要的模块
  - `init()` 中注册模块
  - 使用 `init()` 函数创建 VNode 函数，可以把第二个参数设置为对象，其他参数往后移

  ```javascript
  import { init, h } from 'snabbdom'
  // 1. 导入模块
  import style from 'snabbdom/modules/style'
  import eventlisteners from 'snabbdom/modules/eventlisteners'
  // 2. 注册模块
  let patch = init([style, eventlisteners])
  // 3. 使用 h() 函数的第二个参数传入模块需要的数据
  let vnode = h(
    'div',
    {
      style: {
        backgroundColor: 'red',
      },
      on: {
        click: eventHandler,
      },
    },
    [h('h1', 'Hello Snabbdom'), h('p', '这是 p 标签')]
  )

  function eventHandler() {
    console.log('click !!!')
  }
  ```

### Snabbdom 源码解析

#### 如何学习源码

- 先宏观了解
- 带着目的看源码
- 看源码的过程要不求甚解
- 调试
- 参考资料

#### Snabbdom 的核心

- 使用 `h()` 函数创建 JavaScript 对象 (VNode) 描述真实 DOM
- `init()` 设置模块，创建 `patch()`
- `patch()` 比较新旧两个 VNode
- `patch()` 把变化的内容更新到真实 DOM 上

#### Snabbdom 源码

- [源码地址](https://github.com/snabbdom/snabbdom)
- src 目录结构

### h 函数

- `h()` 函数介绍

  - 在使用 Vue 的时候见过

    ```javascript
    new Vue({
      router,
      store,
      render: h => h(App),
    }).$mount('#app')
    ```

  - `h()` 函数最早见于 [hyperscript](https://github.com/hyperhype/hyperscript) ， 使用 JavaScript 创建超文本
  - Snabbdom 中的 `h()` 函数不是用来创建创建超文本，而是创建 VNode

- 函数重载

  - 概念
    - **参数个数** 或 **类型** 不同的函数
    - JavaScript 中没有重载的概念
    - TypeScript 中有重载，不过重载的实现还是通过代码调整参数
  - 重载的示例

    ```javascript
    function add(a, b) {
      console.log(a + b)
    }
    function add(a, b, c) {
      console.log(a + b + c)
    }
    add(1, 2)
    add(1, 2, 3)
    ```

- 源码位置：`src/h.ts`

  ```typescript
  import { vnode, VNode, VNodeData } from './vnode'
  import * as is from './is'

  function addNS(
    data: any,
    children: Array<VNode> | undefined,
    sel: string | undefined
  ): void {
    data.ns = 'http://www.w3.org/2000/svg'
    if (sel !== 'foreignObject' && children !== undefined) {
      for (let i = 0; i < children.length; ++i) {
        let childData = children[i].data
        if (childData !== undefined) {
          addNS(
            childData,
            (children[i] as VNode).children as Array<VNode>,
            children[i].sel
          )
        }
      }
    }
  }
  // h 函数的重载
  export function h(sel: string): VNode
  export function h(sel: string, data: VNodeData): VNode
  export function h(sel: string, text: string): VNode
  export function h(
    sel: string,
    children: Array<VNode | undefined | null>
  ): VNode
  export function h(sel: string, data: VNodeData, text: string): VNode
  export function h(
    sel: string,
    data: VNodeData,
    children: Array<VNode | undefined | null>
  ): VNode
  export function h(sel: any, b?: any, c?: any): VNode {
    var data: VNodeData = {},
      children: any,
      text: any,
      i: number
    // 处理参数，实现重载机制
    if (c !== undefined) {
      // 处理三个参数的情况
      // sel, data, children/text
      data = b
      if (is.array(c)) {
        children = c
      }
      // 如果 c 是字符串或数字
      else if (is.primitive(c)) {
        text = c
      }
      // 如果 c 是 VNode
      else if (c && c.sel) {
        children = [c]
      }
    } else if (b !== undefined) {
      // 处理两个参数的情况
      // 如果 b 是数组
      if (is.array(b)) {
        children = b
      }
      // 如果 b 是字符串或数字
      else if (is.primitive(b)) {
        text = b
      }
      // 如果 b 是 VNode
      else if (b && b.sel) {
        children = [b]
      } else {
        data = b
      }
    }
    if (is.array(children)) {
      // 处理 children 中的原始值（String/Number）
      for (i = 0; i < children.length; ++i) {
        // 如果 child 是 String/Number，创建文本节点
        if (is.primitive(children[i]))
          children[i] = (vnode as any)(
            undefined,
            undefined,
            undefined,
            children[i]
          )
      }
    }
    if (
      sel[0] === 's' &&
      sel[1] === 'v' &&
      sel[2] === 'g' &&
      (sel.length === 3 || sel[3] === '.' || sel[3] === '#')
    ) {
      // 如果是 svg，添加命名空间
      addNS(data, children, sel)
    }
    return vnode(sel, data, children, text, undefined)
  }
  // 导出模块
  export default h
  ```

### vnode

```typescript
import { Hooks } from './hooks'
import { AttachData } from './helpers/attachto'
import { VNodeStyle } from './modules/style'
import { On } from './modules/eventlisteners'
import { Attrs } from './modules/attributes'
import { Classes } from './modules/class'
import { Props } from './modules/props'
import { Dataset } from './modules/dataset'
import { Hero } from './modules/hero'

export type Key = string | number

export interface VNode {
  // 选择器
  sel: string | undefined
  // 节点数据：属性/样式/事件等
  data: VNodeData | undefined
  // 子节点：和 text 互斥
  children: Array<VNode | string> | undefined
  // 记录 vnode 对应的真实 DOM
  elm: Node | undefined
  // 节点中的内容，和 children 互斥
  text: string | undefined
  // 优化性能使用
  key: Key | undefined
}

export interface VNodeData {
  props?: Props
  attrs?: Attrs
  class?: Classes
  style?: VNodeStyle
  dataset?: Dataset
  on?: On
  hero?: Hero
  attachData?: AttachData
  hook?: Hooks
  key?: Key
  ns?: string // for SVGs
  fn?: () => VNode // for thunks
  args?: Array<any> // for thunks
  [key: string]: any // for any other 3rd party module
}

export function vnode(
  sel: string | undefined,
  data: any | undefined,
  children: Array<VNode | string> | undefined,
  text: string | undefined,
  elm: Element | Text | undefined
): VNode {
  let key = data === undefined ? undefined : data.key
  return {
    sel: sel,
    data: data,
    children: children,
    text: text,
    elm: elm,
    key: key,
  }
}

export default vnode
```

### patch 的整体过程

Snabbdom

- `patch(oldVnode, newVnode)`
- 打补丁，把新节点中变化的内容渲染到真实 DOM，最后返回新节点作为下一次处理的旧节点
- 对比新旧 VNode 是否是相同节点（节点的 `key` 和 `sel` 相同）
- 如果不是相同节点，删除之前的内容，重新渲染
- 如果是相同节点，再判断新的 VNode 是否有 `text` ，如果有并且和 `oldVnode` 的 `text` 不同，直接更新文本内容
- 如果新的 VNode 有 `children` ，判断子节点是否有变化，判断子节点的过程使用的就是 `diff` 算法
- `diff` 过程只进行同层级比较

  ![diff](https://tva1.sinaimg.cn/large/007S8ZIlly1ggngbw0ja9j30s20dg7ap.jpg)

### updateChildren

- 功能
  - diff 算法的核心，对比新旧节点的 children，更新 DOM
- 执行过程

  - 要对比两棵树的差异，取每一棵树的每一个节点依次和第二棵树的每一个节点比较，但是这样的时间复杂度为 O(n^3)
  - 在 DOM 操作的时候很少会把一个父节点移动/更新到某一个子节点
  - 因此只需要找 **同级别** 的子 **节点** 依次 **比较**，然后再找下一级别的节点比较，这样算法的时间复杂度为 O(n)

    ![diff](https://tva1.sinaimg.cn/large/007S8ZIlly1ggngbw0ja9j30s20dg7ap.jpg)

  - 在进行同级别节点比较的时候，首先会对老节点数组的开始和结尾节点设置标记索引，遍历的过程中移动索引
  - 在对 **开始和结束节点** 做比较的时候，总共有四种情况

    - oldStartVnode / newStartVnode (旧开始节点 / 新开始节点)
    - oldEndVnode / newEndVnode (旧结束节点 / 新结束节点)
    - oldStartVnode / oldEndVnode (旧开始节点 / 新结束节点)
    - oldEndVnode / newStartVnode (旧结束节点 / 新开始节点)

      ![statVnode-endVndoe](https://tva1.sinaimg.cn/large/007S8ZIlly1ggnwme2hixj30o00b4n0w.jpg)

  - 开始节点和结束节点比较，这两种情况类似
    - oldStartVnode / newStartVnode (旧开始节点 / 新开始节点)
    - oldEndVnode / newEndVnode (旧结束节点 / 新结束节点)
  - 如果 oldStartVnode 和 newStartVnode (key 和 sel 相同)

    - 调用 patchVnode() 对比和更新节点
    - 把旧开始和新开始索引向后移动 oldStartIdx++ / oldStartIdx++

      ![oldVnode-newVnode](https://tva1.sinaimg.cn/large/007S8ZIlly1ggngpitee0j30jk07wac6.jpg)

  - oldStartVnode / newEndVnode (旧开始节点 / 新结束节点) 相同

    - 调用 patchVnode() 对比和更新节点
    - 把 oldStartVnode 对应的 DOM 元素，移动到右边
    - 更新索引

      ![oldStart-newEnd](https://tva1.sinaimg.cn/large/007S8ZIlly1ggngryaoo8j30nw0ceq7j.jpg)

  - oldEndVnode / newStartVnode (旧结束节点 / 新开始节点) 相同

    - 调用 patchVnode() 对比和更新节点
    - 把 oldEndVnode() 对应的 DOM 元素，移动到左边
    - 更新索引

      ![oldEnd-newStart](https://tva1.sinaimg.cn/large/007S8ZIlly1ggngval0o7j30oy0bsq7b.jpg)

  - 如果不是以上四种情况

    - 遍历新节点，使用 newStartNode 的 key 在老节点数组中找相同节点
    - 如果没有找到，说明 newStartNode 是新节点
      - 创建新节点对应的 DOM 元素，插入到 DOM 树中
    - 如果找到了

      - 判断新节点和找到的老节点的 **sel** 选择器是否相同
      - 如果不相同，说明节点被修改了
        - 重新创建对应的 DOM 元素，插入到 DOM 树中
      - 如果相同，把 elmToMove 对应的 DOM 元素，移动到左边

        ![elm](https://tva1.sinaimg.cn/large/007S8ZIlly1ggnxk89b9hj30om0biwj9.jpg)

- 循环结束
  - 当老节点的所有子节点先遍历完 (oldStartIdx > oldEndIdx)，循环结束
  - 新节点的所有子节点先遍历完 (newStartIdx > newEndIdx)，循环结束
- 如果老节点的数组先遍历完 (oldStartIdx > oldEndIdx)，说明新节点有剩余，把剩余节点批量插入到右边

  ![old](https://tva1.sinaimg.cn/large/007S8ZIlly1ggnwhx2nilj30l00bqwib.jpg)

- 如果新节点的数组先遍历完 (newStartIdx > newEndIdx)，说明老节点有剩余，把剩余节点批量删除
  ![new-new](https://tva1.sinaimg.cn/large/007S8ZIlly1ggnwk1gc9zj30q60bcq7c.jpg)

- 源码位置：`src/snabbdom.ts`

## Modules 源码

- `patch()` -> `patchVnode()` -> `updateChildren()`
- Snabbdom 为了保证核心库的精简，把处理元素的属性、事件和样式等工作放置到模块中
- 模块可以按需引入
- 模块的使用可以查看 官方文档
- 模块实现的核心是基于 Hooks

### Hooks

- 预定义的钩子函数的名称
- 源码位置：`src/hooks.ts`

  ```typescript
  export interface Hooks {
    // patch 函数开始执行的时候触发
    pre?: PreHook
    // createElm 函数开始之前的时候触发
    // 在把 VNode 转换成真实 DOM 之前触发
    init?: InitHook
    // CreateElm 函数末尾调用
    // 创建完真实 DOM 后触发
    create?: CreateHook
    // patch 函数末尾调用
    // 真实 DOM 添加到 DOM 树中触发
    insert?: InsertHook
    // patchVnode 函数开头调用
    // 开始对比两个 VNode 的差异之前触发
    prepatch?: PrePatchHook
    // patchVnode 函数开头调用
    // 两个 VNode 对比过程中触发，比 prepatch 稍晚
    update?: UpdateHook
    // patchVnode 的最末尾调用
    // 两个 VNode 对比结束触发
    postpatch?: PostPatchHook
    // removeVnodes -> invokeDestroyHook 中调用
    // 在删除元素之前触发，子节点的 destroy 也被触发
    destroy?: DestroyHook
    // removeVnodes 中调用
    // 元素被删除的时候触发
    remove?: RemoveHook
    // patch 函数的最后调用
    post?: PostHook
  }
  ```
