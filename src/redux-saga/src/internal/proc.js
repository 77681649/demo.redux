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
 * @property {Promise} _deferredEnd
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
  wildcard: () => kTrue,
  default: pattern =>
    typeof pattern === "symbol"
      ? input => input.type === pattern
      : input => input.type === String(pattern),
  array: patterns => input => patterns.some(p => matcher(p)(input)),
  predicate: predicate => input => predicate(input)
};

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
  Used to track a parent task and its forks
  In the new fork model, forked tasks are attached by default to their parent
  We model this using the concept of Parent task && main Task
  main task is the main flow of the current Generator, the parent tasks is the
  aggregation of the main tasks + all its forked tasks.
  Thus the whole model represents an execution tree with multiple branches (vs the
  linear execution tree in sequential (non parallel) programming)

  A parent tasks has the following semantics
  - It completes if all its forks either complete or all cancelled
  - If it's cancelled, all forks are cancelled as well
  - It aborts if any uncaught error bubbles up from forks
  - If it completes, the return value is the one returned by the main task
**/

/**
 * 创建pending队列
 *  1. 负责管理fork task
 *  2. 负责在main task && fork task执行完成之后, 调用cb返回结果
 * @param {String} name 队列的名称
 * @param {MainTask} mainTask 主任务对象
 * @param {Function} [cb] 当队列中的任务执行完成或者被终止时调用 (res:Error|any,isErr:Boolean)
 * @returns {Object} 返回队列对象
 */
