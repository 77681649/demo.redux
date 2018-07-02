/**
 * 使用effects.take 实现监听未来action - 实现完整的登录流程
 */
const Redux = require("../Redux");
const ReduxSaga = require("../../dist/redux-saga.js");
const { applyMiddleware, createStore } = Redux;
const createSagaMiddleware = ReduxSaga.default;
const sagaMiddleware = createSagaMiddleware();
const rootReducer = function(state, action) {
  switch (action.type) {
    case "LOGIN_OK":
      return { logined: true, auth: action.auth };
    default:
      return { logined: false, auth: "" };
  }
};
const store = createStore(
  rootReducer,
  { logined: false, auth: "" },
  applyMiddleware(sagaMiddleware)
);
const { delay } = ReduxSaga;
const { take, put, call, select, all } = ReduxSaga.effects;

const API = {
  login() {
    return new Promise(resolve => {
      setTimeout(() => resolve({ auth: "ABSDFSDFJKLY123" }), 1000);
    });
  },
  loginout() {
    return new Promise(resolve => {
      setTimeout(() => resolve({ code: 0 }), 1000);
    });
  }
};

function* watchAndLog() {
  while (true) {
    let action = yield take("*");
    let nextState = yield select();

    console.log("action:", action);
    console.log("action nextState:", nextState);
  }
}

function* watchLoginFlow() {
  // 登录
  const action = yield take("LOGIN"); // 监听 "LOGIN" action
  try {
    yield put({ type: "LOGIN_ING" });
    const loginResult = yield call(API.login, action); // 调用 "LOGIN" 接口

    if (loginResult.auth) {
      // 检查 "LOGIN" 结果
      yield put({ type: "LOGIN_OK", auth: loginResult.auth }); // 登录成功, 发送action
    } else {
      yield put({ type: "LOGIN_ERROR" }); // 登录成功, 发送action
    }
  } catch (err) {
    yield put({ type: "LOGIN_ERROR", err }); // 登录失败, 发送action
  }

  // 登出
  yield take("LOGINOUT");
  try {
    const loginoutResult = yield call(API.loginout); // 调用 "LOGINOUT" 接口

    if (loginoutResult.code) {
      // 检查 "LOGINOUT" 结果
      yield put({ type: "LOGINOUT_OK", auth: loginoutResult.auth }); // 登出成功, 发送action
    } else {
      yield put({ type: "LOGINOUT_ERROR" }); // 登出成功, 发送action
    }
  } catch (err) {
    yield put({ type: "LOGINOUT_ERROR", err }); // 登录失败, 发送action
  }
}

// bind saga
sagaMiddleware.run(function* rootSaga() {
  yield all([watchAndLog(), watchLoginFlow()]);
});

//
// run
//
if (!store.getState().logined) {
  store.dispatch({
    type: "LOGIN",
    username: "tyo",
    password: "password"
  });

  setTimeout(function() {
    store.dispatch({ type: "LOGINOUT" });
  }, 2000);
}
