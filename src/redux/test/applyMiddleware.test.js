const { createStore, applyMiddleware } = require("../dist/redux");

describe("applyMiddleware", () => {
  test("按apply顺序依次执行中间件", () => {
    let m1 = api => next => action => {
      action.result *= 2;
      next(action);
    };
    let m2 = api => next => action => {
      action.result -= 5;
      next(action);
    };
    let m3 = api => next => action => {
      action.result *= 3;
      next(action);
    };
    let rootReducer = (state, action) => {
      if (action.type == "INIT") {
        return action.result;
      } else {
        return state || 0;
      }
    };

    let store = applyMiddleware(m1, m2, m3)(createStore)(rootReducer);
    store.dispatch({ type: "INIT", result: 10 });
    expect(store.getState()).toEqual(45);
  });
});
