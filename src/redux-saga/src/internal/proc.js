import {
  noop,
  kTrue,
  is,
  log as _log,
  check,
  deferred,
  uid as nextEffectId,
  array,
  remove,
  object,
  TASK,
  CANCEL,
  SELF_CANCELLATION,
  makeIterator,
  createSetContextWarning,
  deprecate,
  updateIncentive
} from "./utils";
import { asap, suspend, flush } from "./scheduler";
import { asEffect } from "./io";
import { stdChannel as _stdChannel, eventChannel, isEnd } from "./channel";
import { buffers } from "./buffers";

/**
 * 负责跟踪主任务的状态
 * @typedef MainTask
 * @property {String} name 主任务名称
 * @property {Function} cancel 取消函数
 * @proprety {Boolean} [isMainRunning] 整个generator是否执行完毕
 * @property {Boolean} [isRunning=true] 是否正在运行
 * @property {Boolean} [isCancelled=false] 是否已经被取消
 * @property {Function} cont
 */

/**
 * @typedef Task
 * @property {Function} cont
 */

/**
 * @typedef SagaIterator
 * @property {any} _result 获得执行结果
 * @property {Error} _error 获得执行过程中产生的错误对象
 * @property {Promise} _deferredEnd 执行Promise回调函数
 * @property {Boolean} _isRunning 是否正在运行
 * @property {Boolean} _isCancelled 是否已经被取消
 * @property {Boolean} _isAborted 是否已经被终止
 */

export const NOT_ITERATOR_ERROR =
  "proc first argument (Saga function result) must be an iterator";

export const CHANNEL_END = {
  toString() {
    return "@@redux-saga/CHANNEL_END";
  }
};
export const TASK_CANCEL = {
  toString() {
    return "@@redux-saga/TASK_CANCEL";
  }
};

const matchers = {
  /**
   * 通配 matcher
   * @returns {Function}
   */
  wildcard: () => kTrue,

  /**
   * 默认 matcher
   * @returns {Function}
   */
  default: pattern =>
    typeof pattern === "symbol"
      ? input => input.type === pattern
      : input => input.type === String(pattern),

  /**
   * 数组 matcher - "or"复合匹配
   * @returns {Function}
   */
  array: patterns => input => patterns.some(p => matcher(p)(input)),

  /**
   * 谓词 matcher
   * @returns {Function}
   */
  predicate: predicate => input => predicate(input)
};

/**
 * 创建matcher
 * @param {String|Function|Array|"*"} pattern 匹配模式
 * @returns {Function} 返回一个matcher,用来在监听到action时, 匹配指定的action
 */
function matcher(pattern) {
  // prettier-ignore
  return (
      pattern === '*'            ? matchers.wildcard
    : is.array(pattern)          ? matchers.array
    : is.stringableFunc(pattern) ? matchers.default
    : is.func(pattern)           ? matchers.predicate
    : matchers.default
  )(pattern)
}

/**
 * 创建fork queue
 * 用来追踪parentTasks - 即可追踪mainTask和它的forkTask的状态信息
 *
 * Task 执行模型
 *
 * 概念:
 * MainTask     主任务    它是当前generator对象的主流程( 执行流程 )
 * ForkTask     子任务    它是MainTask的分支任务, 包括fork/spawn effect生成的任务
 * ParentTask   父任务    它是MainTask + ForkTask的集合( 统称为forks )
 *
 * 说明:
 * 它是一个多分支的执行树.
 *
 * ParentTask的行为:
 *  - ParentTask完成的前提: 它的所有forks完成或被取消
 *  - ParentTask终止的原因: 有未捕获的错误从forks冒泡上来
 *
 *  - 如果ParentTask已完成, 那么 回调函数的返回值是mainTask返回的值
 *  - 如果ParentTask被取消, 那么 所有的forks都会被取消
 *
 * @example
 * //
 * // execution tree:
 * //   rootSaga
 * //     |
 * //   checkLoginStatusSaga
 * //     |
 * //   requestCheckLogin
 * function* rootSaga(){
 *    // main flow start
 *    while(true){
 *      const {username,password} yield take("LOGIN")
 *
 *      try {
 *        const result = yield call(requestLogin,username,password)
 *
 *        if(result){
 *          yield put({type:"LOGIN_SUCCESS"})
 *          yield fork(checkLoginStatusSaga)        // fork
 *        } else {
 *          yield put({type:"LOGIN_FAIL"})
 *        }
 *      } catch(err){
 *        yield put({type:"LOGIN_ERROR", err})
 *      }
 *    }
 *    // main flow end
 * }
 *
 * function* checkLoginStatusSaga(){
 *    while(true){
 *      yield delay(60 * 1000)
 *      yield fork(requestCheckLogin)             // fork
 *    }
 * }
 *
 *  1. 负责管理fork task
 *  2. 负责在main task && fork task执行完成之后, 调用cb返回结果
 *
 * @param {String} name 队列的名称
 * @param {MainTask} mainTask 主任务对象
 * @param {Function} [cb] 当队列中的任务执行完成或者被终止时调用 (res:Error|any,isErr:Boolean)
 * @returns {Object} 返回一个队列对象 {addTask, cancelAll, abort}
 */
