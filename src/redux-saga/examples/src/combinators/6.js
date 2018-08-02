/**
 * 6: 使用 throttle: 使用 take,fork,delay 实现 throttle
 */
import { store, runSaga, effects, delay } from "../createStoreWithSaga";
const { take, call, fork, put } = effects;

function* throttle(delayMS, pattern, worker) {
  yield take(pattern);
  yield fork(worker);
  yield delay(delayMS);
}

function* watcher() {
  yield throttle(5000, "ping", ping);
}

function* ping() {
  const res = yield call(requestPing);
  yield put({ type: "ping_result", res });
}

function requestPing() {
  return new Promise(resolve => resolve("ok"));
}

runSaga(watcher);

store.dispatch({ type: "ping" });
store.dispatch({ type: "ping" });
store.dispatch({ type: "ping" });
store.dispatch({ type: "ping" });
store.dispatch({ type: "ping" });
store.dispatch({ type: "ping" });
store.dispatch({ type: "ping" });
