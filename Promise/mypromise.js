function Promise(executor) {
  let _this = this;

  _this.status = 'pending';
  _this.value = undefined;
  _this.reason = undefined;
  _this.onResolvedCallbacks = [];
  _this.onRejectedCallbacks = [];

  function resolve(value) {
    if (_this.status === 'pending') {
      _this.status = 'resolved';
      _this.value = value;
      _this.onResolvedCallbacks.forEach(function (fn) {    //解决异步的问题
        fn();
      });
    }
  }

  function reject(reason) {
    if (_this.status === 'pending') {
      _this.status = 'rejected';
      _this.reason = reason;
      _this.onRejectedCallbacks.forEach(function (fn) {
        fn();
      });
    }
  }

  try {
    executor(resolve, reject);
  } catch (e) {
    reject(e);
  }
}

Promise.prototype.then = function (onFulfilled, onRejected) {
  // 解决.then中不传任何回调函数的问题
  onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : function (value) {
    return value;
  }

  onRejected = typeof onRejected === 'function' ? onRejected : function (err) {
    throw err;
  }

  let _this = this;
  let promise2; //返回一个promise 供.then链式调用

  if (_this.status === 'resolved') {
    promise2 = new Promise(function (resolve, reject) {
      // 当成功或者失败执行时有异常那么返回的promise应该处于失败状态
      setTimeout(function () { // 根据规范让那俩家伙异步执行
        try {
          let x = onFulfilled(_this.value); //这里解释过了
          // 写一个方法统一处理问题1-7
          resolvePromise(promise2, x, resolve, reject);
        } catch (e) {
          reject(e);
        }
      })
    })
  }

  if (_this.status === 'rejected') {
    promise2 = new Promise(function (resolve, reject) {
      setTimeout(function () {
        try {
          let x = onRejected(_this.reason);
          resolvePromise(promise2, x, resolve, reject);
        } catch (e) {
          reject(e);
        }
      })
    })
  }

  if (_this.status === 'pending') {       //解决异步，.then中缓存callback到数组中，异步resolve中执行
    promise2 = new Promise(function (resolve, reject) {
      _this.onResolvedCallbacks.push(function () {
        setTimeout(function () {
          try {
            let x = onFulfilled(_this.value);
            resolvePromise(promise2, x, resolve, reject);
          } catch (e) {
            reject(e)
          }
        })
      });
      _this.onRejectedCallbacks.push(function () {
        setTimeout(function () {
          try {
            let x = onRejected(_this.reason);
            resolvePromise(promise2, x, resolve, reject);
          } catch (e) {
            reject(e);
          }
        })
      });
    })
  }
  
  return promise2;
}

Promise.prototype.catch = function (callback) {
  return this.then(null, callback);
}

Promise.prototype.all = function (promises) {
  //promises是一个promise的数组
  return new Promise(function (resolve, reject) {
    let arr = []; //arr是最终返回值的结果
    let i = 0; // 表示成功了多少次
    function processData(index, y) {
      arr[index] = y;
      if (++i === promises.length) {
        resolve(arr);
      }
    }
    for (let i = 0; i < promises.length; i++) {
      promises[i].then(function (y) {
        processData(i, y)
      }, reject)
    }
  })
}

function resolvePromise(promise2, x, resolve, reject) {
  if (promise2 === x) {
    return reject(new TypeError('循环引用'));
  }

  let called;

  if (x !== null && (typeof x === 'object' || typeof x === 'function')) {
    try {
      let then = x.then;

      if (typeof then === 'function') {
        then.call(x, function (y) {
          if (called) return;

          called = true;

          resolvePromise(promise2, y, resolve, reject);
        }, function (err) {
          if (called) return;

          called = true;
          reject(err);
        });
      } else {
        resolve(x);
      }
    } catch (err) {
      if (called) return;

      called = true;
      reject(err);
    }
  } else {
    resolve(x);
  }
}

Promise.prototype.trace = function (promises) {
  return new Promise(function (resolve, reject) {
    for (var i = 0; i < promises.length; i++) {
      promises[i].then(resolve, reject)
    }
  })
}

Promise.prototype.resolve = function (value) {
  return new Promise(function (resolve, reject) {
    resolve(value);
  });
}

Promise.prototype.reject = function (reason) {
  return new Promise(function (resolve, reject) {
    reject(reason);
  });
}

// 捕获错误的方法，在原型上有catch方法，返回一个没有resolve的then结果即可
Promise.prototype.catch = function (callback) {
  return this.then(null, callback)
}
// 解析全部方法，接收一个Promise数组promises,返回新的Promise，遍历数组，都完成再resolve
Promise.all = function (promises) {
  //promises是一个promise的数组
  return new Promise(function (resolve, reject) {
    let arr = []; //arr是最终返回值的结果
    let i = 0; // 表示成功了多少次
    function processData(index, y) {
      arr[index] = y;
      if (++i === promises.length) {
        resolve(arr);
      }
    }
    for (let i = 0; i < promises.length; i++) {
      promises[i].then(function (y) {
        processData(i, y)
      }, reject)
    }
  })
}
// 只要有一个promise成功了 就算成功。如果第一个失败了就失败了
Promise.race = function (promises) {
  return new Promise(function (resolve, reject) {
    for (var i = 0; i < promises.length; i++) {
      promises[i].then(resolve, reject)
    }
  })
}
// 生成一个成功的promise
Promise.resolve = function (value) {
  return new Promise(function (resolve, reject) {
    resolve(value);
  })
}
// 生成一个失败的promise
Promise.reject = function (reason) {
  return new Promise(function (resolve, reject) {
    reject(reason);
  })
}

Promise.deferred = function () {
  let dfd = {};
  dfd.promise = new Promise(function (resolve, reject) {
    dfd.resolve = resolve;
    dfd.reject = reject;
  });
  return dfd
}

module.exports = Promise;