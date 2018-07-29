import {
  is,
  check,
  uid as nextSagaId,
  wrapSagaDispatch,
  noop,
  log
} from "./utils";
import proc from "./proc";

const RUN_SAGA_SIGNATURE = "runSaga(storeInterface, saga, ...args)";
const NON_GENERATOR_ERR = `${RUN_SAGA_SIGNATURE}: saga argument must be a Generator function!`;

/**
 * 运行saga
 * @param {Object} storeInterface redux-store 接口
 * @param {Object} storeInterface.context saga的上下文, 将作为task的父级上下文
 * @param {Object} storeInterface.subscribe 消息订阅函数, 用于订阅redux-saga接收到消息(action)
 * @param {Object} storeInterface.dispatch 消息分发器
 * @param {Object} storeInterface.getState 状态取值器
 * @param {Object} storeInterface.sagaMonitor saga 监视器
 * @param {Object} storeInterface.logger saga 日志函数
 * @param {Object} storeInterface.onError saga 错误处理函数
 * @param {Generator} saga 需要运行的saga
 * @param {any[]} ...args 传递给saga的参数
 * @returns {Task} 返回一个 Task 描述对象
 */
export function runSaga(storeInterface, saga, ...args) {
  let iterator;

  if (is.iterator(storeInterface)) {
    if (process.env.NODE_ENV === "development") {
      log(
        "warn",
        `runSaga(iterator, storeInterface) has been deprecated in favor of ${RUN_SAGA_SIGNATURE}`
      );
    }
    iterator = storeInterface;
    storeInterface = saga;
  } else {
    check(saga, is.func, NON_GENERATOR_ERR);
    //
    // 1. 创建generator对象
    //
    iterator = saga(...args);
    check(iterator, is.iterator, NON_GENERATOR_ERR);
  }

  const {
    subscribe,
    dispatch,
    getState,
    context,
    sagaMonitor,
    logger,
    onError
  } = storeInterface;

  //
  // 生成 effect id
  // 作用:
  //
  const effectId = nextSagaId();

  //
  // 2. 发送监控事件
  //
  if (sagaMonitor) {
    // monitors are expected to have a certain interface, let's fill-in any missing ones
    sagaMonitor.effectTriggered = sagaMonitor.effectTriggered || noop;
    sagaMonitor.effectResolved = sagaMonitor.effectResolved || noop;
    sagaMonitor.effectRejected = sagaMonitor.effectRejected || noop;
    sagaMonitor.effectCancelled = sagaMonitor.effectCancelled || noop;
    sagaMonitor.actionDispatched = sagaMonitor.actionDispatched || noop;

    sagaMonitor.effectTriggered({
      effectId,
      root: true,
      parentEffectId: 0,
      effect: { root: true, saga, args }
    });
  }

  //
  // 3.
  //
  const task = proc(
    // saga生成器对象
    iterator,

    // emitter.subscribe
    subscribe,

    // store.dispatch
    wrapSagaDispatch(dispatch),

    // store.getState
    getState,

    // saga 上下文
    context,

    // 选项
    { sagaMonitor, logger, onError },

    // saga id
    effectId,

    // saga 名称
    saga.name
  );

  //
  // 4. 发送监控事件
  //
  if (sagaMonitor) {
    sagaMonitor.effectResolved(effectId, task);
  }

  //
  // 5. 返回 task
  //
  return task;
}
