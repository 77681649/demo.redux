/**
 * 使用 channel: 实现saga之间的通信 - 同一时间内最多执行三次任务
 * 当我们收到一个请求并且执行的任务少于三个时，我们会立即处理请求，否则我们将任务放入队列
 */
import {
  store,
  runSaga,
  effects,
  channel,
  buffers
} from "../createStoreWithSaga";
const { take, put, call } = effects;

const buffer = buffers.fixed(1000);
const myChannel = channel(buffer);

// 异步任务1: 从服务器拉A数据
const pull1 = function() {
  return new Promise(resolve => {
    setTimeout(resolve("A"), Math.random() * 1000);
  });
};

// 异步任务2: 从服务器拉B数据
const pull2 = function() {
  return new Promise(resolve => {
    setTimeout(resolve("B"), Math.random() * 1000);
  });
};

// 异步任务3: 从服务器拉C数据
const pull3 = function() {
  return new Promise(resolve => {
    setTimeout(resolve("C"), Math.random() * 1000);
  });
};

/**
 * saga
 */
function* rootSaga() {
  yield [saga1(), saga2(), saga3()];

  while (true) {
    yield take("pull");
    for (let i = 0; i < 3; i++) {
      
    }
  }
}

function* saga1() {
  while (true) {
    yield take(myChannel);
    yield call(pull1);
  }
}

function* saga2() {
  while (true) {
    yield take(myChannel);
    yield call(pull2);
  }
}

function* saga3() {
  while (true) {
    yield take(myChannel);
    yield call(pull3);
  }
}

/**
 * run saga
 */
runSaga(rootSaga);
