/**
 * bindActionCreators
 */
const { createStore, bindActionCreators } = require("./redux");
const store = createStore();

const actionCreatorA = () => ({
  type: "ACTION_A"
});

const actionCreatorB = () => ({
  type: "ACTION_B"
});

const aciontCreatorC = () => ({
  type: "ACTION_C"
});

//
// bind 单个Action Creator
//
const actionC = bindActionCreators(aciontCreatorC, store.dispatch);

//
// bind 多个Action Creator
//
const actions = bindActionCreators(
  {
    actionA: actionCreatorA,
    actionB: actionCreatorB
  },
  store.dispatch
);

//
// bindActionCreators(actionCreator,dispatch) 等价于
// (...args)=>dispatch(actionCreator(...args))
//
actions.actionA();
actions.actionB();
actionC();
