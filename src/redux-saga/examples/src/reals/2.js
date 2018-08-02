/**
 * 2: 防抖动 debouning - 同一个worker多次执行时, 两两之间必须间隔N秒
 */
import { store, runSaga, effects, delay } from "../createStoreWithSaga";
const { take, put, fork, call, cancel, cancelled } = effects;
let pingOrder = 0;

function* debounce(delayMS, pattern, worker) {
  let task = null;

  while (true) {
    const action = yield take(pattern);

    if (task && !task.isCancelled()) {
      yield cancel(task);
    }

    task = yield fork(function*() {
      yield delay(delayMS);
      yield fork(worker, action);
    });
  }
}

function* watcher() {
  yield debounce(1000, "ping", ping);
}

function* ping(pingOrde) {
  const res = yield call(requestPing, pingOrde);
  yield put({ type: "ping_result", res });
}

function requestPing({ pingOrder }) {
  return new Promise(resolve => resolve(pingOrder));
}

runSaga(watcher);

// 只会发起一次
setTimeout(() => store.dispatch({ type: "ping", pingOrder: pingOrder++ }), 500);
setTimeout(
  () => store.dispatch({ type: "ping", pingOrder: pingOrder++ }),
  1000
);
setTimeout(
  () => store.dispatch({ type: "ping", pingOrder: pingOrder++ }),
  1500
);

setTimeout(
  () => store.dispatch({ type: "ping", pingOrder: pingOrder++ }),
  4000
);
setTimeout(
  () => store.dispatch({ type: "ping", pingOrder: pingOrder++ }),
  6000
);
