/**
 * 创建 saga-middleware, 并与 redux 建立链接
 */
import { createStore, applyMiddleware } from "../../redux";
import createSagaMiddleware from "../../redux-saga"; // import saga-middleware-creator
import { effects } from "../../redux-saga";

// 创建一个saga
function* saga() {
  // 打印
  yield effects.call(console.log.bind(console), "hello saga");
}

// 创建一个wacher saga: 监听所有的action
function* watcher() {
  // 监听到任意的action, 都转发给helloSaga ( 它是一次性的 )
  yield effects.take("*");
  yield effects.call(saga);
}

// 创建saga-middleware
const sagaMiddleware = createSagaMiddleware();

// 加入到store middleware中, 与redux建立链接
const store = createStore(null, applyMiddleware(sagaMiddleware));

// 添加一个 watcher, 负责监听store dispatch的action
sagaMiddleware.run(watcher);

// 两次action
// 只会监听到一次 action, 并打印"hello saga"
store.dispatch({
  type: "HELLO"
});

store.dispatch({
  type: "HELLO"
});
