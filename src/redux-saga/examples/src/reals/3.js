/**
 * 3: 重试 - 当请求发生错误时, 重试指定次数
 */
import { store, runSaga, effects, delay } from "../createStoreWithSaga";
import { resolve } from "dns";
const { take, put, fork, call, cancel, cancelled } = effects;

function* retry(times, worker) {
  let i = 0;

  while (i <= times) {
    try {
      return yield call(worker);
    } catch (err) {
      if (i === times) {
        throw err;
      }

      i++;
      delay(2000);
      console.log("retry times", i);
    }
  }
}

function* fetch() {
  try {
    const result = yield retry(3, requestFetch);
    yield put({ type: "fetch_success", res: result });
  } catch (err) {
    yield put({ type: "fetch_error", err: err.message });
  }
}

let times = 0;
function requestFetch() {
  return new Promise((resolve, reject) => {
    ++times > 2 ? resolve("ok") : reject(new Error("error"));
  });
}

runSaga(fetch);
