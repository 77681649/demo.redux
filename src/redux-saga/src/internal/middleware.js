import { is, check, object, createSetContextWarning } from "./utils";
import { emitter } from "./channel";
import { ident } from "./utils";
import { runSaga } from "./runSaga";

/**
 *
 * @param {Object} [config] 中间件的配置
 * @param {Object} [config.context]
 * @param {Object} [config.options]
 * @param {Object} [config.options.sagaMonitor]
 * @param {Function} [config.options.emitter]
 * @param {Function} [config.options.logger] 自定义的错误日志方法(默认输出在控制台) (level message,error)=>void
 * @param {Function} [config.options.onError] 自定义的错误处理方法(默认是输出日志) (result)=>void
 */
export default function sagaMiddlewareFactory({
  context = {},
  ...options
} = {}) {
  const { sagaMonitor, logger, onError } = options;

  //
  // ---------------------------------------- 检查参数
  //
  if (is.func(options)) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "Saga middleware no longer accept Generator functions. Use sagaMiddleware.run instead"
      );
    } else {
      throw new Error(
        `You passed a function to the Saga middleware. You are likely trying to start a\
        Saga by directly passing it to the middleware. This is no longer possible starting from 0.10.0.\
        To run a Saga, you must do it dynamically AFTER mounting the middleware into the store.
        Example:
          import createSagaMiddleware from 'redux-saga'
          ... other imports

          const sagaMiddleware = createSagaMiddleware()
          const store = createStore(reducer, applyMiddleware(sagaMiddleware))
          sagaMiddleware.run(saga, ...args)
      `
      );
    }
  }

  if (logger && !is.func(logger)) {
    throw new Error(
      "`options.logger` passed to the Saga middleware is not a function!"
    );
  }

  if (process.env.NODE_ENV === "development" && options.onerror) {
    throw new Error(
      "`options.onerror` was removed. Use `options.onError` instead."
    );
  }

  if (onError && !is.func(onError)) {
    throw new Error(
      "`options.onError` passed to the Saga middleware is not a function!"
    );
  }

  if (options.emitter && !is.func(options.emitter)) {
    throw new Error(
      "`options.emitter` passed to the Saga middleware is not a function!"
    );
  }

  //
  // ---------------------------------------- 创建saga中间件
  //
  function sagaMiddleware({ getState, dispatch }) {
    /**
     *
     */
    const sagaEmitter = emitter();
    sagaEmitter.emit = (options.emitter || ident)(sagaEmitter.emit);

    /**
     * 绑定redux-store接口
     */
    sagaMiddleware.run = runSaga.bind(null, {
      context,
      subscribe: sagaEmitter.subscribe,
      dispatch,
      getState,
      sagaMonitor,
      logger,
      onError
    });

    /**
     * saga middleware
     */
    return next => action => {
      // 1. 发送监控事件
      if (sagaMonitor && sagaMonitor.actionDispatched) {
        sagaMonitor.actionDispatched(action);
      }

      // 2. 执行后序中间件 hit reducers ( 为了让该事件能传递到reducer )
      const result = next(action);

      // 3. 触发 action
      sagaEmitter.emit(action);

      return result;
    };
  }

  /**
   *
   */
  sagaMiddleware.run = () => {
    throw new Error(
      "Before running a Saga, you must mount the Saga middleware on the Store using applyMiddleware"
    );
  };

  /**
   *
   * @param {Object} props
   */
  sagaMiddleware.setContext = props => {
    check(props, is.object, createSetContextWarning("sagaMiddleware", props));
    object.assign(context, props);
  };

  return sagaMiddleware;
}
