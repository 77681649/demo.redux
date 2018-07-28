/**
 * 使用 combineReducers 拆分 reducers
 *   combineReducers将多个reducer合并
 *   combineReducers可以嵌套使用, 进一步拆分
 */
const { createStore, bindActionCreators, combineReducers } = require("./redux");
const skip = (collection, skip) => collection.filter((it, idx) => idx >= skip);
const limit = (collection, limit) =>
  collection.filter((it, idx) => idx < limit);
const products = [
  { id: 1, name: "iPad" },
  { id: 2, name: "iPhone" },
  { id: 3, name: "Macbook" },
  { id: 4, name: "Macbook Air" },
  { id: 5, name: "Macbook Pro" }
];
const initilizeState = {
  common: {
    products: {
      pageIndex: 0,
      pageSize: 2,
      data: []
    },
    product: {}
  },
  index: {
    showTooltip: true
  }
};

function commonProductsReducer(state, action) {
  switch (action.type) {
    case "FIRST_PAGE":
      return Object.assign({}, state, {
        pageIndex: 0,
        data: limit(products, state.pageSize)
      });
    case "NEXT_PAGE":
      let nextPageIndex = state.pageIndex + 1;
      return Object.assign({}, state, {
        pageIndex: nextPageIndex,
        data: limit(
          skip(products, nextPageIndex * state.pageSize),
          state.pageSize
        )
      });
    default:
      return state || {};
  }
}

function commonProductReducer(state, action) {
  switch (action.type) {
    case "SHOW_PRODUCT":
      return Object.assign({}, products.find(p => p.id === action.id));
    default:
      return state || {};
  }
}

function indexReducer(state, action) {
  switch (action.type) {
    case "SHOW_TOOLTIP":
      return { showTooltip: true };
    case "HIDE_TOOLTIP":
      return { showTooltip: false };
    default:
      return state || false;
  }
}

const store = createStore(
  combineReducers({
    common: combineReducers({
      products: commonProductsReducer,
      product: commonProductReducer
    }),
    index: indexReducer
  }),
  initilizeState
);

store.dispatch({
  type: "SHOW_TOOLTIP"
});

store.dispatch({
  type: "FIRST_PAGE"
});

store.dispatch({
  type: "NEXT_PAGE"
});

store.dispatch({
  type: "SHOW_PRODUCT",
  id: 3
});
