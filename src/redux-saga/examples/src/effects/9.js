/**
 * 9: 使用 fork: 以非阻塞的方式运行的函数, 内部的错误,外部无法通过 try..catch 捕获
 */
import { store, runSaga, effects, takeEvery } from "../createStoreWithSaga";
const { put, call, fork } = effects;

function* saga() {
  try {
    yield fork(sagaChild);
  } catch (err) {
    console.log("throw err in saga", err);
  }
}

function* sagaChild() {
  // 这种写法无法捕获, 会出现未捕获的错误
  // yield Promise.reject(new Error("hahaha"));

  // 在内部捕获错误
  // 这种写法: 可以捕获
  try {
    yield Promise.reject(new Error("hahaha"));
  } catch (err) {
    console.log("throw err in sagaChild", err);
  }
}

runSaga(saga);
