/**
 * 使用 take 监听 store 的 action ( 只监听一次 )
 */
import { store, runSaga, effects } from "../createStoreWithSaga";
const { take } = effects;

/**
 * saga
 */

// 监听 "take" action
function* watcher() {
  const action = yield take("take");
  console.log("watched action:", action);
}

/**
 * run saga
 */
runSaga(watcher);

/**
 * dispatch
 */
store.dispatch({ type: "init" }); // 不会被捕获
store.dispatch({ type: "take" }); // 被捕获
store.dispatch({ type: "take" }); // 不会被捕获, 只会监听一次
