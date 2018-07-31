/**
 * 使用 actionChannel: 暂存来不及消费的action
 */
import { store, runSaga, effects, buffers } from "../createStoreWithSaga";
const { take, put, call, actionChannel } = effects;

store.replaceReducer(function(
  state = { logined: false, username: "" },
  action
) {
  switch (action.type) {
    case "logining":
      return { ...state, logined: action.logined, username: action.username };
    default:
      return state;
  }
});

function requestLoginStatus() {
  return new Promise(resolve => {
    setTimeout(function() {
      resolve(true);
    }, 2000);
  });
}

/**
 * saga
 */

// 监听 "take" action
function* watcher() {
  while (true) {
    // 1. 捕获 login
    const { username } = yield take("login");

    // 2. 异步请求接口
    const logined = yield call(requestLoginStatus, username);

    yield put({ type: "logining", logined, username });

    yield call(store.printState);
  }
}

function* watcherWithChannel() {
  // 单独开辟一个channel
  // 限制缓冲区大小为5, 如果超过5条 action, 则抛出异常
  const channel = yield actionChannel("loginWithChannel", buffers.fixed(5));

  while (true) {
    // 1. 捕获 login
    const { username } = yield take(channel);

    // 2. 异步请求接口
    const logined = yield call(requestLoginStatus, username);

    yield put({ type: "logining", logined, username });

    yield call(store.printState);
  }
}

/**
 * run saga
 */
runSaga(watcher);
runSaga(watcherWithChannel);

/**
 * dispatch
 */

//
// 多次take, 只会响应第一次, 后续的都会丢失; 因为,默认的stcChannel,不会对来不及处理的action坐缓存
//
// store.dispatch({ type: "login", username: "1" });
// store.dispatch({ type: "login", username: "2" });
// store.dispatch({ type: "login", username: "3" });

//
// 使用actionChannel
// 以队列的方式, 依次处理来不及处理的action
// 
//
store.dispatch({ type: "loginWithChannel", username: "1" });
store.dispatch({ type: "loginWithChannel", username: "2" });
store.dispatch({ type: "loginWithChannel", username: "3" });
