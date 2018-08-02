/**
 * 3: 使用 race: 实现请求超时的功能 - 请求接口时, 如果3秒中没有返回就认为超时
 */
import { store, runSaga, effects, delay } from "../createStoreWithSaga";
const { take, call, race, put } = effects;

function timeoutable(delayMS) {
  return function(worker) {
    return function*(...args) {
      const { res, timeout } = yield race({
        res: call(worker, ...args),
        timeout: delay(delayMS)
      });

      // 只会作为call的返回值, 但是不会被进一步解析,
      // 所以不会被try..catch捕获
      // return new Promise((resolve, reject) => {
      //   if (timeout) {
      //     reject(new Error("timeout error"));
      //   } else {
      //     resolve(res);
      //   }
      // })

      // 让call解析Promise, 可以抛出reject
      return yield call(
        () =>
          new Promise((resolve, reject) => {
            if (timeout) {
              reject(new Error("timeout error"));
            } else {
              resolve(res);
            }
          })
      );
    };
  };
}

function* watcher() {
  const requestWithTimeout = timeoutable(1000)(request);

  try {
    yield take("fetch");
    yield call(requestWithTimeout);
  } catch (err) {
    yield put({ type: "fetch_error", err: err.message });
  }
}

function request() {
  return new Promise(resolve => {
    setTimeout(function() {
      resolve("ok");
    }, 2000);
  });
}

runSaga(watcher);

store.dispatch({ type: "fetch" });
