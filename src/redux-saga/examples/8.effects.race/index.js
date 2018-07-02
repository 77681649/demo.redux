/**
 * 实现 effects parallel
 */
const createStore = require("./create-store");
const store = createStore();

store.dispatch({
  type:'FETCH_PRODUCT',
  productId:10
})