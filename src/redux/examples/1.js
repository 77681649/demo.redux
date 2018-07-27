const { createStore } = require("../dist/redux");
const store = createStore((state, action) => state, {});

function listenA() {
  console.log("call A");
}

function listenB() {
  console.log("call B");

  // 快照B
  store.subscribe(listenA);
  store.subscribe(listenC);
  unsubscribeB()  // ubscribe 不影响快照A
  
  console.log('快照B: ')
  store.dispatch({ type: "test" });
}

function listenC() {
  console.log("call C");
}


// 快照A
const unsubscribeA = store.subscribe(listenA);
const unsubscribeB = store.subscribe(listenB);
const unsubscribeC = store.subscribe(listenC);

// 
// 打印 
// call A
// call B
// call C
// 因为, 在dispatch之前执行subscribe/unscribe都是在单独副本上执行的
console.log('快照A: ')
store.dispatch({ type: "test" });


