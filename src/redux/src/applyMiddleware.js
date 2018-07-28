import compose from "./compose";

/**
 * Creates a store enhancer that applies middleware to the dispatch method
 * of the Redux store. This is handy for a variety of tasks, such as expressing
 * asynchronous actions in a concise manner, or logging every action payload.
 *
 * See `redux-thunk` package as an example of the Redux middleware.
 *
 * Because middleware is potentially asynchronous, this should be the first
 * store enhancer in the composition chain.
 *
 * Note that each middleware will be given the `dispatch` and `getState` functions
 * as named arguments.
 *
 * @param {...Function} middlewares The middleware chain to be applied.
 * @returns {Function} A store enhancer applying the middleware.
 */
export default function applyMiddleware(...middlewares) {
  /**
   * wrapper: 返回一个包装了createStore参数的函数
   * (createStore) => ...
   *
   * wrapper: 返回一个包装了指定参数的store
   * (reducer:Function, preloadedState:any, enhancer:Function) => {getState,dispatch}
   *
   * middleware 格式(洋葱):
   * (middlewareAPI)=>(next)=>(action)=> ...
   *
   * middlewareAPI: 提供的API
   * next:          下一个中间件
   * aciton:        接收到的action
   *
   * 使用方法1:
   * store = createStore(reducer,preloadedState,applyMiddleware(...middlewares))
   *
   * 使用方法2:
   * store = applyMiddleware(...middlewares)(createStore)(reducer, preloadedState, enhancer)
   */
  return createStore => (reducer, preloadedState, enhancer) => {
    // 用Store工厂方法createStore创建一个store
    var store = createStore(reducer, preloadedState, enhancer);

    // 原始的dispatch
    var dispatch = store.dispatch;

    // 存储
    var chain = [];

    // 提供给中间件使用的API
    var middlewareAPI = {
      // 获得store的状态
      getState: store.getState,

      // action分发函数
      dispatch: action => dispatch(action)
    };

    // 剥第一层洋葱: 绑定 midllewareAPI
    // 返回值: [next=>action=> ... , next=>action=> ... , ... ]
    chain = middlewares.map(middleware => middleware(middlewareAPI));

    // 剥第二层洋葱: 链接各个中间件
    // 返回值: (action) => chainHead(action)
    //
    // 链接过程
    // compose -> restMiddleware.reduceRight(
    //                  (r,m)=>m(r),
    //                  lastMiddleware(store.dispatch)
    //            )
    //
    // 链结构: head -> middleware1 -> middleware2 -> ... -> middlewareN
    //
    //  1. lastMiddleware(store.dispatch)      -> 剥洋葱: next = store.dispatch , (action)=> N
    //  2. middleware[last-1]((action)=> N)    -> 剥洋葱: next = (action)=> N   , (action)=> N - 1
    //  ...
    //  N. middleware[first]((action)=> 2)     -> 剥洋葱: next = (action)=> 2   , (action)=> 1
    //
    //  m1: api=>next=>action=>{ console.log(1); next(action) } // next=m2
    //  m2: api=>next=>action=>{ console.log(2); next(action) } // next=m2
    //  m3: api=>next=>action=>{ console.log(3); next(action) } // next=store.dispatch
    //
    //  store = applyMiddleware(m1,m2,m3)(createStore)(rootReducer)
    //  打印:
    //    1
    //    2
    //    3
    //  store.dispatch({type:'INIT'})
    dispatch = compose(...chain)(store.dispatch);

    // 返回 wraped store
    return {
      ...store,
      dispatch
    };
  };
}
