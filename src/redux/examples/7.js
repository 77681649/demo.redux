/**
 * 使用 applyMiddleware 注册thunk实现异步action的处理
 */
const {
  createStore,
  applyMiddleware,
  bindActionCreators,
  compose
} = require("./redux");
const thunk = ({ dispatch, getState }) => next => action => {
  if (typeof action === "function") {
    action(dispatch, getState);
  } else {
    next(action);
  }
};

const withDiffLogger = () =>
  (diffLoggerEnchaner = createStore => (reducer, preload, enchaner) => {
    let store = createStore(reducer, preload, enchaner);
    let prevState = store.getState();

    store.subscribe(function() {
      let nextState = store.getState();

      if (prevState != nextState) {
        console.log("State Diff:");

        if (nextState === null) {
          console.log("nextState is null");
          return;
        }

        const keys = Object.keys(nextState);

        keys.forEach(key => {
          if (prevState === null || prevState[key] != nextState[key]) {
            console.log(`  ${key}:`, nextState[key]);
          }
        });
      }

      prevState = nextState;
    });

    return store;
  });

const preload = {
  fetching: false,
  data: []
};

const reducer = function(state, action) {
  switch (action.type) {
    case "FETCH":
      return Object.assign({}, state, { fetching: true, data: null });
    case "FETCH_SUCCESS":
      return Object.assign({}, state, {
        fetching: false,
        data: action.payload
      });
    default:
      return state;
  }
};

const store = createStore(
  reducer,
  preload,
  compose(
    applyMiddleware(thunk),
    withDiffLogger()
  )
);

const actions = bindActionCreators(
  {
    fetch() {
      return dispatch => {
        dispatch({ type: "FETCH" });

        setTimeout(function() {
          const data = [{ id: 1, name: "iPad" }, { id: 2, name: "iPhone" }];
          actions.fetchSuccess(data);
        }, 2000);
      };
    },
    fetchSuccess(data) {
      return {
        type: "FETCH_SUCCESS",
        payload: data
      };
    }
  },
  store.dispatch
);

actions.fetch();
