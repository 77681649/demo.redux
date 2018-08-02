/**
 * 实现登录/登出的逻辑
 * 1. 登录: 调用远程接口登录, 返回一个授权令牌, 将其保存到storage中
 * 2. 登出: 删除token即可
 */
import { store, runSaga, effects, delay } from "../createStoreWithSaga";
const { take, put, fork, call, cancel, cancelled } = effects;
const storage = {
  _storage: {},
  setItem(key, value) {
    this._storage[key] = value;
  },
  removeItem(key) {
    delete this._storage[key];
  }
};

store.replaceReducer(function(state = { isLoginPending: false }, action) {
  switch (action.type) {
    case "login":
      return { ...state, isLoginPending: true };
    case "login_success":
    case "login_fail":
    case "login_error":
    case "reset_is_login_pending":
      return { ...state, isLoginPending: false };
    default:
      return state;
  }
});

function* loginFlow() {
  while (true) {
    const { username, password } = yield take("login");
    // 非阻塞
    // 这意味着, 可以在请求login的过程中, 进行登出操作
    const task = yield fork(login, username, password);

    // 登录失败也要执行loginout操作
    const action = yield take(["logout", "login_error"]);

    if (action.type === "logout") {
      // 取消login
      yield cancel(task);
    }

    yield call(logout);
  }
}

function* login() {
  try {
    const token = yield call(requestLogin);

    if (token) {
      yield call(saveToken, token);
      yield put({ type: "login_success", token });
    } else {
      yield put({ type: "login_fail" });
    }
  } catch (err) {
    yield put({ type: "login_error" });
  } finally {
    // cancel() 会执行 fiannly语句块的内容
    // 清场工作
    if (yield cancelled()) {
      yield put({ type: "reset_is_login_pending" });
    }
  }
}

function requestLogin(username, password) {
  return new Promise((resolve, reject) => {
    setTimeout(
      () =>
        resolve(
          Math.random()
            .toString(32)
            .replace("0.", "")
        ),
      1000
    );
  });
}

function* logout() {
  yield call(deleteToken);
  yield put({ type: "logout_success" });
}

function saveToken(token) {
  storage.setItem("TOKEN", token);
}

function deleteToken() {
  storage.removeItem("TOKEN");
}

runSaga(loginFlow);

// 登录之后, 立即登出
store.dispatch({ type: "login", username: "x", password: "y" });
store.dispatch({ type: "logout" });

// 重新登录
setTimeout(() => {
  store.dispatch({ type: "login", username: "y", password: "y" });
}, 2000);
