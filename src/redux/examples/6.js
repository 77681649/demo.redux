/**
 * 使用 applyMiddleware 注册thunk实现异步action的处理
 */
const { createStore, applyMiddleware, bindActionCreators } = require("./redux");
const thunk = ({ dispatch, getState }) => next => action => {
  if (typeof action === "function") {
    action(dispatch, getState);
  } else {
    next(action);
  }
};

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

const store = createStore(reducer, preload, applyMiddleware(thunk));

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
