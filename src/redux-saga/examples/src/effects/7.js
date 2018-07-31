/**
 * 使用 call: 以阻塞的方式, 调用一个generator function, 执行另一个saga
 */
import { store, runSaga, effects } from "../createStoreWithSaga";
const { put, call } = effects;

const add = (x, y) => Promise.resolve(x + y);
const divide = (x, y) => {
  if (y === 0) {
    return Promise.reject(new Error("Error"));
  } else {
    return Promise.resolve(x / y);
  }
};

/**
 * saga
 */
function* addSaga(x, y) {
  return yield call(add, x, y);
}

function* divideSaga(x, y) {
  return yield call(divide, x, y);
}

/**
 * run saga
 */
runSaga(function*() {
  const r1 = yield call(addSaga, 10, 20);
  const r2 = yield call(divideSaga, 20, 4);

  yield put({
    type: "result",
    r1,
    r2
  });
});
