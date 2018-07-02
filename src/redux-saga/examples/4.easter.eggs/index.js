/**
 * 实战: 使用effects.take 实现监听未来action
 * 
 * dispatch TODO_CREATED 之后触发特殊的消息
 */
const Redux = require("../Redux");
const ReduxSaga = require("../../dist/redux-saga.js");

const { applyMiddleware, createStore } = Redux;
const createSagaMiddleware = ReduxSaga.default;
const sagaMiddleware = createSagaMiddleware();
const rootReducer = function(state, action) {
  return action.payload || state;
};
const store = createStore(rootReducer, applyMiddleware(sagaMiddleware));

const { take } = ReduxSaga.effects;

function* watchAndLog() {
  while (true) {
    const action = yield take("*");

    console.log("action:", action);
  }
}

function* watchFirstThreeTodosCreation() {
  for (let i = 0; i < 3; i++) {
    yield take("TODO_CREATED");
  }

  console.log("CONGRATULATION!!!");
}

sagaMiddleware.run(watchAndLog);
sagaMiddleware.run(watchFirstThreeTodosCreation);

store.dispatch({
  type: "TODO_CREATED",
  payload: {
    id: 1,
    name: "read"
  }
});

store.dispatch({
  type: "TODO_CREATED",
  payload: {
    id: 2,
    name: "write"
  }
});

store.dispatch({
  type: "TODO_CREATED",
  payload: {
    id: 3,
    name: "sleep"
  }
});

store.dispatch({
  type: "TODO_CREATED",
  payload: {
    id: 4,
    name: "run"
  }
});
