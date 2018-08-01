/**
 * 9: 使用 join: 获得fork task的执行结果
 */
import { store, runSaga, effects } from "../createStoreWithSaga";
const { call, take, put, fork, join } = effects;

function ping() {
  return new Promise(resolve => {
    setTimeout(function() {
      if (Math.random() > 0.3) {
        resolve("ok");
      } else {
        resolve("error");
      }
    }, 2000);
  });
}

/**
 * saga
 */
function* rootSaga(x, y) {
  // 发起ping
  const pingTask = yield fork(pingSaga);

  // 每次收到"request"相关的action时
  // 先检查心跳连接是否正常
  while (true) {
    const action = yield take(function(input) {
      return /^request_+/.test(input.type);
    });

    const pong = yield join(pingTask);
    if (pong === "ok") {
      yield call(requestSaga, action);
    } else {
      yield put({
        type: "server_connecting_error"
      });
    }
  }
}

function* pingSaga() {
  return yield call(ping);
}

function* requestSaga(action) {
  yield put({ type: "requesting" });
}

/**
 * run saga
 */
runSaga(rootSaga);

setInterval(function() {
  store.dispatch({
    type: "request_user"
  });
}, 2400);
