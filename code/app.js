//二、编程题

/**
 * 1、模拟 VueRouter 的 hash 模式的实现，实现思路和 History 模式类似，
 * 把 URL 中的 # 后面的内容作为路由的地址，可以通过 hashchange 事件监听
 * 路由地址的变化。
 */
clickHandle (e) {
    location.hash = this.to
    this.$router.data.current = this.to
    e.preventDefault()
}
initEvent () {
    window.addEventListener('hashchange', () => {
        this.data.current = location.hash.slice(1)
    })
}

// hash完整版实现
let _Vue = null
export default class VueRouter {
  constructor (options) {
    this.options = options
    this.routerMap = {}
    this.data = _Vue.observable({
      current: '/'
    })
  }

  static install (Vue) {
    if (VueRouter.install.installed) return
    VueRouter.install.installed = true
    _Vue = Vue
    _Vue.mixin({
      beforeCreate () {
        if (this.$options.router) {
          _Vue.prototype.$router = this.$options.router
          this.$options.router.init()
        }
      }
    })
  }

  init () {
    this.createRouteMap()
    this.initComponents(_Vue)
    this.initEvent()
  }

  createRouteMap () {
    this.options.routes.forEach(route => {
      this.routerMap[route.path] = route.component
    })
  }

  initComponents (Vue) {
    Vue.component('router-link', {
      props: {
        to: String
      },
      render (h) {
        return h('a', {
          attrs: {
            href: this.to
          },
          on: {
            click: this.clickHandle
          }
        }, [this.$slots.default])
      },
      methods: {
        clickHandle (e) {
          location.hash = this.to
          this.$router.data.current = this.to
          e.preventDefault()
        }
      }
    })
    const _this = this
    Vue.component('router-view', {
      render (h) {
        const component = _this.routerMap[_this.data.current]
        return h(component)
      }
    })
  }

  initEvent () {
    window.addEventListener('hashchange', () => {
      this.data.current = location.hash.slice(1)
    })
  }
}

/**
 * 2、在模拟 Vue.js 响应式源码的基础上实现 v-html 指令，以及 v-on 指令
 */
//v-html 实现
htmlUpdater(node,value,key){
    node.innerHTML = value;
    new Watcher(this.vm, key, (newValue)=>{
        node.innerHTML = newValue
    })
}

//v-on 指令
// 处理节点的时候对属性做一下判断 含有’:'认为是v-on:click这种
// 然后取出事件类型、事件名称
// 通过addEventListener在node节点上做事件监听
// 根据事件名称在vm里面的$options.methods里找到方法执行
compileElement(node){
    // 遍历属性节点
    Array.from(node.attributes).forEach(attr=>{
        let attrName = attr.name;
        if(this.isDirective(attrName)){
            attrName = attrName.substr(2)
            let key = attr.value;
            if (attrName.indexOf(':')!==-1) {
                let eventType = attrName.split(':')[1]
                this.handleEvent(this,node,eventType,key)
            }
            this.update(node, key, attrName)
        }
    })
}
 handleEvent(vm,node,eventType,eventName){
    node.addEventListener(eventType,()=>{
        vm.vm.$options.methods[eventName]()
    })
}

/**
 * 3、参考 Snabbdom 提供的电影列表的示例，实现类似的效果。
 */
import { h, init } from 'snabbdom'
import style from 'snabbdom/modules/style'
import eventlisteners from 'snabbdom/modules/eventlisteners'
import { originalData } from './originData'

let patch = init([style,eventlisteners])

let data = [...originalData]
const container = document.querySelector('#container')

var sortBy = 'rank';
let vnode = view(data);

// 初次渲染
let oldVnode = patch(container, vnode)


// 渲染
function render() {
    oldVnode = patch(oldVnode, view(data));
}
// 生成新的VDOM
function view(data) {
    return h('div#container',
        [
            h('h1', 'Top 10 movies'),
            h('div',
                [
                    h('a.btn.add',
                        { on: { click: add } }, 'Add'),
                    'Sort by: ',
                    h('span.btn-group',
                        [
                            h('a.btn.rank',
                                {
                                    'class': { active: sortBy === 'rank' },
                                    on: { click: [changeSort, 'rank'] }
                                }, 'Rank'),
                            h('a.btn.title',
                                {
                                    'class': { active: sortBy === 'title' },
                                    on: { click: [changeSort, 'title'] }
                                }, 'Title'),
                            h('a.btn.desc',
                                {
                                    'class': { active: sortBy === 'desc' },
                                    on: { click: [changeSort, 'desc'] }
                                }, 'Description')
                        ])
                ]),
            h('div.list', data.map(movieView))
        ]);
}

// 添加一条数据 放在最上面
function add() {
    const n = originalData[Math.floor(Math.random() * 10)];
    data = [{ rank: data.length+1, title: n.title, desc: n.desc, elmHeight: 0 }].concat(data);
    render();
}
// 排序
function changeSort(prop) {
    sortBy = prop;
    data.sort(function (a, b) {
        if (a[prop] > b[prop]) {
            return 1;
        }
        if (a[prop] < b[prop]) {
            return -1;
        }
        return 0;
    });
    render();
}

// 单条数据
function movieView(movie) {
    return h('div.row', {
        key: movie.rank,
        style: {
            display: 'none', 
            delayed: { transform: 'translateY(' + movie.offset + 'px)', display: 'block' },
            remove: { display: 'none', transform: 'translateY(' + movie.offset + 'px) translateX(200px)' }
        },
        hook: {
            insert: function insert(vnode) {
                movie.elmHeight = vnode.elm.offsetHeight;
            }
        }
    }, [
        h('div', { style: { fontWeight: 'bold' } }, movie.rank),
        h('div', movie.title), h('div', movie.desc),
        h('div.btn.rm-btn', {on: { click: [remove, movie]}}, 'x')]);
}
// 删除数据
function remove(movie) {
    data = data.filter(function (m) {
        return m !== movie;
    });
    render()
}