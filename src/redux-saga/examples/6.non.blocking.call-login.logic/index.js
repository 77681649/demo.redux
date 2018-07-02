/**
 * 实现完整的登录逻辑
 * 使用effects.take
 *
 */
const createStore = require("./create-store");
const store = createStore();

store.dispatch({
  type: "LOGOUT"
});

store.dispatch({
  type: "LOGIN_REQUEST",
  user: "tyo",
  password: "tyo"
});

store.dispatch({
  type: "LOGOUT"
})