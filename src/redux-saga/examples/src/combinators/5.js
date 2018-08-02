/**
 * 5: 使用 throttle: 实现每隔 5000ms,发起心跳检测的功能
 */
import { store, runSaga, effects, throttle } from "../createStoreWithSaga";
const { take, call, race, put } = effects;

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
