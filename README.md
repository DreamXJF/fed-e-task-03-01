# fed-e-task-03-01
一、简答题
1、当我们点击按钮的时候动态给 data 增加的成员是否是响应式数据，如果不是的话，如果把新增成员设置成响应式数据，它的内部原理是什么。
let vm = new Vue({
 el: '#el'
 data: {
  o: 'object',
  dog: {}
 },
 method: {
  clickHandler () {
   // 该 name 属性是否是响应式的
   this.dog.name = 'Trump'
  }
 }
})

答：不是响应式的
解决：
    1)、通过data定义的时候给定义属性name
        data:{
            dog:{
                name:''
            }
        }
       原理： vue的Observer方法里面对data做了递归的响应式处理。

    2)、通过Vue.set()方法实现
        handleClick () {
            this.$set(this.dog, 'name', 'xxxx')
            setTimeout(() => {
                this.dog.name = 'oo444ooo'
            }, 2000)
        }
        原理：vue源码里面set方法通过调用defineReactive$$1方法给这个属性变成响应式的，并通过dep.notify()方法通知依赖更新。
     
     3)、通过Object.assign()
        handleClick () {
            this.dog.name = 'xxxxx'
            this.dog = Object.assign({}, this.dog)
            setTimeout(() => {
                this.dog.name = 'oo444ooo'
            }, 2000)
        }                                
        原理：通过Object.assign() 复制增加属性后的对象，重新赋值了对象的引用，使得对象变成响应式了。方式一的处理方法原理类似。





2、请简述 Diff 算法的执行过程
答：diff算法是通过同层的树节点进行比较。

1、老节点不存在，直接添加新节点到父元素
2、新节点不存，从父元素删除老节点。
3、新老节点都存在
    3.1 判断是否是相同节点（根据key、tag、isComment、data同时定义或不定义）
        -相同直接返回
        -不是相同节点
            -如果新老节点都是静态的，且key相同。从老节点拿过来，跳过比对的过程。
            -如果新节点是文本节点，设置节点的text
            -新节点不是文本节点
                -新老节点子节点都存在且不同，使用updateChildren函数来更新子节点
                -只有新节点字节点存在，如果老节点子节点是文本节点，删除老节点的文本，将新节点子节点插入
                -只有老节点存在子节点，删除老节点的子节点
    3.2 updateChildren
        -给新老节点定义开始、结束索引
        -循环比对新节点开始VS老节点开始、新节点结束VS老节点结束、新节点开始VS老节点结束、新节点结束VS老节点开始并移动对应的索引，向中间靠拢
        -根据新节点的key在老节点中查找，没有找到则创建新节点。
        循环结束后，如果老节点有多的，则删除。如果新节点有多的，则添加。

