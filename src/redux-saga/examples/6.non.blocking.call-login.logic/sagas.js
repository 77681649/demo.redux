const ReduxSaga = require("../../dist/redux-saga");
const { take } = ReduxSaga.effects;
const { select, call, put } = ReduxSaga.effects;
const { all } = ReduxSaga.effects;

const Api = {
  store: {},

  authorize(user, password) {
    return new Promise((resolve, reject) => {
      if (user === "tyo" && password === "tyo") {
        resolve("ADIOUxsdowShk");
      } else {
        reject(new Error("The username or password is invalid."));
      }
    });
  },

  storeItem(key, value) {
    this.store[key] = value;
  }
};

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
  while (true) {
    const { user, password } = yield take("LOGIN_REQUEST");
    const token = yield authorize(user, password);

    if (token) {
      yield call(Api.storeItem("token", token));
      yield take("LOGOUT");
      yield call(APi.storeItem("token", ""));
    }
  }
}

function* authorize(user, password) {
  try {
    let token = yield call(Api.authorize, user, password);

    yield put({
      type: "LOGIN_SUCCESS",
      token
    });
  } catch (err) {
    yield put({ type: "LOGIN_ERROR", err });
  }
}

module.exports = function* rootSaga() {
  yield all([watchAndLog(), loginflow()]);
};
