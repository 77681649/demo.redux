const Redux = require("../Redux");
const ReduxSaga = require("../../dist/redux-saga.js");

const { applyMiddleware, createStore } = Redux;
const createSagaMiddleware = ReduxSaga.default;
const sagaMiddleware = createSagaMiddleware();
const rootReducer = function(state, action) {
  return action.payload || state;
};
const store = createStore(rootReducer, applyMiddleware(sagaMiddleware));

const { take, select } = ReduxSaga.effects;

function* watchAndLog() {
  while (true) {
    const action = yield take("*"); // 监听所有action
    const state = yield select();   // 获得最新的state

    console.log("action", action);
    console.log("action nextState", state);
  }
}

sagaMiddleware.run(watchAndLog);

store.dispatch({
  type: "SHOW",
  payload: {
    show: true
  }
});

store.dispatch({
  type: "HIDDEN",
  payload: {
    show: false
  }
});
