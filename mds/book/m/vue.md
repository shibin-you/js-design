# 实现一个简单的vue
以下仅仅实现了vue里非常简单的功能
```javascript
function Vue(options) {
  let vm = this
  vm._data = options.data
  vm.$el = options.el && query(options.el)
  initData(vm)
  // initMethods()
  this.methods = options.methods
  observe(vm._data)
  new Compile(vm)
}
new Vue({
  el:"#app",
  data:{
    name:'shibin'
  }
})
```
### 第一步：initData

将options的data数据挂载到实例的对象上
```javascript
function initData(vm) {
  const sharedPropertyDefinition = {
    enumerable: true,
    configurable: true
  }
  Object.keys(vm._data).forEach(function(key) {
    proxy(vm, '_data', key)
  })

  function proxy(target, sourcekey, key) {
    sharedPropertyDefinition.get = function() {
      return target[sourcekey][key]
    }
    sharedPropertyDefinition.set = function(val) {
      target[sourcekey][key] = val
    }
    Object.defineProperty(target, key, sharedPropertyDefinition)
  }
}
```
### 第二步：observe
Observer中的defineReactive方法中，获取vm实例的data时，当Dep.target存在时，就会把Dep.target添加到观察者列表中，Dep.target就是Watcher的实例，
当data数据发生改变时，通知观察列表进行数据更新
```javascript
//监听数据的改变
function observe(data) {
  if (typeof data !== 'object') {
    return
  }
  return new Observer(data)
}


function Observer(data) {
  this.data = data
  this.walk()
}
Observer.prototype = {
  walk() {
    Object.keys(this.data).forEach(key => {
      this.defineReactive(this.data, key)
    })
  },
  defineReactive(data, key) {
    var dep = new Dep()
    var val = data[key]
    var childObj = observe(val)
    Object.defineProperty(data, key, {
      enumerable: true,
      configurable: true,
      get() {
        if (Dep.target) {
          dep.addSub(Dep.target) //添加到观察者列表
        }
        return val
      },
      set(newVal) {
        if (newVal === val) {
          return
        }
        val = newVal
        // 数据发生改变时，通知所有的观察者列表
        dep.notify()
      }
    })
  }
}

function Dep() {
  this.subs = []//观察者列表
}
Dep.prototype = {
  // 添加观察者列表
  addSub(sub) {
    this.subs.push(sub);
  },
  // 通知观察者列表
  notify() {
    this.subs.forEach(sub => {
      sub.update()
    })
  }
}

```
当实例化Watcher时，会执行Watcher下的get方法，此时便会将实例化的对象赋值给Dep.target,然后强制执行Observer里的get函数,将当前的观察对象添加到观察者列表中

调用实例化的Watcher对象中的update方法，会执行实例化Watcher对象时传入的回调函数，这个回调函数就是更新页面显示用的。这样就实现了数据改变，页面相应的元素自动改变
```javascript
function Watcher(vm, exp, cb) {
  this.vm = vm
  this.exp = exp
  this.cb = cb
  this.value = this.get()
}
Watcher.prototype = {
  update() {
    var value = this.vm._data[this.exp]
    var oldVal = this.value
    if (value !== oldVal) {
      this.value = value
      this.cb.call(this.vm, value, oldVal)
    }
  },
  get() {
    Dep.target = this
     //强制执行Observer里的get函数,将当前的观察对象添加到观察者列表中
    var value = this.vm._data[this.exp]
    Dep.target = null
    return value
  }
}
```
### 第三步：compile
编译过程中
* 1、创建一个空的fragment，将模板元素添加到fragement上
* 2、将fragement的上的元素进行编译
* 3、将fragement添加到页面上

当执行Compile实例下compileText执行时，就会实例化Watcher,这样就实现了当vm下的数据发生改变时，就会执行传入的回调函数
```javascript
function Compile(vm) {
  this.vm = vm
  this.el = vm.$el
  this.fragment = null
  this.init()
}
Compile.prototype = {
  init() {
    if (this.el) {
      //
      this.fragment = this.nodeToFragment(this.el)
      this.compileElement(this.fragment)
      this.el.appendChild(this.fragment);
    }
  },
  nodeToFragment(el) {
    // 创建一个空的fragment，将模板元素添加到fragement上
    var fragment = document.createDocumentFragment()
    var child = el.firstChild

    while (child) {
      fragment.appendChild(child)
      child = el.firstChild;
    }
    return fragment

  },
  compileElement(el) {
    var childNodes = el.childNodes;
    var self = this;

    [].slice.call(childNodes).forEach(function(node) {
      var reg = /\{\{(.*)\}\}/;
      var text = node.textContent
      if (self.isElementNode(node)) {
        self.compile(node)
      } else if (self.isTextNode(node) && reg.test(text)) {
        self.compileText(node, reg.exec(text)[1])
      }
      if (node.childNodes && node.childNodes.length) {
        self.compileElement(node);
      }
    })
  },
  compile(node) {
    var nodeAttrs = node.attributes;
    // var self = this;
    Array.prototype.forEach.call(nodeAttrs, attr => {
      var attrName = attr.name;

      if (this.isDirective(attrName)) {
        var exp = attr.value;
        var dir = attrName.substring(2)
        if (this.isEventDirective(attrName)) {
          // 编译事件
          this.compileEvent(node, this.vm, exp, dir);
        } else if (this.isVmodel(attrName)) { // v-model 指令
          this.compileModel(node, this.vm, exp, dir);
        }
      }
    })
  },
  compileText(node, exp) {
    var self = this
    this.updateText(node, this.vm[exp])
    new Watcher(this.vm, exp, function(value) {
      self.updateText(node, value)
    })
  },
  compileEvent(node, vm, exp, dir) {
    var eventType = dir.split(':')[1];
    var cb = vm.methods && vm.methods[exp];

    if (eventType && cb) {
      node.addEventListener(eventType, cb.bind(vm), false);
    }
  },
  compileModel(node, vm, exp, dir) {
    var val = vm[exp]
    var types = dir.split('.').slice(1)
    this.updateModel(node, val)
    new Watcher(this.vm, exp, val => {
      this.updateModel(node, val)
    })
    node.addEventListener('input', e => {
      var newVal = e.target.value
      if (val === newVal) {
        return
      }
      if (types.length ) {
        if (types.indexOf("number")>-1) {
          newVal = Number(newVal)
        }
        if (types.indexOf("trim")>-1) {
          newVal = newVal.trim()
        }
      }

      this.vm[exp] = newVal
      val = newVal
    })
  },
  updateModel(node, val) {
    node.value = val ? val : ''
  },
  isTextNode(node) {
    return node.nodeType === 3
  },
  isElementNode(node) {
    return node.nodeType == 1;
  },
  updateText(node, value) {
    node.textContent = typeof value === 'undefined' ? '' : value;
  },
  isDirective(attr) {
    return attr.indexOf('v-') == 0;
  },
  isEventDirective(str) {
    return str.indexOf('on:') > -1
  },
  isVmodel(str) {
    return str.indexOf('model') > -1
  }
}
```
