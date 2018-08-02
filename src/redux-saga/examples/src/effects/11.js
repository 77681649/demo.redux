/**
 * 使用 cancel: 实现取消功能 - 取消后台的同步任务
 */
import { store, runSaga, effects, delay } from "../createStoreWithSaga";
const { take, put, call, fork, cancelled, cancel } = effects;
let id = 0;

store.replaceReducer(function(state = [], action) {
  switch (action.type) {
    case "BACKGROUND_SYNC":
      return state.concat(action.payload);
    default:
      return state;
  }
});

function* watcher() {
  while (true) {
    yield take("START_BACKGROUND_SYNC");
    const syncTask = yield fork(backgroundSync);

    yield take("STOP_BACKGROUND_SYNC");
    yield cancel(syncTask);
  }
}

function* backgroundSync() {
  try {
    // 每隔1秒 同步一次
    while (true) {
      const data = yield call(requestBackgroundSync);
      yield put({ type: "BACKGROUND_SYNC", payload: data });
      yield delay(1000);
    }
  } catch (err) {
    // catch error之后, 将导致同步暂停
    yield put({ type: "BACKGROUND_SYNC_ERROR", err: err.message });

    // 等5秒, 重新开始同步
    yield delay(5000);
    yield fork(backgroundSync);
  } finally {
    // 收尾
    if (yield cancelled()) {
      yield put({ type: "BACKGROUND_SYNC_CANCELLED" });
    }
  }
}

function requestBackgroundSync() {
  return new Promise((resolve, reject) => {
    if (Math.random() > 0.1) {
      id++;
      resolve({ id: id, name: id });
    } else {
      reject(new Error("sync error"));
    }
  });
}

runSaga(watcher);

store.dispatch({ type: "START_BACKGROUND_SYNC" });

setTimeout(() => {
  store.dispatch({ type: "STOP_BACKGROUND_SYNC" });

  setTimeout(() => {
    store.dispatch({ type: "START_BACKGROUND_SYNC" });
  }, 5000);
}, 6000);
