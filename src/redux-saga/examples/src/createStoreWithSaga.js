/**
 * 创建 saga-middleware, 并与 redux 建立链接
 */
import { createStore, applyMiddleware } from "../redux";
import createSagaMiddleware from "../redux-saga"; // import saga-middleware-creator

// 创建saga-middleware
const sagaMiddleware = createSagaMiddleware();

export { effects, eventChannel, channel } from "../redux-saga";

// 加入到store middleware中, 与redux建立链接
export const store = createStore(null, applyMiddleware(sagaMiddleware));

export const runSaga = sagaMiddleware.run;
