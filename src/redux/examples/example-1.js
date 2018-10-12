/**
 * 一个简单例子
 */
const { createStore } = require('./redux');

function rootReducer(state, action) {
	console.log('reducer', action);
	return state;
}

//
// 创建 store
//
const store = createStore(rootReducer, { name: 'redux' });

store.subscribe(function() {
  console.log();
  console.log('------------------------------------------------------ subscribe');
	console.log('store changed.');
});

console.log();
console.log('------------------------------------------------------ store');
console.log(store);

console.log();
console.log('------------------------------------------------------ getState');
console.log(store.getState());

console.log();
console.log('------------------------------------------------------ dispatch');
store.dispatch({ type: 'TEST', payload: 1 });
