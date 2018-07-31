/**
 * 使用 call: 以阻塞的方式, 调用一个返回Promise的函数, 并获得最终的结果
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
function* addSaga() {
  const result = yield call(add, 10, 20);

  yield put({ type: "add", result });
}

function* divideSaga() {
  try {
    const result = yield call(divide, 10, 0);
    yield put({ type: "divide", result });
  } catch (err) {
    yield put({ type: "divide_error", err: err.message });
  }
}

/**
 * run saga
 */
runSaga(addSaga);
runSaga(divideSaga);
