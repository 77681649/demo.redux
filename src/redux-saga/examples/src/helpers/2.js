/**
 * 使用 takeEvery: 使用 take,fork 实现 takeEvery 的功能 - action 日志记录器
 */
import { store, runSaga, effects } from "../createStoreWithSaga";
const { take, fork, call } = effects;

function* logWatcher() {
  while (true) {
    // 监听到任意action
    const action = yield take("*");

    // 非阻塞
    // fork logWorker
    yield fork(logWorker, action);
  }
}

function* logWorker(action) {
  yield call([console, console.log], "take action: ", action);
}

runSaga(logWatcher);

store.dispatch({ type: "xx" });
store.dispatch({ type: "yy" });
store.dispatch({ type: "zz" });
