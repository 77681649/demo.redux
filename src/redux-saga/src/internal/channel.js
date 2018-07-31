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
 * Emitter 消息中心 ( 全局的 ) -- 负责分发
 * @returns {Object} {subscribe,emit}
 */
export function emitter() {
  const subscribers = [];

  /**
   * 订阅事件 - 添加订阅者
   * @param {Function} sub 订阅者
   * @returns {Function} 返回用于取消订阅的函数
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
 * 创建一个通信渠道
 * @param {Buffer} buffer 缓冲区队列FIFO - 当没有消费者(taker)时, 负责暂存消息
 * @returns {}
 */
export function channel(buffer = buffers.fixed()) {
  // channel 是否已经关闭,
  let closed = false;

  // taker pending队列(饥渴的消费者)
  let takers = [];

  // assert buffer
  check(buffer, is.buffer, INVALID_BUFFER);

  /**
   * 断言 是否是不可访问的状态
   */
  function checkForbiddenStates() {
    // 1. 如果还有等待接收消息的taker时, 不能关闭channel
    if (closed && takers.length) {
      throw internalErr("Cannot have a closed channel with pending takers");
    }

    // 2. 不能存在无法消费的情况 (缓冲区有input, 但是有pending taker)
    if (takers.length && !buffer.isEmpty()) {
      throw internalErr("Cannot have pending takers with non empty buffer");
    }
  }

  /**
   * 输入 - input -> channel
   * @param {Object} input 输入
   */
  function put(input) {
    // 检查状态
    checkForbiddenStates();

    // 断言
    check(input, is.notUndef, UNDEFINED_INPUT_ERROR);

    // 渠道关闭时, 忽略put操作
    if (closed) {
      return;
    }

    //
    // 如果没有消费者(taker), 那么将input暂存到缓冲区, 等待消费者(taker)读取
    //
    if (!takers.length) {
      return buffer.put(input);
    }

    //
    // 如果 有消费者(taker)
    // 那么 flush pending taker queue - 将input分发给消费者(taker)
    //
    for (var i = 0; i < takers.length; i++) {
      const cb = takers[i];

      // 如果需要匹配, 那么只会将input分发给匹配上的消费者(taker)
      if (!cb[MATCH] || cb[MATCH](input)) {
        // 从pending队列中移除
        takers.splice(i, 1);

        // 消费
        return cb(input);
      }
    }
  }

  /**
   * 输出单个input - channel -> input -> taker
   * @param {Function} cb 消费者 (input:Object)=>void
   */
  function take(cb) {
    // 检查状态
    checkForbiddenStates();

    // 断言消费者是否是一个函数
    check(cb, is.func, "channel.take's callback must be a function");

    if (closed && buffer.isEmpty()) {
      // channel end
      // 消费完毕时关闭, 发出 "CHANNEL_END"
      cb(END);
    } else if (!buffer.isEmpty()) {
      // 有待消费的input - 以FIFO的方式消费缓冲区的中数据
      cb(buffer.take());
    } else {
      // 无待消费的input - 将taker插入pending队列, 等到消息到达
      takers.push(cb);

      // 创建 cancel pending函数
      cb.cancel = () => remove(takers, cb);
    }
  }

  /**
   * 输出所有iput
   * @param {Function} cb 消费者 (inputs:Object[])=>void
   */
  function flush(cb) {
    // 检查状态
    checkForbiddenStates(); // TODO: check if some new state should be forbidden now

    check(cb, is.func, "channel.flush' callback must be a function");

    // 消费完毕时关闭, 发出 "CHANNEL_END"
    if (closed && buffer.isEmpty()) {
      cb(END);
      return;
    }

    // 消费缓冲区中所有的input
    cb(buffer.flush());
  }

  /**
   * 关闭渠道 - 关闭之后, 就不能进行take,put操作
   */
  function close() {
    // 检查状态
    checkForbiddenStates();

    if (!closed) {
      closed = true;

      // 通知taker
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
 * 工厂函数
 * 创建自定应的事件通信渠道 - 将订阅的事件分发给响应的消费者
 * 
 * @param {Function} subscribe 消息订阅函数 - 初始化外部的事件来源
 * @param {Buffer} [buffer=buffers.none()] 缓冲区, 默认不使用缓冲区,即先于taker之前的消息都会被丢弃
 * @param {Function} matcher 消息匹配器, - 只有匹配时, 才会被channel处理
 * @returns {Object} 返回创建的channel对象
 */
export function eventChannel(subscribe, buffer = buffers.none(), matcher) {
  /**
    should be if(typeof matcher !== undefined) instead?
    see PR #273 for a background discussion
  **/
  if (arguments.length > 2) {
    check(matcher, is.func, "Invalid match function passed to eventChannel");
  }

  // 创建一个通信渠道
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
   * 订阅 store action
   * 当dispatch action,会有如下操作:
   *  1. 检查是不是接收到 CHANNEL_END -> YES close channel
   *  2. 检查是否是关注的input
   *  3. channel.put(input)
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
 * 标准的通信渠道
 * 由创建saga-middleware时创建, 将中间件链接的store作为Observer( 如果有消息流过channel, 会通知它 )
 *
 * @param {Function} subscribe 消息订阅函数
 * @returns {Object} 返回创建的channel对象
 */
export function stdChannel(subscribe) {
  // 创建事件通信渠道
  const chan = eventChannel(cb =>
    subscribe(input => {
      //
      if (input[SAGA_ACTION]) {
        cb(input);
        return;
      }

      // 排队执行 taker
      asap(() => cb(input));
    })
  );

  return {
    ...chan,

    /**
     * enhance taker - 支持taker自定义matcher
     * @param {Function} cb 回调函数
     * @param {Function} matcher 消费者自定义的matcher
     */
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
