import {
  sym,
  is,
  ident,
  check,
  deprecate,
  updateIncentive,
  createSetContextWarning,
  SELF_CANCELLATION
} from "./utils";
import {
  takeEveryHelper,
  takeLatestHelper,
  throttleHelper
} from "./sagaHelpers";

const IO = sym("IO");
const TAKE = "TAKE";
const PUT = "PUT";
const ALL = "ALL";
const RACE = "RACE";
const CALL = "CALL";
const CPS = "CPS";
const FORK = "FORK";
const JOIN = "JOIN";
const CANCEL = "CANCEL";
const SELECT = "SELECT";
const ACTION_CHANNEL = "ACTION_CHANNEL";
const CANCELLED = "CANCELLED";
const FLUSH = "FLUSH";
const GET_CONTEXT = "GET_CONTEXT";
const SET_CONTEXT = "SET_CONTEXT";

const TEST_HINT =
  "\n(HINT: if you are getting this errors in tests, consider using createMockTask from redux-saga/utils)";

/**
 * 创建一个effect描述信息, 用来为最终的effect运行提供必要的数据
 * @param {String} type effect的类型
 * @param {Any} payload effect的有效负荷
 * @returns {Object} 返回一个effect描述信息对象
 */
const effect = (type, payload) => ({ [IO]: true, [type]: payload });

export const detach = eff => {
  check(
    asEffect.fork(eff),
    is.object,
    "detach(eff): argument must be a fork effect"
  );
  eff[FORK].detached = true;
  return eff;
};

/**
 * effect take
 * 创建一个effect描述信息:
 * 用来命令middleware subscribe 指定channel中匹配指定pattern的input
 *
 * pattern
 * "*"          匹配所有发起的action
 * string       匹配指定的action.type action
 * function     (action)=>boolean, 匹配返回true的action
 * array        匹配数组项中的任意规则
 *
 * channel
 * 匹配来自指定channel的消息
 *
 * @param {String|Function|(String|Function)[]|Channel} patternOrChannel
 * @returns {Object} 返回一个effect plain object
 */
export function take(patternOrChannel = "*") {
  if (arguments.length) {
    check(
      arguments[0],
      is.notUndef,
      "take(patternOrChannel): patternOrChannel is undefined"
    );
  }

  if (is.pattern(patternOrChannel)) {
    return effect(TAKE, { pattern: patternOrChannel });
  }

  if (is.channel(patternOrChannel)) {
    return effect(TAKE, { channel: patternOrChannel });
  }

  throw new Error(
    `take(patternOrChannel): argument ${String(
      patternOrChannel
    )} is not valid channel or a valid pattern`
  );
}

/**
 *
 */
take.maybe = (...args) => {
  const eff = take(...args);
  eff[TAKE].maybe = true;
  return eff;
};

export const takem = deprecate(
  take.maybe,
  updateIncentive("takem", "take.maybe")
);

/**
 * effect put
 * 创建一个effect描述信息:
 * 用来命令 middleware
 *  1. channel为空, 向store发送一个action
 *  2. channel非空, 向channel发送一个action
 * @param {Object} channel 通信渠道
 * @param {Object} action action
 * @returns {Object} 返回一个effect plain object
 */
export function put(channel, action) {
  if (arguments.length > 1) {
    check(
      channel,
      is.notUndef,
      "put(channel, action): argument channel is undefined"
    );
    check(
      channel,
      is.channel,
      `put(channel, action): argument ${channel} is not a valid channel`
    );
    check(
      action,
      is.notUndef,
      "put(channel, action): argument action is undefined"
    );
  } else {
    check(channel, is.notUndef, "put(action): argument action is undefined");
    action = channel;
    channel = null;
  }

  return effect(PUT, { channel, action });
}

/**
 * effect put.resolve
 * @param {*} args
 * @returns {Object} 返回一个effect plain object
 */
put.resolve = (...args) => {
  const eff = put(...args);
  eff[PUT].resolve = true;
  return eff;
};