function forkQueue(name, mainTask, cb) {
  // the queue of forks ( task )
  let tasks = [];

  // parentTask 最终的结果
  let result;

  // parentTask 是否执行完成
  let completed = false;

  // 将mainTask作为第一个fork, 添加到队列中
  addTask(mainTask);

  /**
   * 终止操作
   * 1. cancel all forks
   * 2. cb
   *
   * @param {Error} err
   */
  function abort(err) {
    // 取消所有的forks
    cancelAll();

    // 调用回调函数
    cb(err, true);
  }

  /**
   * add task
   * 1. add task to queue
   * 2. 绑定cont函数 - 当task执行完成之后, 回调通知forkQueue的函数
   *
   * @param {MainTask|Task} task
   */
  function addTask(task) {
    // 加入队列
    tasks.push(task);

    /**
     * 任务完成时的回调函数
     * @param {Any} res 执行结果
     * @param {Boolean} isErr 是否发生错误
     */
    task.cont = (res, isErr) => {
      if (completed) {
        return;
      }

      // 从队列中删除
      remove(tasks, task);

      // 防护措施 - 避免意外调用
      task.cont = noop;

      if (isErr) {
        // 终止
        abort(res);
      } else {
        // 如果是主任务完成, 将res作为最终的结果
        if (task === mainTask) {
          result = res;
        }

        // 所有forks执行完毕, 那么parentTask执行完毕
        // 通过回调函数, 通知调用方
        if (!tasks.length) {
          completed = true;
          cb(result);
        }
      }
    };
    // task.cont.cancel = task.cancel
  }

  /**
   * 取消操作 - 取消所有的forks
   */
  function cancelAll() {
    if (completed) {
      return;
    }

    completed = true;

    tasks.forEach(t => {
      // 防护措施 - 防止被取消的函数还会被回调
      t.cont = noop;

      // 取消任务
      t.cancel();
    });

    tasks = [];
  }

  return {
    addTask,
    cancelAll,
    abort,

    /**
     * 获得所有任务
     */
    getTasks: () => tasks,

    /**
     * 获得所有任务的名称
     */
    taskNames: () => tasks.map(t => t.name)
  };
}

/**
 * 将fn包装为task iterator( 类 generator object )
 * 方便后续将它作为一个saga处理
 * @param {Object} options 选项
 * @param {Object} options.context 执行的上下文
 * @param {Function} options.fn 函数
 * @param {Array} options.args 函数的参数
 */
function createTaskIterator({ context, fn, args }) {
  // 如果fn本身就是一个iterator, 跳过执行
  if (is.iterator(fn)) {
    return fn;
  }

  // catch synchronous failures; see #152 and #441
  let result, error;

  try {
    // 执行fn, 获得结果
    result = fn.apply(context, args);
  } catch (err) {
    error = err;
  }

  // i.e. a generator function returns an iterator
  if (is.iterator(result)) {
    return result;
  }

  // do not bubble up synchronous failures for detached forks
  // instead create a failed task. See #152 and #441
  return error
    ? makeIterator(() => {
        // 发生错误, 直接抛出
        throw error;
      })
    : makeIterator(
        (function() {
          let pc;

          // effect
          const eff = { done: false, value: result };

          // return()
          const ret = value => ({ done: true, value });

          return function next(arg) {
            // 第一次 next(): 返回effect 对象
            // 第二次 next(): 返回将传递给next的参数, 作为最终的返回结果
            if (!pc) {
              pc = true;
              return eff;
            } else {
              return ret(arg);
            }
          };
        })()
      );
}

/**
 * 包装helper
 * @param {Function} helper
 * @returns {Object}
 */
const wrapHelper = helper => ({ fn: helper });

/**
 * 创建&&运行一个进程
 *
 * 进程:
 * 进程信息 - 由Task存储
 * 进程代码 - 由generator iterator表示, 基于yield的特性, 实现进程的调度
 *
 * @param {Iterator} iterator generator对象
 * @param {Function} subscribe 订阅函数, 创建channel时使用
 * @param {Function} dispatch 用于发起action
 * @param {Function} getState 用于获得store
 * @param {Object} parentContext 父级的上下对象, 进程的上下文以它为原型
 * @param {Object} options 选项
 * @param {Number} parentEffectId id
 * @param {String} name 进程的名称
 * @param {Function} cont 执行完毕之后的回调函数( 通知调用者 )
 * @returns {Task} 返回描述进程的Task对象
 */
