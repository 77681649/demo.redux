/**
 * 使用 take 监听 store 的 action ( 只监听一次 )
 */
import { store, runSaga, effects, takeEvery } from "../createStoreWithSaga";
const { take, put } = effects;

/**
 * saga
 */

// 监听 "take" action
function* watcher() {
  const task = yield takeEvery("init", saga);

  console.log(task)
}

function* saga(action) {
  yield put({ type: "saga", payload: action });
}

/**
 * run saga
 */
runSaga(watcher);

/**
 * dispatch
 */
store.dispatch({ type: "init" });
store.dispatch({ type: "init" });
store.dispatch({ type: "init" });