put.sync = deprecate(put.resolve, updateIncentive("put.sync", "put.resolve"));

/**
 *
 */
export function all(effects) {
  return effect(ALL, effects);
}

/**
 *
 */
export function race(effects) {
  return effect(RACE, effects);
}

/**
 * 获得函数调用的描述对象
 * @param {String} meth 方法名
 * @param {Function} fn 函数
 * @param {any[]} ...args 函数参数
 * @returns {Object} 返回一个effect plain object
 */
function getFnCallDesc(meth, fn, args) {
  check(fn, is.notUndef, `${meth}: argument fn is undefined`);

  let context = null;

  if (is.array(fn)) {
    [context, fn] = fn;
  } else if (fn.fn) {
    ({ context, fn } = fn);
  }

  if (context && is.string(fn) && is.func(context[fn])) {
    fn = context[fn];
  }

  check(fn, is.func, `${meth}: argument ${fn} is not a function`);

  return { context, fn, args };
}

/**
 * effect call
 * 创建一个effect描述信息:
 * 用来命令middleware 以参数args调用函数fn
 * @param {Function|Array|Object} fn 函数, 支持[context,fn]或者{ fn:{context,fn} } 的传参格式
 * @param {any[]} ...args 函数参数
 * @returns {Object} 返回一个effect plain object
 */
export function call(fn, ...args) {
  return effect(CALL, getFnCallDesc("call", fn, args));
}

/**
 * effect apply
 * 创建一个effect描述信息:
 * 用来命令middleware 以参数args调用函数fn
 * @param {Object} context 上下文对象
 * @param {Function|Array|Object} fn 函数, 支持[context,fn]或者{ fn:{context,fn} } 的传参格式
 * @param {any[]} args 函数参数
 * @returns {Object} 返回一个effect plain object
 */
export function apply(context, fn, args = []) {
  return effect(CALL, getFnCallDesc("apply", { context, fn }, args));
}

/**
 * effect cps
 * 创建一个effect描述信息:
 * 用来命令middleware 以Node风格的函数的方式调用fn (在参数中追加一个callback, 用来结束函数执行)
 * @param {Object} context 上下文对象
 * @param {Function|Array|Object} fn 函数, 支持[context,fn]或者{ fn:{context,fn} } 的传参格式
 * @param {any[]} args 函数参数
 * @returns {Object} 返回一个effect plain object
 */
export function cps(fn, ...args) {
  return effect(CPS, getFnCallDesc("cps", fn, args));
}

/**
 * effect fork
 * 创建一个effect描述信息:
 * 用来命令middleware 以Node风格的函数的方式调用fn (在参数中追加一个callback, 用来结束函数执行)
 *
 * @param {Function|Generator} fn 函数/generator函数
 * @param {Any[]} ...args 执行函数时的参数
 * @returns {Object} 返回一个effect plain object
 */
export function fork(fn, ...args) {
  return effect(FORK, getFnCallDesc("fork", fn, args));
}

/**
 * effect spawn
 * 类似fork
 *
 * @param {Function|Generator} fn 函数/generator函数
 * @param {Any[]} ...args 执行函数时的参数
 * @returns {Object} 返回一个effect plain object
 */
export function spawn(fn, ...args) {
  return detach(fork(fn, ...args));
}

/**
 * effect join
 * 创建一个effect描述信息:
 * 用来命令middleware 以Node风格的函数的方式调用fn (在参数中追加一个callback, 用来结束函数执行)
 *
 * @param {...Task} tasks
 * @returns {Object} 返回一个effect plain object
 */
export function join(...tasks) {
  if (tasks.length > 1) {
    return all(tasks.map(t => join(t)));
  }

  const task = tasks[0];

  check(task, is.notUndef, "join(task): argument task is undefined");
  check(
    task,
    is.task,
    `join(task): argument ${task} is not a valid Task object ${TEST_HINT}`
  );

  return effect(JOIN, task);
}

