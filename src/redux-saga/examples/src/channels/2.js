/**
 * 使用 eventChannel: 实现外部流与saga进行通信
 */
import {
  store,
  runSaga,
  effects,
  eventChannel,
  END
} from "../createStoreWithSaga";
const { take, put, call } = effects;

/*
 * 倒计时
 */
const countdown = function(secs) {
  let subscribers = [];
  let n;

  function emit(input) {
    for (let i = 0; i < subscribers.length; i++) {
      subscribers[i](input);
    }
  }

  n = setInterval(() => {
    if (secs > 0) {
      emit({ type: "interval", secs: secs-- });
    } else {
      emit(END);
    }
  }, 1000);

  return function subscribe(subscriber) {
    subscribers.push(subscriber);

    return function unsubscribe() {
      let pos = subscribers.indexOf(subscriber);

      if (~pos) {
        subscribers.splice(pos, 1);
      }

      if (subscribers.length === 0) {
        clearInterval(n);
      }
    };
  };
};

/**
 * saga
 */
function* saga() {
  // 自定义一个event channel:
  // 它是一个倒计时流
  // 每个1秒钟, emit 当前的倒计时, 当倒计时完毕之后, 关闭自身
  const channel = eventChannel(countdown(10));

  while (true) {
    const action = yield take(channel);
    yield put(action);
  }
}

/**
 * run saga
 */
runSaga(saga);
