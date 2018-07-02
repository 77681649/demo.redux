const ReduxSaga = require("../../dist/redux-saga");
const { take } = ReduxSaga.effects;
const { select, call, put, fork, cancel, cancelled } = ReduxSaga.effects;
const { all } = ReduxSaga.effects;

const Api = (function () {
  const store = {}

  return {
    authorize(user, password) {
      return new Promise((resolve, reject) => {
        setTimeout(function () {
          if (user === "tyo" && password === "tyo") {
            resolve("ADIOUxsdowShk");
          } else {
            reject(new Error("The username or password is invalid."));
          }
        }, 2000)
      });
    },

    storeItem(key, value) {
      store[key] = value;
    }
  }
})()

let count = 0;
function* watchAndLog() {
  while (true) {
    let action = yield take("*");
    let nextState = yield select();

    console.log(
      `------------------------------------------------------------------------------------------------ dispatch ACTION[${++count}]`
    );
    console.log("action: ", action);
    console.log("action nextState:", nextState);
  }
}

function* loginflow() {
  //
  // 强逻辑 - 必须dispatch "LOGIN_REQUEST"之后,才会执行接收后序的事件
  //
  while (true) {
    const { user, password } = yield take("LOGIN_REQUEST");

    // 非阻塞
    const task = yield fork(authorize, user, password);

    // 当监听到指定事件时
    const action = yield take(["LOGOUT", "LOGIN_ERROR"]);

    // 如果在authorize还未返回时,dispatch LOGOUT,那么应该取消authorize
    if (action.type == "LOGOUT") {
      yield cancel(task)
    }
    yield call(Api.storeItem, "token", "");
  }
}

function* authorize(user, password) {
  try {
    let token = yield call(Api.authorize, user, password);

    yield call(Api.storeItem, "token", token);
    yield put({
      type: "LOGIN_SUCCESS",
      token
    });
  } catch (err) {
    yield put({ type: "LOGIN_ERROR", err });
  } finally {
    if (yield cancelled()) {
      console.log('finally')
    }
  }
}

module.exports = function* rootSaga() {
  yield all([watchAndLog(), loginflow()]);
};