export function cancel(...tasks) {
  if (tasks.length > 1) {
    return all(tasks.map(t => cancel(t)));
  }
  const task = tasks[0];
  if (tasks.length === 1) {
    check(task, is.notUndef, "cancel(task): argument task is undefined");
    check(
      task,
      is.task,
      `cancel(task): argument ${task} is not a valid Task object ${TEST_HINT}`
    );
  }
  return effect(CANCEL, task || SELF_CANCELLATION);
}

export function select(selector, ...args) {
  if (arguments.length === 0) {
    selector = ident;
  } else {
    check(
      selector,
      is.notUndef,
      "select(selector,[...]): argument selector is undefined"
    );
    check(
      selector,
      is.func,
      `select(selector,[...]): argument ${selector} is not a function`
    );
  }
  return effect(SELECT, { selector, args });
}

/**
 * effect actionChannel
 * 创建一个effect描述信息:
 * 用来命令 middleware 当接受到匹配pattern的action时, 使用创建的eventChannel进行队列式无阻塞I/O操作
 *
 * @params {String} pattern 匹配模式
 * @params {Buffer} buffer 缓冲区对象
 * @returns {Object} 返回一个effect plain object
 */
export function actionChannel(pattern, buffer) {
  check(
    pattern,
    is.notUndef,
    "actionChannel(pattern,...): argument pattern is undefined"
  );

  if (arguments.length > 1) {
    check(
      buffer,
      is.notUndef,
      "actionChannel(pattern, buffer): argument buffer is undefined"
    );
    check(
      buffer,
      is.buffer,
      `actionChannel(pattern, buffer): argument ${buffer} is not a valid buffer`
    );
  }

  return effect(ACTION_CHANNEL, { pattern, buffer });
}

export function cancelled() {
  return effect(CANCELLED, {});
}

export function flush(channel) {
  check(
    channel,
    is.channel,
    `flush(channel): argument ${channel} is not valid channel`
  );
  return effect(FLUSH, channel);
}

export function getContext(prop) {
  check(prop, is.string, `getContext(prop): argument ${prop} is not a string`);
  return effect(GET_CONTEXT, prop);
}

export function setContext(props) {
  check(props, is.object, createSetContextWarning(null, props));
  return effect(SET_CONTEXT, props);
}

/**
 *
 * @param {*} patternOrChannel
 * @param {*} worker
 * @param {*} args
 */
export function takeEvery(patternOrChannel, worker, ...args) {
  return fork(takeEveryHelper, patternOrChannel, worker, ...args);
}

/**
 *
 */
export function takeLatest(patternOrChannel, worker, ...args) {
  return fork(takeLatestHelper, patternOrChannel, worker, ...args);
}

/**
 *
 * @param {*} ms
 * @param {*} pattern
 * @param {*} worker
 * @param {*} args
 */
export function throttle(ms, pattern, worker, ...args) {
  return fork(throttleHelper, ms, pattern, worker, ...args);
}

/**
 * 工厂方法 - 创建一个判断指定effect type的函数
 * @param {String} type effect type
 * @returns {Function} 返回一个用于判断effect type 类型的函数, 并返回effect的payload
 */
const createAsEffectType = type => effect =>
  effect && effect[IO] && effect[type];

export const asEffect = {
  take: createAsEffectType(TAKE),
  put: createAsEffectType(PUT),
  all: createAsEffectType(ALL),
  race: createAsEffectType(RACE),
  call: createAsEffectType(CALL),
  cps: createAsEffectType(CPS),
  fork: createAsEffectType(FORK),
  join: createAsEffectType(JOIN),
  cancel: createAsEffectType(CANCEL),
  select: createAsEffectType(SELECT),
  actionChannel: createAsEffectType(ACTION_CHANNEL),
  cancelled: createAsEffectType(CANCELLED),
  flush: createAsEffectType(FLUSH),
  getContext: createAsEffectType(GET_CONTEXT),
  setContext: createAsEffectType(SET_CONTEXT)
};
