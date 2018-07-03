module.exports = function createStore() {
  const { createStore, applyMiddleware } = require("../redux");
  const createSagaMiddleware = require("./create-saga-middleware");
  const rootReducer = require("./reducer");
  const sagaMiddleware = createSagaMiddleware();
  const rootSaga = require("./sagas");
  const store = createStore(
    rootReducer,
    applyMiddleware(sagaMiddleware)
  );

  sagaMiddleware.run(rootSaga);

  return store;
};
