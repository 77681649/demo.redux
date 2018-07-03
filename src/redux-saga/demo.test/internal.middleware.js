const { createStore, applyMiddleware } = require("./redux");
const createSagaMiddleware = require("load")("internal/middleware").default;

function createStoreWithSaga() {
  let rootReducer = (state, action) => {
    return state;
  };
  let sagaMiddleware = createSagaMiddleware();
  let store = createStore(rootReducer, applyMiddleware(sagaMiddleware));

  return {
    store,
    runSaga: sagaMiddleware.run
  };
}

const { store, runSaga } = createStoreWithSaga();
const { take } = require("load")("effects");

runSaga(function* watchAction() {
  const action = yield take("*");
  const nextState = yield select();

  console.log("action: ", aciton.type);
  console.log("nextState:", nextState);
});

store.dispatch({ type: "INIT" });
