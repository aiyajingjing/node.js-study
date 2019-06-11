- 1.定义   
function* generator() {  
  yield 1;  
  yield 2;  
}  
var g = generator();  
g.next();  
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