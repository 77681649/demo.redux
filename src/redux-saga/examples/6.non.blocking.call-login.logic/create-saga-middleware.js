module.exports = function() {
  const createSagaMiddleware = require("../../dist/redux-saga").default;
  const sagaMiddleware = createSagaMiddleware();
  
  return sagaMiddleware;
};
