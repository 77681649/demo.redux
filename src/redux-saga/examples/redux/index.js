import chalk from "chalk";
import { stringify } from "querystring";
const {
  createStore,
  applyMiddleware,
  compose,
  bindActionCreators,
  combineReducers
} = require("../../../redux/src");
const defaultReducer = (state, action) => state;
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

function enchancedCreateStore(reducer, preloadState, enchancer) {
  reducer = reducer || defaultReducer;

  const defaultEnchncer = compose(
    applyMiddleware(log),
    withDiffLogger()
  );

  if (typeof enchancer === "function") {
    enchancer = compose(
      enchancer,
      defaultEnchncer
    );
  } else {
    enchancer = defaultEnchncer;
  }

  const store = createStore(reducer, preloadState, enchancer);

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
