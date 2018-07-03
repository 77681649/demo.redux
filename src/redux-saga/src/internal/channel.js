import { is, check, remove, MATCH, internalErr, SAGA_ACTION } from "./utils";
import { buffers } from "./buffers";
import { asap } from "./scheduler";

const CHANNEL_END_TYPE = "@@redux-saga/CHANNEL_END";

/**
 * Channel End Action
 */
export const END = { type: CHANNEL_END_TYPE };

/**
 * 判断是否为Channel End Action
 * @param {Object} a action
 */
export const isEnd = a => a && a.type === CHANNEL_END_TYPE;

/**
 * Emitter 消息中心
 * @returns {Object} {subscribe,emit}
 */
export function emitter() {
  const subscribers = [];

  /**
   * 订阅事件 - 添加订阅者
   * @param {Function} sub 订阅者
   */
  function subscribe(sub) {
    subscribers.push(sub);
    return () => remove(subscribers, sub);
  }

  /**
   * 发布事件 - 向订阅者广播消息
   * @param {Object} item 事件(Action)
   */
  function emit(item) {
    const arr = subscribers.slice();
    for (var i = 0, len = arr.length; i < len; i++) {
      arr[i](item);
    }
  }

  return {
    subscribe,
    emit
  };
}

export const INVALID_BUFFER =
  "invalid buffer passed to channel factory function";
export var UNDEFINED_INPUT_ERROR = "Saga was provided with an undefined action";

if (process.env.NODE_ENV !== "production") {
  UNDEFINED_INPUT_ERROR += `\nHints:
    - check that your Action Creator returns a non-undefined value
    - if the Saga was started using runSaga, check that your subscribe source provides the action to its listeners
  `;
}

/**
 * 创建一个渠道(消息分发中心), 负责接收(put)消息,并将接收到的消息分发给何时的接受者(taker)
 * @param {Buffer} 渠道的数据区缓冲区
 * @returns {}
 */
export function channel(buffer = buffers.fixed()) {
  // 是否已经关闭
  let closed = false;

  // taker等待队列(饥渴的消费者), 等待何时的消息到来
  let takers = [];

  // assert buffer
  check(buffer, is.buffer, INVALID_BUFFER);

  /**
   * 断言 是否是不可访问的状态
   */
  function checkForbiddenStates() {
    // 存在接受者的情况下, 不能关闭通信渠道
    if (closed && takers.length) {
      throw internalErr("Cannot have a closed channel with pending takers");
    }

    //
    if (takers.length && !buffer.isEmpty()) {
      throw internalErr("Cannot have pending takers with non empty buffer");
    }
  }

  /**
   * 存 - 输入消息(生产消息)
   * @param {Object} input 输入的消息
   */
  function put(input) {
    checkForbiddenStates();
    check(input, is.notUndef, UNDEFINED_INPUT_ERROR);

    // 渠道关闭时, 忽略put操作
    if (closed) {
      return;
    }

    // 没有taker, 将消息暂存到缓冲区, 等待taker来消费
    if (!takers.length) {
      return buffer.put(input);
    }

    //
    // 处理等待中的taker
    //
    for (var i = 0; i < takers.length; i++) {
      const cb = takers[i];

      // 检查macher, 找出合适的taker, 对input进行消费
      if (!cb[MATCH] || cb[MATCH](input)) {
        // 将taker从等待队列中移除
        takers.splice(i, 1);
        return cb(input);
      }
    }
  }

  /**
   * 取 - 消费消息
   * @param {Function} cb 回调函数
   */
  function take(cb) {
    checkForbiddenStates();
    check(cb, is.func, "channel.take's callback must be a function");

    if (closed && buffer.isEmpty()) {
      // 消费完毕时关闭, 发出 "CHANNEL_END"
      cb(END);
    } else if (!buffer.isEmpty()) {
      // 缓冲区非空(有待消费的消息), 直接从缓冲区中消费
      cb(buffer.take());
    } else {
      // 缓冲区为空时, 将taker加入等待队列,等到新的消息到达
      takers.push(cb);

      // 包装cancel函数
      cb.cancel = () => remove(takers, cb);
    }
  }

  /**
   * 清空渠道中的Action
   * @param {Function} cb 回调函数 (flushedItem:any)=>void
   */
  function flush(cb) {
    checkForbiddenStates(); // TODO: check if some new state should be forbidden now
    check(cb, is.func, "channel.flush' callback must be a function");
    if (closed && buffer.isEmpty()) {
      cb(END);
      return;
    }
    cb(buffer.flush());
  }

  /**
   * 关闭渠道
   */
  function close() {
    checkForbiddenStates();
    if (!closed) {
      closed = true;
      if (takers.length) {
        const arr = takers;
        takers = [];
        for (let i = 0, len = arr.length; i < len; i++) {
          arr[i](END);
        }
      }
    }
  }

  return {
    take,
    put,
    flush,
    close,
    get __takers__() {
      return takers;
    },
    get __closed__() {
      return closed;
    }
  };
}

/**
 * 事件分发渠道 - 将订阅的事件分发给响应的消费者
 * @param {Function} subscribe 事件订阅器
 * @param {Buffer} buffer 缓冲区
 * @param {Function} matcher 匹配器
 */
export function eventChannel(subscribe, buffer = buffers.none(), matcher) {
  /**
    should be if(typeof matcher !== undefined) instead?
    see PR #273 for a background discussion
  **/
  if (arguments.length > 2) {
    check(matcher, is.func, "Invalid match function passed to eventChannel");
  }

  // 创建一个渠道
  const chan = channel(buffer);

  // enhance close
  const close = () => {
    if (!chan.__closed__) {
      // 渠道没有关闭过, 取消订阅
      if (unsubscribe) {
        unsubscribe();
      }

      // 关闭渠道
      chan.close();
    }
  };

  /**
   * 添加一个事件订阅者
   */
  const unsubscribe = subscribe(input => {
    // 接收到"CHANNEL_END" , 关闭渠道
    if (isEnd(input)) {
      close();
      return;
    }

    // 匹配事件
    if (matcher && !matcher(input)) {
      return;
    }

    // 将事件放入渠道, 等待消费者消费
    chan.put(input);
  });

  // 渠道已经关闭, 取消事件订阅
  if (chan.__closed__) {
    unsubscribe();
  }

  if (!is.func(unsubscribe)) {
    throw new Error(
      "in eventChannel: subscribe should return a function to unsubscribe"
    );
  }

  return {
    take: chan.take,
    flush: chan.flush,
    close
  };
}

/**
 *
 * @param {Function} subscribe
 */
export function stdChannel(subscribe) {
  // 创建事件分发渠道
  const chan = eventChannel(cb =>
    subscribe(input => {
      if (input[SAGA_ACTION]) {
        cb(input);
        return;
      }

      asap(() => cb(input));
    })
  );

  return {
    ...chan,
    take(cb, matcher) {
      if (arguments.length > 1) {
        check(
          matcher,
          is.func,
          "channel.take's matcher argument must be a function"
        );
        cb[MATCH] = matcher;
      }

      chan.take(cb);
    }
  };
}
