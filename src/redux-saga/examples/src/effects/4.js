/**
 * 2: 使用 take 监听 store 的 action ( 只监听三次 )
 */
import { store, runSaga, effects, channel } from "../createStoreWithSaga";
const { take, put } = effects;

store.replaceReducer(function(
  state = { logining: false, logined: false, err: null },
  action
) {
  switch (action.type) {
    case "login_status":
      return { ...state, logined: action.logined };
    case "login_status_error":
      return { ...state, err: action.err };
    case "logining":
      return { ...state, logining: true };
    default:
      return state;
  }
});

const newChannel = channel();

/**
 * saga
 */

// 监听 "take" action
function* watcher() {
  while (true) {
    // 1. 捕获 login
    const action = yield take("login");

    // 2. dispatch logining, 以阻塞的方式处理
    // 先检查登录状态
    try {
      yield put.sync(newChannel, requestLoginStatus(action.username));
      yield put({ type: "logining" });
    } catch (err) {
      yield put({ type: "login_status_error", err });
    }
  }
}

function requestLoginStatus(username) {
  return new Promise((resolve, reject) => {
    setTimeout(function() {
      if (username === "tyo") resolve({ type: "login_status", logined: true });
      else if (username === "cc")
        resolve({ type: "login_status", logined: false });
      else reject(new Error("error"));
    });
  });
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
