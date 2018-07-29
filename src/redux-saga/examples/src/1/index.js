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
  // 监听到任意的action, 都转发给helloSaga
  yield effects.takeEvery("*", saga);
}

// 创建saga-middleware
const sagaMiddleware = createSagaMiddleware(saga);

// 加入到store middleware中, 与redux建立链接
const store = createStore(null, applyMiddleware(sagaMiddleware));

//
// sagaMiddleware.run(watcher);

store.dispatch({
  type: "HELLO"
});
