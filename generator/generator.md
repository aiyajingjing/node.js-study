- 1.定义  
```javascript 
function* generator() {  
  yield 1;  
  yield 2;  
}  
var g = generator();  
g.next();  
```  
  (1) 每次调用next方法，内部指针就从函数头部或上一次停下来的地方开始执行，直到遇到下一个yield表达式（或return语句）为止  
    next会返回一个对象{ value: 1, done: false }  
  (2) return或者yiled个数+1次next时，done才是true  
  (3) next参数，只有传参数，才会把yiled表达式的值赋值给变量  

- 2.方法  
(1)throw()  
   错误处理；必须至少执行一次next，相当于启动  
   throw抛出的错误可被函数内部捕获，没有则被外部捕获  
   throw错误被捕获后，会自动执行一次next方法  
   可以把多个yiled放在一个try...catch中捕获异常  
(2)return()  
   给定返回值，中止遍历，可传参数  
   如果有try...finally,且正在执行try代码块，return方法会推迟到finally里代码执行完再执行  

- 3.yield*  
- 4.Thunk  
  回调函数作为单参数  
  在 JavaScript 语言中，Thunk 函数替换的不是表达式，而是多参数函数，将其替换成一个只接受回调函数作为参数的单参数函数.  
```javascript
  // 正常版本的readFile（多参数版本）
fs.readFile(fileName, callback);

// Thunk版本的readFile（单参数版本）
var Thunk = function (fileName) {
  return function (callback) {
    return fs.readFile(fileName, callback);
  };
};

var readFileThunk = Thunk(fileName);
readFileThunk(callback);

// ES6版本Thunk函数转换器
const Thunk = function(fn) {
  return function (...args) {
    return function (callback) {
      return fn.call(this, ...args, callback);
    }
  };
};
```  
- 5.自动流程管理  
(1)Thunk函数的generator执行器  
前提是yield后必须是Thunk函数,自动执行的关键是在回调函数中next往下执行,同理Promise对象也可以在then中next往下执行  
```javascript
function run(fn) {
  var g = fn();

  function next(err, data) {
    var result = g.next(data);

    if (result.done) return;

    result.value(next);
  }

  next();
}

function* g() {
  var result = yiled Thunk();
}

run(g)
```  

(2)co模块  
为什么 co 可以自动执行 Generator 函数

前面说过，Generator 就是一个异步操作的容器。它的自动执行需要一种机制，当异步操作有了结果，能够自动交回执行权。

两种方法可以做到这一点。

（1）回调函数。将异步操作包装成 Thunk 函数，在回调函数里面交回执行权。

（2）Promise 对象。将异步操作包装成 Promise 对象，用then方法交回执行权。  
co 模块其实就是将两种自动执行器（Thunk 函数和 Promise 对象），包装成一个模块。  
使用 co 的前提条件是，Generator 函数的yield命令后面，只能是 Thunk 函数或 Promise 对象。  
如果数组或对象的成员，全部都是 Promise 对象  

```javascript  
//基于Promise的自动执行器
function run(fn) {
  var g = fn();

  function next(data) {
    var result = g.next(data);

    if (result.done) return result.value;

    result.value.then(function(data) {
      next(data);
    });
  }

  next();
}
```  
https://github.com/tj/co/blob/master/index.js  
https://zhuanlan.zhihu.com/p/60742489