- [1: 创建 saga-middleware - 与 redux 建立链接](https://github.com/77681649/demo.redux/tree/master/src/redux-saga/examples/src/1)

- [2: 创建 saga-middleware - 自定义将 saga log 写入文件](https://github.com/77681649/demo.redux/tree/master/src/redux-saga/examples/src/2)

## effects

- [1: 使用 take: 监听 store 的 action ( 只监听一次 )](https://github.com/77681649/demo.redux/tree/master/src/redux-saga/examples/src/effects/1)
- [2: 使用 take: 监听 store 的 action ( 只监听三次 )](https://github.com/77681649/demo.redux/tree/master/src/redux-saga/examples/src/effects/2)
- [3: 使用 put: 发送一个普通的 action](https://github.com/77681649/demo.redux/tree/master/src/redux-saga/examples/src/effects/3)
- [4: 使用 put: 发送一个异步的 action](https://github.com/77681649/demo.redux/tree/master/src/redux-saga/examples/src/effects/4)
- [5: 使用 call: 以阻塞的方式, 调用一个普通函数, 并获得执行结果](https://github.com/77681649/demo.redux/tree/master/src/redux-saga/examples/src/effects/5)
- [6: 使用 call: 以阻塞的方式, 调用一个返回 Promise 的函数, 并获得最终的结果](https://github.com/77681649/demo.redux/tree/master/src/redux-saga/examples/src/effects/6)
- [7: 使用 call: 以阻塞的方式, 调用一个 gen function, 执行另一个 saga](https://github.com/77681649/demo.redux/tree/master/src/redux-saga/examples/src/effects/7)
- [8: 使用 fork: 实现以非阻塞的方式执行任务 - 并行的获得两种不同的资源](https://github.com/77681649/demo.redux/tree/master/src/redux-saga/examples/src/effects/8)
- [9: 使用 fork: 以非阻塞的方式运行的函数, 内部的错误,外部无法通过 try..catch 捕获](https://github.com/77681649/demo.redux/tree/master/src/redux-saga/examples/src/effects/9)
- [10: 使用 take: 在我们的 Todo 应用中，我们希望监听用户的操作，并在用户初次创建完三条 Todo 信息时显示祝贺信息]()

## channels

- [1: 使用 actionChannel: 暂存来不及消费的 action](https://github.com/77681649/demo.redux/tree/master/src/redux-saga/examples/src/channels/1)
- [2: 使用 eventChannel: 实现外部流与 saga 进行通信](https://github.com/77681649/demo.redux/tree/master/src/redux-saga/examples/src/channels/2)
- [3: 使用 channel: 实现 saga 之间的通信 - 同一时间内最多执行三次任务](https://github.com/77681649/demo.redux/tree/master/src/redux-saga/examples/src/channels/3)

- [: 使用 cancel: 实现取消功能]()
- [: 使用 cancel: 实现自定义的取消逻辑]()

  实战: 监听 action -- watch 未产生的 action ( 未来的 )
  实战: 非阻塞调用 && 取消任务
  实战: redux-saga 流程控制 ( series , waterfall , parallel , race )
  实战: 节流 throttling
  实战: 防抖动 debouning
  实战: 重试 retry
  实战: 测试 undo

https://github.com/77681649/demo.redux/tree/master/src/redux-saga/src/internal/runSaga.js
/Users/tyo/Documents/Codes/demo/demo.redux/src/redux-saga/src/internal/runSaga.js

## helpers

- [1: 使用 takeEvery: 实现多次处理指定的 action]()
- [2: 使用 takeEvery: 使用 take,fork 实现 takeEvery 的功能 - action 日志记录器]()
- [3: 使用 takeLastest: 实现多次发起 fetchUser 时, 确保只有最后一个请求得到结果]()
- [4: 使用 takeLastest: 使用 take,fork 实现 takeLastest 的功能]()
- [5: 使用 throttle: 实现每隔 5000ms,发起心跳检测的功能]()
- [6: 使用 throttle: 使用 take,fork,delay 实现 throttle]()

## combinators

- [: 使用 all: 实现并行执行多个 effect 的功能]()
- [: 使用 all:]()
- [: 使用 all:]()
- [: 使用 race: 实现请求超时的功能]()
- [: 使用 race: ]()
- [: 使用 race:]()

## tests

- [: 测试一个异步请求是否成功]()
- [: 测试是否正常处理错误]()
- [: ]

## reals

- [1: 实现登录/登出的逻辑]()
