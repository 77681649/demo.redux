/**
 * 发送一个action
 */
const { createStore } = require('./redux');

const ACTION_TYPE_INCREMENT = 'INCREMENT';

const initState = {
	count: 0,
};

/**
 * 2. reducer - 纯函数, 负责处理dispatch的action
 * @param {Object} state 旧的状态
 * @param {Object} action dispatch的action
 */
function rootReducer(state, action) {
	if (action.type == ACTION_TYPE_INCREMENT) {
		state.count = state.count + action.value;
	}

	return state;
}

/**
 * actionCreator - 负责创建一个指定类型的action
 * @param {Number} value
 * @returns {Object} 返回一个action
 */
function createIncrementAction(value) {
	return { type: ACTION_TYPE_INCREMENT, value };
}

//
// 创建 store
//
const store = createStore(rootReducer, initState);

//
// 3. 监听 store 变换
//
store.subscribe(function onChange() {
	console.log('store changed:');
	console.log('state', store.getState()); // 获得 state
});

//
// 1. 发送 dispatch
//
store.dispatch(createIncrementAction(10));
store.dispatch(createIncrementAction(10));
store.dispatch(createIncrementAction(10));
