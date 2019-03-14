# 实现一个简单的vue


开始前需要先了解[Object.defineProperty()](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty)这个方法

```Object.defineProperty() ``` 方法会直接在一个对象上定义一个新属性，或者修改一个对象的现有属性， 并返回这个对象。
::: tip Object.defineProperty(obj, prop, descriptor)
* obj要在其上定义属性的对象。
* prop
要定义或修改的属性的名称。
* descriptor
将被定义或修改的属性描述符
:::

其中属性描述符的可选键：
 * configurable
当且仅当该属性的 configurable 为 true 时，该属性描述符才能够被改变，同时该属性也能从对应的对象上被删除。默认为 false。
enumerable
当且仅当该属性的enumerable为true时，该属性才能够出现在对象的枚举属性中。默认为 false。
数据描述符同时具有以下可选键值：

 * value
该属性对应的值。可以是任何有效的 JavaScript 值（数值，对象，函数等）。默认为 undefined。
writable
当且仅当该属性的writable为true时，value才能被赋值运算符改变。默认为 false。
存取描述符同时具有以下可选键值：

 * get
一个给属性提供 getter 的方法，如果没有 getter 则为 undefined。当访问该属性时，该方法会被执行，方法执行时没有参数传入，但是会传入this对象（由于继承关系，这里的this并不一定是定义该属性的对象）。
默认为 undefined。
 * set
一个给属性提供 setter 的方法，如果没有 setter 则为 undefined。当属性值修改时，触发执行该方法。该方法将接受唯一参数，即该属性新的参数值。
默认为 undefined。
```js
var o = {}; // 创建一个新对象

// 在对象中添加一个属性与数据描述符的示例
Object.defineProperty(o, "a", {
  value : 37,
  writable : true,
  enumerable : true,
  configurable : true
});

// 对象o拥有了属性a，值为37
```
详细用法请到[MDN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty)上查看

## 开始
以下仅仅实现了vue里非常简单的功能
```javascript
function query(el) {
  if (typeof el === 'string') {
    const selected = document.querySelector(el)
    if (!selected) {
      return document.createElement('div')
    }
    return selected
  } else {
    return el
  }
}

function Vue(options) {
  let vm = this
  vm._data = options.data
  vm.$el = options.el && query(options.el)
  initData(vm)
  this.methods = options.methods
  observe(vm._data)
  new Compile(vm)
}
```

## 第一步：initData

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

## 第二步：observe

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

## 第三步：compile

编译过程中

-   1、创建一个空的fragment，将模板元素添加到fragement上
-   2、将fragement的上的元素进行编译
-   3、将fragement添加到页面上

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
     node.value = typeof val === 'undefined' ? '' : val
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

下面写段代码测试

```html
<div id="app">
  <input type="text" v-model='name'>
  <input type="text" v-model.number='number'>
  <div>{{name}}</div>
</div>
```

```javascript
var test = new Vue({
  el: "#app",
  data: {
    name: 'shibin',
    number: 123
  }
})
setTimeout(() => {
  test.name = 'Shibin'
}, 1000)
```
