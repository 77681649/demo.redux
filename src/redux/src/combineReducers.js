import { ActionTypes } from "./createStore";
import isPlainObject from "lodash/isPlainObject";
import warning from "./utils/warning";

function getUndefinedStateErrorMessage(key, action) {
  var actionType = action && action.type;
  var actionName = (actionType && `"${actionType.toString()}"`) || "an action";

  return (
    `Given action ${actionName}, reducer "${key}" returned undefined. ` +
    `To ignore an action, you must explicitly return the previous state.`
  );
}

function getUnexpectedStateShapeWarningMessage(
  inputState,
  reducers,
  action,
  unexpectedKeyCache
) {
  var reducerKeys = Object.keys(reducers);
  var argumentName =
    action && action.type === ActionTypes.INIT
      ? "preloadedState argument passed to createStore"
      : "previous state received by the reducer";

  if (reducerKeys.length === 0) {
    return (
      "Store does not have a valid reducer. Make sure the argument passed " +
      "to combineReducers is an object whose values are reducers."
    );
  }

  if (!isPlainObject(inputState)) {
    return (
      `The ${argumentName} has unexpected type of "` +
      {}.toString.call(inputState).match(/\s([a-z|A-Z]+)/)[1] +
      `". Expected argument to be an object with the following ` +
      `keys: "${reducerKeys.join('", "')}"`
    );
  }

  var unexpectedKeys = Object.keys(inputState).filter(
    key => !reducers.hasOwnProperty(key) && !unexpectedKeyCache[key]
  );

  unexpectedKeys.forEach(key => {
    unexpectedKeyCache[key] = true;
  });

  if (unexpectedKeys.length > 0) {
    return (
      `Unexpected ${unexpectedKeys.length > 1 ? "keys" : "key"} ` +
      `"${unexpectedKeys.join('", "')}" found in ${argumentName}. ` +
      `Expected to find one of the known reducer keys instead: ` +
      `"${reducerKeys.join('", "')}". Unexpected keys will be ignored.`
    );
  }
}

function assertReducerSanity(reducers) {
  Object.keys(reducers).forEach(key => {
    var reducer = reducers[key];

    //
    // 确保reducer会返回初始状态
    //
    var initialState = reducer(undefined, { type: ActionTypes.INIT });

    if (typeof initialState === "undefined") {
      throw new Error(
        `Reducer "${key}" returned undefined during initialization. ` +
          `If the state passed to the reducer is undefined, you must ` +
          `explicitly return the initial state. The initial state may ` +
          `not be undefined.`
      );
    }

    //
    // 确保 遇到未知的action时, 会返回初始状态 or 默认值
    //
    var type =
      "@@redux/PROBE_UNKNOWN_ACTION_" +
      Math.random()
        .toString(36)
        .substring(7)
        .split("")
        .join(".");

    if (typeof reducer(undefined, { type }) === "undefined") {
      throw new Error(
        `Reducer "${key}" returned undefined when probed with a random type. ` +
          `Don't try to handle ${
            ActionTypes.INIT
          } or other actions in "redux/*" ` +
          `namespace. They are considered private. Instead, you must return the ` +
          `current state for any unknown actions, unless it is undefined, ` +
          `in which case you must return the initial state, regardless of the ` +
          `action type. The initial state may not be undefined.`
      );
    }
  });
}

/**
 * 将值为不同reducer函数的对象,转变为单个reducer函数(root reducer)
 * 它将调用每次子reducer,并且会将它们返回的结果收集到与传递的reducer函数对象的key对应的单一的状态对象中.
 *
 * Turns an object whose values are different reducer functions, into a single
 * reducer function. It will call every child reducer, and gather their results
 * into a single state object, whose keys correspond to the keys of the passed
 * reducer functions.
 *
 * @param {Object} reducers An object whose values correspond to different
 * reducer functions that need to be combined into one. One handy way to obtain
 * it is to use ES6 `import * as reducers` syntax. The reducers may never return
 * undefined for any action. Instead, they should return their initial state
 * if the state passed to them was undefined, and the current state for any
 * unrecognized action.
 *
 * @returns {Function} A reducer function that invokes every reducer inside the
 * passed object, and builds a state object with the same shape.
 */
export default function combineReducers(reducers) {
  var reducerKeys = Object.keys(reducers);
  var finalReducers = {};

  for (var i = 0; i < reducerKeys.length; i++) {
    var key = reducerKeys[i];

    if (process.env.NODE_ENV !== "production") {
      if (typeof reducers[key] === "undefined") {
        warning(`No reducer provided for key "${key}"`);
      }
    }

    //
    // 筛选出有效的reducer函数
    //
    if (typeof reducers[key] === "function") {
      finalReducers[key] = reducers[key];
    }
  }

  var finalReducerKeys = Object.keys(finalReducers);

  if (process.env.NODE_ENV !== "production") {
    var unexpectedKeyCache = {};
  }

  //
  // 确保reducer是安全的
  //
  var sanityError;
  try {
    assertReducerSanity(finalReducers);
  } catch (e) {
    sanityError = e;
  }

  return function combination(state = {}, action) {
    if (sanityError) {
      throw sanityError;
    }

    // 检查 state
    if (process.env.NODE_ENV !== "production") {
      var warningMessage = getUnexpectedStateShapeWarningMessage(
        state,
        finalReducers,
        action,
        unexpectedKeyCache
      );
      if (warningMessage) {
        warning(warningMessage);
      }
    }

    var hasChanged = false;
    var nextState = {};

    // 遍历child reducer, 获得next state
    for (var i = 0; i < finalReducerKeys.length; i++) {
      var key = finalReducerKeys[i];
      var reducer = finalReducers[key];
      var previousStateForKey = state[key];

      // nextState = reducer(state,action)
      var nextStateForKey = reducer(previousStateForKey, action);

      // 检查 nextState
      if (typeof nextStateForKey === "undefined") {
        var errorMessage = getUndefinedStateErrorMessage(key, action);
        throw new Error(errorMessage);
      }

      nextState[key] = nextStateForKey;

      // 检查是否发生变化: 是否是同一个值或对象
      hasChanged = hasChanged || nextStateForKey !== previousStateForKey;
    }

    // 没有发生变化,返回旧的state
    return hasChanged ? nextState : state;
  };
}