function forkQueue(name, mainTask, cb) {
  let tasks = [], // pending tasks
    result, // 最终的结果
    completed = false; // 是否执行完毕

  //
  // 将mainTask添加到队列中
  //
  addTask(mainTask);

  /**
   * 终止 - 取消所有pending task && 返回结果
   * @param {*} err
   */
  function abort(err) {
    cancelAll();

    // 调用回调函数
    cb(err, true);
  }

  /**
   * 向队列中添加pending task
   * @param {MainTask|Task} task
   */
  function addTask(task) {
    tasks.push(task);

    /**
     * 任务完成
     * @param {Any} res 运行结果
     * @param {Boolean} isErr 运行过程中是否发生错误
     */
    task.cont = (res, isErr) => {
      if (completed) {
        return;
      }

      // 从队列中删除
      remove(tasks, task);

      // 断开连接 - 避免多次调用导致问题
      task.cont = noop;

      if (isErr) {
        //
        // 如果发生错误, 那么终止整个任务
        //
        abort(res);
      } else {
        // 如果是主任务完成, 将res作为最终的结果
        if (task === mainTask) {
          result = res;
        }

        // pending queue空, 将队列标记为完成
        if (!tasks.length) {
          completed = true;

          // 调用回调函数
          cb(result);
        }
      }
    };
    // task.cont.cancel = task.cancel
  }

  /**
   * 取消
   */
  function cancelAll() {
    if (completed) {
      return;
    }

    completed = true;

    tasks.forEach(t => {
      t.cont = noop;
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
 *
 * @param {*} param0
 */
function createTaskIterator({ context, fn, args }) {
  if (is.iterator(fn)) {
    return fn;
  }

  // catch synchronous failures; see #152 and #441
  let result, error;
  try {
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
        throw error;
      })
    : makeIterator(
        (function() {
          let pc;
          const eff = { done: false, value: result };
          const ret = value => ({ done: true, value });
          return arg => {
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

const wrapHelper = helper => ({ fn: helper });

/**
 * 创建并运行一个task
 * @param {Iterator} iterator saga 生成器对象
 * @param {Function} subscribe emitter.subscribe emitter 订阅函数
 * @param {Function} dispatch action
 * @param {Function} getState action
 * @param {Object} parentContext 上下文
 * @param {Object} options 选项
 * @param {Number} parentEffectId id
 * @param {String} name saga的名称
 * @param {} cont
 * @returns {Task}
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

  //
  // 生成error日志函数
  //
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

  //
  // 创建 channel
  //
  const stdChannel = _stdChannel(subscribe);

  //
  // 创建 task的上下文对象
  //
  const taskContext = Object.create(parentContext);

  /**
    Tracks the current effect cancellation
    Each time the generator progresses. calling runEffect will set a new value
    on it. It allows propagating cancellation to child effects
  **/
  next.cancel = noop;

  //
  // 为generator对象创建一个task对象.
  //
  const task = newTask(parentEffectId, name, iterator, cont);

  //
  // 创建一个跟踪主流程的Main Task
  // We'll also create a main task to track the main flow (besides other forked tasks)
  //
  const mainTask = {
    name,
    cancel: cancelMain,
    isRunning: true
  };

  //
  // 创建一个 task queue
  //
  const taskQueue = forkQueue(name, mainTask, end);

  /**
   * 取消 main task
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
   * 取消任务
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
  cont && (cont.cancel = cancel);

  // tracks the running status
  iterator._isRunning = true;

  // kicks up the generator
  next();

  // then return the task descriptor to the caller
  return task;

  /**
    This is the generator driver
    It's a recursive async/continuation function which calls itself
    until the generator terminates or throws
  **/

  /**
   * 执行 generator
   * @param {Object} [arg] 动作标志,
   * @param {Boolean} [isErr=false] 是否发生了错误
   */
  function next(arg, isErr) {
    // Preventive measure. If we end up here, then there is really something wrong
    if (!mainTask.isRunning) {
      throw new Error("Trying to resume an already finished generator");
    }

    try {
      let result;

      if (isErr) {
        // 发生错误, 通知generator内部
        result = iterator.throw(arg);
      } else if (arg === TASK_CANCEL) {
        /**
         * 实现取消操作
         */

        // 将mainTask 标记为取消
        mainTask.isCancelled = true;

        /**
          Cancels the current effect; this will propagate the cancellation down to any called tasks
        **/
        next.cancel();

        /**
          If this Generator has a `return` method then invokes it
          This will jump to the finally block
        **/
        result = is.func(iterator.return)
          ? iterator.return(TASK_CANCEL)
          : { done: true, value: TASK_CANCEL };
      } else if (arg === CHANNEL_END) {
        // We get CHANNEL_END by taking from a channel that ended using `take` (and not `takem` used to trap End of channels)
        result = is.func(iterator.return) ? iterator.return() : { done: true };
      } else {
        result = iterator.next(arg);
      }

      if (!result.done) {
        runEffect(result.value, parentEffectId, "", next);
      } else {
        /**
          This Generator has ended, terminate the main task and notify the fork queue
        **/
        mainTask.isMainRunning = false;
        mainTask.cont && mainTask.cont(result.value);
      }
    } catch (error) {
      if (mainTask.isCancelled) {
        logError(error);
      }
      mainTask.isMainRunning = false;
      mainTask.cont(error, true);
    }
  }

  /**
   *
   */
  function end(result, isErr) {
    iterator._isRunning = false;
    stdChannel.close();
    if (!isErr) {
      iterator._result = result;
      iterator._deferredEnd && iterator._deferredEnd.resolve(result);
    } else {
      if (result instanceof Error) {
        Object.defineProperty(result, "sagaStack", {
          value: `at ${name} \n ${result.sagaStack || result.stack}`,
          configurable: true
        });
      }
      if (!task.cont) {
        if (result instanceof Error && onError) {
          onError(result);
        } else {
          logError(result);
        }
      }
      iterator._error = result;
      iterator._isAborted = true;
      iterator._deferredEnd && iterator._deferredEnd.reject(result);
    }
    task.cont && task.cont(result, isErr);
    task.joiners.forEach(j => j.cb(result, isErr));
    task.joiners = null;
  }

  /**
   *
   */
  function runEffect(effect, parentEffectId, label = "", cb) {
    const effectId = nextEffectId();
    sagaMonitor &&
      sagaMonitor.effectTriggered({ effectId, parentEffectId, label, effect });

    /**
      completion callback and cancel callback are mutually exclusive
      We can't cancel an already completed effect
      And We can't complete an already cancelled effectId
    **/
    let effectSettled;

    // Completion callback passed to the appropriate effect runner
    function currCb(res, isErr) {
      if (effectSettled) {
        return;
      }

      effectSettled = true;
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

    // setup cancellation logic on the parent cb
    cb.cancel = () => {
      // prevents cancelling an already completed effect
      if (effectSettled) {
        return;
      }

      effectSettled = true;
      /**
        propagates cancel downward
        catch uncaught cancellations errors; since we can no longer call the completion
        callback, log errors raised during cancellations into the console
      **/
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
   *
   * @param {*} promise
   * @param {*} cb
   */
  function resolvePromise(promise, cb) {
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
   *
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
   *
   */
  function runTakeEffect({ channel, pattern, maybe }, cb) {
    channel = channel || stdChannel;
    const takeCb = inp =>
      inp instanceof Error
        ? cb(inp, true)
        : isEnd(inp) && !maybe
          ? cb(CHANNEL_END)
          : cb(inp);
    try {
      channel.take(takeCb, matcher(pattern));
    } catch (err) {
      return cb(err, true);
    }
    cb.cancel = takeCb.cancel;
  }

  /**
   *
   */
  function runPutEffect({ channel, action, resolve }, cb) {
    /**
      Schedule the put in case another saga is holding a lock.
      The put will be executed atomically. ie nested puts will execute after
      this put has terminated.
    **/
    asap(() => {
      let result;
      try {
        result = (channel ? channel.put : dispatch)(action);
      } catch (error) {
        // If we have a channel or `put.resolve` was used then bubble up the error.
        if (channel || resolve) return cb(error, true);
        logError(error);
      }

      if (resolve && is.promise(result)) {
        resolvePromise(result, cb);
      } else {
        return cb(result);
      }
    });
    // Put effects are non cancellables
  }

  /**
   *
   */
  function runCallEffect({ context, fn, args }, effectId, cb) {
    let result;
    // catch synchronous failures; see #152
    try {
      result = fn.apply(context, args);
    } catch (error) {
      return cb(error, true);
    }
    return is.promise(result)
      ? resolvePromise(result, cb)
      : is.iterator(result)
        ? resolveIterator(result, effectId, fn.name, cb)
        : cb(result);
  }

  /**
   *
   */
  function runCPSEffect({ context, fn, args }, cb) {
    // CPS (ie node style functions) can define their own cancellation logic
    // by setting cancel field on the cb

    // catch synchronous failures; see #152
    try {
      const cpsCb = (err, res) => (is.undef(err) ? cb(res) : cb(err, true));
      fn.apply(context, args.concat(cpsCb));
      if (cpsCb.cancel) {
        cb.cancel = () => cpsCb.cancel();
      }
    } catch (error) {
      return cb(error, true);
    }
  }

  /**
   *
   */
  function runForkEffect({ context, fn, args, detached }, effectId, cb) {
    const taskIterator = createTaskIterator({ context, fn, args });

    try {
      suspend();
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
        cb(task);
      } else {
        if (taskIterator._isRunning) {
          taskQueue.addTask(task);
          cb(task);
        } else if (taskIterator._error) {
          taskQueue.abort(taskIterator._error);
        } else {
          cb(task);
        }
      }
    } finally {
      flush();
    }
    // Fork effects are non cancellables
  }

  /**
   *
   */
  function runJoinEffect(t, cb) {
    if (t.isRunning()) {
      const joiner = { task, cb };
      cb.cancel = () => remove(t.joiners, joiner);
      t.joiners.push(joiner);
    } else {
      t.isAborted() ? cb(t.error(), true) : cb(t.result());
    }
  }

  /**
   *
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
   *
   * @param {*} effects
   * @param {*} effectId
   * @param {*} cb
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
   *
   * @param {*} effects
   * @param {*} effectId
   * @param {*} cb
   */
  function runRaceEffect(effects, effectId, cb) {
    let completed;
    const keys = Object.keys(effects);
    const childCbs = {};

    keys.forEach(key => {
      const chCbAtKey = (res, isErr) => {
        if (completed) {
          return;
        }

        if (isErr) {
          // Race Auto cancellation
          cb.cancel();
          cb(res, true);
        } else if (!isEnd(res) && res !== CHANNEL_END && res !== TASK_CANCEL) {
          cb.cancel();
          completed = true;
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

    cb.cancel = () => {
      // prevents unnecessary cancellation
      if (!completed) {
        completed = true;
        keys.forEach(key => childCbs[key].cancel());
      }
    };
    keys.forEach(key => {
      if (completed) {
        return;
      }
      runEffect(effects[key], effectId, key, childCbs[key]);
    });
  }

  /**
   *
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
   *
   */
  function runChannelEffect({ pattern, buffer }, cb) {
    const match = matcher(pattern);
    match.pattern = pattern;
    cb(eventChannel(subscribe, buffer || buffers.fixed(), match));
  }

  /**
   *
   * @param {*} data
   * @param {*} cb
   */
  function runCancelledEffect(data, cb) {
    cb(!!mainTask.isCancelled);
  }

  /**
   *
   * @param {*} channel
   * @param {*} cb
   */
  function runFlushEffect(channel, cb) {
    channel.flush(cb);
  }

  /**
   *
   */
  function runGetContextEffect(prop, cb) {
    cb(taskContext[prop]);
  }

  /**
   *
   */
  function runSetContextEffect(props, cb) {
    object.assign(taskContext, props);
    cb();
  }

  /**
   * 创建新的任务
   * @param {Number} id 任务ID ( saga ID )
   * @param {String} name 任务名称
   * @param {SagaIterator} iterator
   * @param {} cont
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
       *
       */
      get done() {
        if (iterator._deferredEnd) {
          return iterator._deferredEnd.promise;
        } else {
          const def = deferred();
          iterator._deferredEnd = def;
          if (!iterator._isRunning) {
            iterator._error
              ? def.reject(iterator._error)
              : def.resolve(iterator._result);
          }
          return def.promise;
        }
      },

      /**
       *
       */
      cont,

      /**
       *
       */
      joiners: [],

      /**
       * 任务取消操作
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