export default function proc(
  iterator,
  subscribe = () => noop,
  dispatch = noop,
  getState = noop,
  parentContext = {},
  options = {},
  parentEffectId = 0,
  name = "anonymous",
  cont
) {
  //
  // assert iterator是否有效
  //
  check(iterator, is.iterator, NOT_ITERATOR_ERROR);

  //
  // 处理过期
  //
  const effectsString = "[...effects]";
  const runParallelEffect = deprecate(
    runAllEffect,
    updateIncentive(effectsString, `all(${effectsString})`)
  );

  const { sagaMonitor, logger, onError } = options;
  const log = logger || _log;

  /**
   * 报告错误日志
   * @param {Error} err 错误对象
   * @param {Object} err.sagaStack
   * @param {Object} err.stack 代码的调用栈
   * @param {String} err.message 错误信息
   */
  const logError = err => {
    let message = err.sagaStack;

    if (!message && err.stack) {
      message =
        err.stack.split("\n")[0].indexOf(err.message) !== -1
          ? err.stack
          : `Error: ${err.message}\n${err.stack}`;
    }

    log("error", `uncaught at ${name}`, message || err.message || err);
  };

  /**
   * 创建一个 标准channel, 负责action take/put
   */
  const stdChannel = _stdChannel(subscribe);

  /**
   * 创建上下文对象, 继承子父级上下文对象
   */
  const taskContext = Object.create(parentContext);

  /**
   * effect 取消函数
   *
   * 它用于实现取消当前正在运行的effect
   *
   * generator每运行一次(在没有结束的情况下):
   * 调用runEffect, 都会为该属性设置新的值,它支持将取消传播到子的effect, 从而实现整体的取消
   */
  next.cancel = noop;

  /**
   * 创建一个task对象
   */
  const task = newTask(parentEffectId, name, iterator, cont);

  /**
   * Main Task:
   * 负责追踪主流程( iterator的执行流程, 不包含fork task )的状态
   */
  const mainTask = {
    name,
    cancel: cancelMain,
    isRunning: true
  };

  /**
   * 任务队列
   * 负责管理iterator在运行过程中, 产生的所有task -- 包括main task && fork task
   * 并且, 当所有task都执行完毕, 调用end结束进程
   */
  const taskQueue = forkQueue(name, mainTask, end);

  /**
   * 取消 mainTask
   *
   */
  function cancelMain() {
    // 正在运行 && 没有被取消
    if (mainTask.isRunning && !mainTask.isCancelled) {
      mainTask.isCancelled = true;
      next(TASK_CANCEL);
    }
  }

  /**
    This may be called by a parent generator to trigger/propagate cancellation
    cancel all pending tasks (including the main task), then end the current task.

    Cancellation propagates down to the whole execution tree holded by this Parent task
    It's also propagated to all joiners of this task and their execution tree/joiners

    Cancellation is noop for terminated/Cancelled tasks tasks
  **/

  /**
   * 它可能被parent generator调用:
   *  1. 先取消操作传播给所有正在等待的tasks( 包括main Tasks )
   *  2. 然后结束当前任务
   *
   * 1. 取消所有正在
   */
  function cancel() {
    /**
      We need to check both Running and Cancelled status
      Tasks can be Cancelled but still Running
    **/
    if (iterator._isRunning && !iterator._isCancelled) {
      iterator._isCancelled = true;

      // 取消所有子任务
      taskQueue.cancelAll();

      /**
        Ending with a Never result will propagate the Cancellation to all joiners
      **/
      end(TASK_CANCEL);
    }
  }

  /**
    attaches cancellation logic to this task's continuation
    this will permit cancellation to propagate down the call chain
  **/
  /**
   * 如果跟调用者有关联
   */
  cont && (cont.cancel = cancel);

  // tracks the running status
  iterator._isRunning = true;

  // kicks up the generator
  // 开始执行 generator
  next();

  // then return the task descriptor to the caller
  return task;

  /**
    This is the generator driver
    It's a recursive async/continuation function which calls itself
    until the generator terminates or throws
  **/

  /**
   * 执行generator object
   *  - 它是递归的 - 基于cb实现
   *  - 它是异步的 - 基于cb
   *  - 它是可取消的
   *  - 它的结束条件:
   *    1. 发生错误
   *    2. 执行结束
   *    3. 被取消
   * @param {Object} [arg] 从generator外部传入的参数( 传递给generator内部, 作为yield语句的返回值 )
   * @param {Boolean} [isErr=false] 是否发生了错误
   */
  function next(arg, isErr) {
    // 如果试图执行一个已经完成的 main Task, 那么肯定是发生了异常
    if (!mainTask.isRunning) {
      throw new Error("Trying to resume an already finished generator");
    }

    try {
      let result;

      if (isErr) {
        //
        // 发生错误, 通知generator抛出异常
        //
        result = iterator.throw(arg);
      } else if (arg === TASK_CANCEL) {
        //
        // 被取消
        //

        // 将mainTask 标记为取消
        mainTask.isCancelled = true;

        // 取消当前正在执行的effect - 这会将取消传播到任何被调用的任务
        // next.canncel: 是动态的, 在runEffect时加载, 用于取消当前正在运行的effect
        next.cancel();

        // 结束执行, 并返回最终的结果
        result = is.func(iterator.return)
          ? iterator.return(TASK_CANCEL)
          : { done: true, value: TASK_CANCEL };
      } else if (arg === CHANNEL_END) {
        //
        // channel 关闭 - 通知iterator执行结束
        //

        // We get CHANNEL_END by taking from a channel that ended using `take` (and not `takem` used to trap End of channels)
        result = is.func(iterator.return) ? iterator.return() : { done: true };
      } else {
        //
        // 继续执行saga generator, 获得执行结果
        //
        result = iterator.next(arg);
      }

      debugger
      if (!result.done) {
        // 如果iterator未执行完成, 那么说明有effect需要处理
        runEffect(result.value, parentEffectId, "", next);
      } else {
        // 标记generator 执行完成
        mainTask.isMainRunning = false;

        // 通知队列, 任务完成
        mainTask.cont && mainTask.cont(result.value);
      }
    } catch (error) {
      // 如果已被取消, 那么需要打印错误日志
      if (mainTask.isCancelled) {
        logError(error);
      }

      // 标记generator 执行完成
      mainTask.isMainRunning = false;

      // 通知队列, 任务完成
      mainTask.cont(error, true);
    }
  }

  /**
   * 当generator中的所有任务执行完毕之后触发
   * @param {Any} result
   * @param {Boolean} isError 是否发生错误
   */
  function end(result, isErr) {
    // 运行结束
    iterator._isRunning = false;

    // 关闭channel
    stdChannel.close();

    if (!isErr) {
      // 没有发生错误, 保存结果
      // 执行回调函数
      iterator._result = result;
      iterator._deferredEnd && iterator._deferredEnd.resolve(result);
    } else {
      if (result instanceof Error) {
        Object.defineProperty(result, "sagaStack", {
          value: `at ${name} \n ${result.sagaStack || result.stack}`,
          configurable: true
        });
      }

      //
      if (!task.cont) {
        if (result instanceof Error && onError) {
          onError(result);
        } else {
          logError(result);
        }
      }

      iterator._error = result;
      iterator._isAborted = true;

      // 执行回调函数
      iterator._deferredEnd && iterator._deferredEnd.reject(result);
    }

    // 如果需要通知父级, 那么就通知父级 ( fork 通常是要等到子的结束才能结束的 ))
    task.cont && task.cont(result, isErr);

    // 通知等待结果的任务
    task.joiners.forEach(j => j.cb(result, isErr));

    // 清空集合
    task.joiners = null;
  }

  /**
   * 运行 effect
   * @param {Object} effect
   * @param {Number} parentEffectId
   * @param {String} label
   * @param {Function} cb effect执行完成之后的回调函数
   */
  function runEffect(effect, parentEffectId, label = "", cb) {
    //
    // 生成 effect id
    //
    const effectId = nextEffectId();

    sagaMonitor &&
      sagaMonitor.effectTriggered({ effectId, parentEffectId, label, effect });

    /**
     * done 标识
     * 执行"完成"回调函数和执行"取消"回调函数是互斥的操作
     */
    let effectSettled;

    /**
     * "完成"回调函数
     * @param {Any} res 结果
     * @param {Boolean} isErr 是否发生错误
     */
    function currCb(res, isErr) {
      if (effectSettled) {
        return;
      }

      effectSettled = true;

      // effect 运行完毕, 就不能取消
      cb.cancel = noop; // defensive measure

      if (sagaMonitor) {
        isErr
          ? sagaMonitor.effectRejected(effectId, res)
          : sagaMonitor.effectResolved(effectId, res);
      }

      cb(res, isErr);
    }

    // tracks down the current cancel
    currCb.cancel = noop;

    /**
     * "取消"回调函数
     * 将effect的"取消"逻辑安装到父级的cb, 方便父级取消时能取消当前的effect
     *
     * 不同的effect可以自定义cancel逻辑
     */
    cb.cancel = () => {
      // prevents cancelling an already completed effect
      if (effectSettled) {
        return;
      }

      effectSettled = true;

      /**
       * 向下传播取消操作 - 取消子effect
       *
       */
      try {
        currCb.cancel();
      } catch (err) {
        logError(err);
      }

      currCb.cancel = noop; // defensive measure

      sagaMonitor && sagaMonitor.effectCancelled(effectId);
    };

    /**
      each effect runner must attach its own logic of cancellation to the provided callback
      it allows this generator to propagate cancellation downward.

      ATTENTION! effect runners must setup the cancel logic by setting cb.cancel = [cancelMethod]
      And the setup must occur before calling the callback

      This is a sort of inversion of control: called async functions are responsible
      for completing the flow by calling the provided continuation; while caller functions
      are responsible for aborting the current flow by calling the attached cancel function

      Library users can attach their own cancellation logic to promises by defining a
      promise[CANCEL] method in their returned promises
      ATTENTION! calling cancel must have no effect on an already completed or cancelled effect
    **/
    let data;

    // prettier-ignore
    //
    // 根据effect的类型, 调用相关的函数运行effect
    //
    return (
      // Non declarative effect
        is.promise(effect)                      ? resolvePromise(effect, currCb)
      : is.helper(effect)                       ? runForkEffect(wrapHelper(effect), effectId, currCb)
      : is.iterator(effect)                     ? resolveIterator(effect, effectId, name, currCb)

      // declarative effects
      : is.array(effect)                        ? runParallelEffect(effect, effectId, currCb)
      : (data = asEffect.take(effect))          ? runTakeEffect(data, currCb)
      : (data = asEffect.put(effect))           ? runPutEffect(data, currCb)
      : (data = asEffect.all(effect))           ? runAllEffect(data, effectId, currCb)
      : (data = asEffect.race(effect))          ? runRaceEffect(data, effectId, currCb)
      : (data = asEffect.call(effect))          ? runCallEffect(data, effectId, currCb)
      : (data = asEffect.cps(effect))           ? runCPSEffect(data, currCb)
      : (data = asEffect.fork(effect))          ? runForkEffect(data, effectId, currCb)
      : (data = asEffect.join(effect))          ? runJoinEffect(data, currCb)
      : (data = asEffect.cancel(effect))        ? runCancelEffect(data, currCb)
      : (data = asEffect.select(effect))        ? runSelectEffect(data, currCb)
      : (data = asEffect.actionChannel(effect)) ? runChannelEffect(data, currCb)
      : (data = asEffect.flush(effect))         ? runFlushEffect(data, currCb)
      : (data = asEffect.cancelled(effect))     ? runCancelledEffect(data, currCb)
      : (data = asEffect.getContext(effect))    ? runGetContextEffect(data, currCb)
      : (data = asEffect.setContext(effect))    ? runSetContextEffect(data, currCb)
      : /* anything else returned as is */        currCb(effect)
    )
  }

  /**
   * 解析 Promise - 执行promise, 将最终的结果传递给回调函数
   * @param {Promise} promise promise
   * @param {Function} cb 回调函数
   */
  function resolvePromise(promise, cb) {
    // 自定义的取消逻辑
    const cancelPromise = promise[CANCEL];
    
    if (is.func(cancelPromise)) {
      cb.cancel = cancelPromise;
    } else if (is.func(promise.abort)) {
      cb.cancel = () => promise.abort();
      // TODO: add support for the fetch API, whenever they get around to
      // adding cancel support
    }

    promise.then(cb, error => cb(error, true));
  }

  /**
   * 解析Iterator - 创建&&运行一个新进程
   * @param {Generator} iterator generator对象
   * @param {Number} effectId process id
   * @param {String} name 名称
   * @param {Function} cb 当Proc完成时的回调函数
   */
  function resolveIterator(iterator, effectId, name, cb) {
    proc(
      iterator,
      subscribe,
      dispatch,
      getState,
      taskContext,
      options,
      effectId,
      name,
      cb
    );
  }

  /**
   * 运行 take effect
   * subscribe 指定channel中匹配指定pattern的input
   *
   * [阻塞] take 会阻塞后续代码的执行, 只有等到监听的消息触发时, 才会继续执行后续代码
   *
   * @param {Object} args 参数
   * @param {Object} args.channel 通信渠道
   * @param {String|Array} args.pattern 匹配规则
   * @param {Boolean} args.maybe
   * @param {Function} cb 回调函数
   */
  function runTakeEffect({ channel, pattern, maybe }, cb) {
    // 1. 设置渠道, 默认为stdChannel
    channel = channel || stdChannel;

    // prettier-ignore
    // 这里会等到有emit时,再继续执行iterator
    const takeCb = inp =>
      inp instanceof Error
        ? cb(inp, true)           // 发生错误
        : isEnd(inp) && !maybe    // maybe = true, 不会终止saga
          ? cb(CHANNEL_END)       // channel is end
          : cb(inp);

    try {
      //
      channel.take(takeCb, matcher(pattern));
    } catch (err) {
      return cb(err, true);
    }

    cb.cancel = takeCb.cancel;
  }

  /**
   * 运行 put effect
   * 发送action
   * 1. channel为空, 向store发送一个action
   * 2. channel非空, 向channel发送一个action
   *
   * @param {Object} args 参数
   * @param {Object} args.channel 通信渠道
   * @param {String|Array} args.action action
   * @param {Boolean} args.resolve
   * @param {Function} cb 回调函数 (action:Object) -> void
   */
  function runPutEffect({ channel, action, resolve }, cb) {
    /**
     * put 操作
     * 必须以"原子性"的方式执行 FIFO
     * 即嵌套的put必须在等parent put执行完之后再执行
     */
    asap(() => {
      let result;

      try {
        result = (channel ? channel.put : dispatch)(action);
      } catch (error) {
        // If we have a channel or `put.resolve` was used then bubble up the error.
        if (channel || resolve) return cb(error, true);
        logError(error);
      }

      // 以异步的方式处理
      if (resolve && is.promise(result)) {
        resolvePromise(result, cb);
      } else {
        return cb(result);
      }
    });
    // Put effects are non cancellables
  }

  /**
   * 运行 call effect
   * 以参数args调用函数fn - 会自动处理promies,iterator
   * @param {Object} args 参数
   * @param {Object} args.context 上下文对象
   * @param {String|Array} args.fn 调用函数, 可以是Generator Function or normal Function
   * @param {Boolean} args.args 调用函数时传递的参数
   * @param {Function} cb 回调函数 (result:any) -> void 返回执行结果
   */
  function runCallEffect({ context, fn, args }, effectId, cb) {
    let result;

    // catch synchronous failures; see #152
    // 同步执行
    try {
      result = fn.apply(context, args);
    } catch (error) {
      return cb(error, true);
    }

    // 处理结果
    return is.promise(result)
      ? resolvePromise(result, cb)
      : is.iterator(result)
        ? resolveIterator(result, effectId, fn.name, cb)
        : cb(result);
  }

  /**
   * 运行 cps effect
   *
   * @param {Object} args 参数
   * @param {Object} args.context 上下文对象
   * @param {String|Array} args.fn 调用函数, 可以是Generator Function or normal Function
   * @param {Boolean} args.args 调用函数时传递的参数
   * @param {Function} cb 回调函数 (result:any) -> void 返回执行结果
   */
  function runCPSEffect({ context, fn, args }, cb) {
    // CPS (ie node style functions) can define their own cancellation logic
    // by setting cancel field on the cb

    // catch synchronous failures; see #152
    try {
      // 创建cps callback
      const cpsCb = (err, res) => (is.undef(err) ? cb(res) : cb(err, true));

      // 执行函数
      fn.apply(context, args.concat(cpsCb));

      // 自定义cancel
      if (cpsCb.cancel) {
        cb.cancel = () => cpsCb.cancel();
      }
    } catch (error) {
      return cb(error, true);
    }
  }

  /**
   * 运行 fork effect ( 不能被取消 )
   * @param {Object} args 参数
   * @param {Object} args.context 上下文对象
   * @param {String|Array} args.fn 调用函数, 可以是Generator Function or normal Function
   * @param {Boolean} args.args 调用函数时传递的参数
   * @param {Boolean} detached 是否detached task
   * @param {Function} cb 回调函数 (result:any) -> void 返回执行结果
   */
  function runForkEffect({ context, fn, args, detached }, effectId, cb) {
    // 创建一个task iterator
    // 第一次 next(): 返回effect 对象
    // 第二次 next(): 返回将传递给next的参数, 作为最终的返回结果
    const taskIterator = createTaskIterator({ context, fn, args });

    try {
      suspend();

      // 创建一个任务
      const task = proc(
        taskIterator,
        subscribe,
        dispatch,
        getState,
        taskContext,
        options,
        effectId,
        fn.name,
        detached ? null : noop
      );

      if (detached) {
        //
        // detached task: 单独的task,与parent task无关
        // - completed 与arent task无关
        // - abort     与parent task无关
        // - cancel    与parent task无关
        //
        cb(task);
      } else {
        if (taskIterator._isRunning) {
          // 如果 运行中(未结束
          // 那么 添加到forks中
          taskQueue.addTask(task);
          cb(task);
        } else if (taskIterator._error) {
          // 如果 发生错误
          // 那么 终止运行 - 取消所有forks
          taskQueue.abort(taskIterator._error);

          // 没有调用cb
          // 因为, abort会调用 end
          // 这里, 不调用是为了避免重复调用
        } else {
          // 如果 运行结束
          // 那么 只返回task
          cb(task);
        }
      }
    } finally {
      flush();
    }
    // Fork effects are non cancellables
  }

  /**
   * 运行 join effect
   * @param {Task} t
   * @param {Function} cb 回调函数 (result:any) -> void 返回执行结果
   */
  function runJoinEffect(t, cb) {
    if (t.isRunning()) {
      // task 还未结束
      const joiner = { task, cb };

      // 注册取消逻辑
      cb.cancel = () => remove(t.joiners, joiner);

      // 加入到等待队列
      t.joiners.push(joiner);
    } else {
      // task 被终止 - 抛出异常
      // task 已完成 - 返回结果
      t.isAborted() ? cb(t.error(), true) : cb(t.result());
    }
  }

  /**
   * run cancel effect
   * 取消任务
   * 若要取消正在运行的任务，middleware 将调用底层 Generator 对象上的 return。这将取消任务中的当前 Effect，并跳转至 finally 区块
   * @param {Task} taskToCancel 要取消的任务
   * @param {Function} cb 回调函数 (result:any) -> void
   */
  function runCancelEffect(taskToCancel, cb) {
    
    if (taskToCancel === SELF_CANCELLATION) {
      taskToCancel = task;
    }

    if (taskToCancel.isRunning()) {
      taskToCancel.cancel();
    }
    cb();
    // cancel effects are non cancellables
  }

  /**
   * combinator: all
   *
   * @param {Iterator[]} effects
   * @param {Number} effectId
   * @param {Function} cb 回调函数 (result:any) -> void
   */
  function runAllEffect(effects, effectId, cb) {
    const keys = Object.keys(effects);

    if (!keys.length) {
      return cb(is.array(effects) ? [] : {});
    }

    let completedCount = 0;
    let completed;
    const results = {};
    const childCbs = {};

    function checkEffectEnd() {
      if (completedCount === keys.length) {
        completed = true;
        cb(
          is.array(effects)
            ? array.from({ ...results, length: keys.length })
            : results
        );
      }
    }

    keys.forEach(key => {
      const chCbAtKey = (res, isErr) => {
        if (completed) {
          return;
        }
        if (isErr || isEnd(res) || res === CHANNEL_END || res === TASK_CANCEL) {
          cb.cancel();
          cb(res, isErr);
        } else {
          results[key] = res;
          completedCount++;
          checkEffectEnd();
        }
      };
      chCbAtKey.cancel = noop;
      childCbs[key] = chCbAtKey;
    });

    cb.cancel = () => {
      if (!completed) {
        completed = true;
        keys.forEach(key => childCbs[key].cancel());
      }
    };

    keys.forEach(key => runEffect(effects[key], effectId, key, childCbs[key]));
  }

  /**
   * combinator: race
   * 在多个Effect间进行竞争运行
   * @param {Iterator[]} effects 一个或多个effects
   * @param {Number} effectId
   * @param {Function} cb 回调函数 (result:any) -> void
   */
  function runRaceEffect(effects, effectId, cb) {
    let completed;
    const keys = Object.keys(effects);
    const childCbs = {};

    //
    // 包装回调函数
    //
    keys.forEach(key => {
      const chCbAtKey = (res, isErr) => {
        if (completed) {
          return;
        }

        if (isErr) {
          // 发生错误, 自动取消
          cb.cancel();
          cb(res, true);
        } else if (!isEnd(res) && res !== CHANNEL_END && res !== TASK_CANCEL) {
          // 取消其他effect
          cb.cancel();

          // 标记为完成
          completed = true;

          // 创建响应
          const response = { [key]: res };

          cb(
            is.array(effects)
              ? [].slice.call({ ...response, length: keys.length })
              : response
          );
        }
      };

      chCbAtKey.cancel = noop;
      childCbs[key] = chCbAtKey;
    });

    //
    // 包装取消函数
    //
    cb.cancel = () => {
      // prevents unnecessary cancellation
      if (!completed) {
        completed = true;
        keys.forEach(key => childCbs[key].cancel());
      }
    };

    //
    // 执行
    //
    keys.forEach(key => {
      if (completed) {
        return;
      }
      runEffect(effects[key], effectId, key, childCbs[key]);
    });
  }

  /**
   * 运行 select effect
   *
   * @param {Object} args 参数
   * @param {Object} args.selector state选择器
   * @param {Boolean} args.args 传递给selector的参数
   * @param {Function} cb 回调函数 (result:any) -> void 返回执行结果,即选择出的状态
   */
  function runSelectEffect({ selector, args }, cb) {
    try {
      const state = selector(getState(), ...args);
      cb(state);
    } catch (error) {
      cb(error, true);
    }
  }

  /**
   * 运行 actionChannel effect
   * 当接受到匹配pattern的action时, 使用创建的eventChannel进行队列式无阻塞I/O操作
   *
   * @param {Object} args 参数
   * @param {Object} args.pattern 匹配模式
   * @param {String|Array} [args.buffer] channel使用的buffer, 默认为fixed()
   * @param {Function} cb 回调函数 (channel:Object) -> void 参数为执行结果
   */
  function runChannelEffect({ pattern, buffer }, cb) {
    const match = matcher(pattern);

    match.pattern = pattern;

    cb(eventChannel(subscribe, buffer || buffers.fixed(), match));
  }

  /**
   * 运行 cancelled effect
   * 返回主任务(generator)是否已经被取消
   * @param {*} data
   * @param {Function} cb 回调函数 (channel:Object) -> void 参数为执行结果
   */
  function runCancelledEffect(data, cb) {
    cb(!!mainTask.isCancelled);
  }

  /**
   * channel flush
   * @param {Channel} channel 通信渠道
   * @param {Function} cb 回调函数 (channel:Object) -> void 参数为执行结果
   */
  function runFlushEffect(channel, cb) {
    channel.flush(cb);
  }

  /**
   * run getContext effect
   * 获得taskContext的上下文
   * @param {String} prop 属性名
   * @param {Function} cb 回调函数 (channel:Object) -> void 参数为执行结果
   */
  function runGetContextEffect(prop, cb) {
    cb(taskContext[prop]);
  }

  /**
   * 设置 setContext effect
   * @param {Object} props 更新的上下文
   * @param {Function} cb 回调函数 (channel:Object) -> void 参数为执行结果
   */
  function runSetContextEffect(props, cb) {
    object.assign(taskContext, props);
    cb();
  }

  /**
   * 创建一个新的Task对象
   * @param {Number} id 任务的ID ( saga ID )
   * @param {String} name 任务的名称
   * @param {Generator} iterator 任务的generator对象, 包含任务的执行内容
   * @param {Function} cont
   * @returns {Task} 返回一个Task对象
   */
  function newTask(id, name, iterator, cont) {
    iterator._deferredEnd = null;

    return {
      /**
       * 任务标志
       */
      [TASK]: true,

      /**
       * 任务ID - 用来标志task属于哪一个saga
       */
      id,

      /**
       * 任务名
       */
      name,

      /**
       * 获得最终的结果, 返回一个Promise
       * @returns {Promise}
       */
      get done() {
        if (iterator._deferredEnd) {
          // 返回promise
          return iterator._deferredEnd.promise;
        } else {
          // 创建def对象
          const def = deferred();

          // 设置def对象, 当task执行完毕之后, 会调用resolve/reject方法 传递结果给task对象
          iterator._deferredEnd = def;

          // 如果运行已经结束, 那么立即返回结果
          if (!iterator._isRunning) {
            iterator._error
              ? def.reject(iterator._error)
              : def.resolve(iterator._result);
          }

          // 返回 promise
          return def.promise;
        }
      },

      /**
       *
       */
      cont,

      /**
       * 记录等待任务执行结果的任务
       * @type {Object}
       */
      joiners: [],

      /**
       * 取消任务
       */
      cancel,

      /**
       * 是否正在运行
       * @returns {Boolean}
       */
      isRunning: () => iterator._isRunning,

      /**
       * 是否已经取消
       * @returns {Boolean}
       */
      isCancelled: () => iterator._isCancelled,

      /**
       * 是否已经终止
       * @returns {Boolean}
       */
      isAborted: () => iterator._isAborted,

      /**
       * 获得执行结果
       * @returns {Any}
       */
      result: () => iterator._result,

      /**
       * 获得执行过程中产生的错误对象
       * @returns {Error}
       */
      error: () => iterator._error,

      /**
       * 设置Task的上下文 ( 以merge的方式 )
       * @param {Object} props
       */
      setContext(props) {
        check(props, is.object, createSetContextWarning("task", props));
        object.assign(taskContext, props);
      }
    };
  }
}
