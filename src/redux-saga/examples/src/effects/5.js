/**
 * 使用 call: 以阻塞的方式, 调用一个普通函数, 并获得执行结果
 */
import { store, runSaga, effects } from "../createStoreWithSaga";
const { put, call } = effects;

const add = (x, y) => x + y;

/**
 * saga
 */
function* saga() {
  const result = yield call(add, 10, 20);

  yield put({ type: "add", result });
}

/**
 * run saga
 */
runSaga(saga);
