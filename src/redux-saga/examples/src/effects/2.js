/**
 * 2: 使用 take 监听 store 的 action ( 只监听三次 )
 */
import { store, runSaga, effects } from "../createStoreWithSaga";
const { take } = effects;

/**
 * saga
 */

// 监听 "take" action
function* watcher() {
  let MAX_LOGIN_TIMES = 3;
  let times = 0;

  while (times < MAX_LOGIN_TIMES) {
    times++;

    const action = yield take("login");
    console.log(`[${times}] watched action:`, action);
  }
}

/**
 * run saga
 */
runSaga(watcher);

/**
 * dispatch
 */
store.dispatch({ type: "init" }); // 不捕获
store.dispatch({ type: "login" }); // 捕获
store.dispatch({ type: "login" }); // 捕获
store.dispatch({ type: "login" }); // 捕获
store.dispatch({ type: "login" }); // 不捕获
store.dispatch({ type: "login" }); // 不捕获
