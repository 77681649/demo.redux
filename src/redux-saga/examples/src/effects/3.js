/**
 * 2: 使用 take 监听 store 的 action ( 只监听三次 )
 */
import { store, runSaga, effects } from "../createStoreWithSaga";
const { take, put } = effects;

store.replaceReducer(function(state, action) {
  switch (action.type) {
    case "logining":
      return { ...state, logining: true };
    default:
      return state || { logining: false };
  }
});

/**
 * saga
 */

// 监听 "take" action
function* watcher() {
  while (true) {
    // 1. 捕获 login
    yield take("login");

    // 2. dispatch logining
    yield put({ type: "logining" });
  }
}

/**
 * run saga
 */
runSaga(watcher);

/**
 * dispatch
 */
store.dispatch({ type: "login" });

store.printState();
