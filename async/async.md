参考
https://github.com/ruanyf/es6tutorial/blob/gh-pages/docs/async.md  
https://juejin.im/post/5c0dcf70518825765548502b  
https://blog.fundebug.com/2017/12/13/reconstruct-from-promise-to-async-await/  
https://v8.js.cn/blog/fast-async/  (和https://juejin.im/post/5c0dcf70518825765548502b 的优化)
https://juejin.im/post/5c0f73e4518825689f1b5e6c  
https://juejin.im/post/5c4ed94bf265da615705d82d (async的优化)  
https://zhuanlan.zhihu.com/p/65013670

优化主要在Promise.resolve()  参数如果是promise则直接原样返回，而不用new Promise()
