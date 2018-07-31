import chalk from "chalk";
import { stringify } from "querystring";
const {
  createStore,
  applyMiddleware,
  compose,
  bindActionCreators,
  combineReducers
} = require("../../../redux/src");
const defaultReducer = (state, action) => {
  let { type, ...payload } = action;
  return payload || state;
};
const log = api => next => action => {
  console.log(chalk.bgYellow("Dispatch:"));
  console.log("  ", action);
  return next(action);
};

const withDiffLogger = () => createStore => (reducer, preload, enchaner) => {
  let store = createStore(reducer, preload, enchaner);
  let prevState = store.getState();

  store.subscribe(function() {
    let nextState = store.getState();

    if (prevState != nextState) {
      console.log(chalk.bgBlue(`State Diff:`));

      if (nextState === null) {
        console.log("nextState is null");
        return;
      }

      const keys = Object.keys(nextState);

      keys.forEach(key => {
        if (prevState == null || prevState[key] != nextState[key]) {
          console.log(`  ${chalk.green(key)}:`, nextState[key]);
        }
      });
    }

    prevState = nextState;
  });

  store.printState = function() {
    console.log(chalk.bgMagenta("State Tree:"));
    console.log(JSON.stringify(store.getState(), null, 2));
  };

  return store;
};

function enchancedCreateStore(reducer, preloadedState, enhancer) {
  reducer = reducer || defaultReducer;

  if (typeof preloadedState === "function" && typeof enhancer === "undefined") {
    enhancer = preloadedState;
    preloadedState = undefined;
  }

  const defaultEnhancer = compose(
    applyMiddleware(log),
    withDiffLogger()
  );

  if (typeof enhancer === "function") {
    enhancer = compose(
      enhancer,
      defaultEnhancer
    );
  } else {
    enhancer = defaultEnhancer;
  }

  const store = createStore(reducer, preloadedState, enhancer);

  // store.subscribe(function printNextState() {
  //   console.log("next state:");
  //   console.log(JSON.stringify(store.getState(), null, 2));
  // });

  return store;
}

module.exports = {
  createStore: enchancedCreateStore,
  applyMiddleware,
  compose,
  bindActionCreators,
  combineReducers
};
