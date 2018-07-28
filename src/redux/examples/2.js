const { createStore } = require("./redux");

function persist(createStore) {
  const fs = require("fs");
  const path = require("path");
  const DIR_PATH = path.join(__dirname, "data");
  const FILE_PATH = path.join(DIR_PATH, "data.dt");

  if (!fs.existsSync(DIR_PATH)) {
    fs.mkdirSync(DIR_PATH);
  }

  const stateFromFile = fs.readFileSync(FILE_PATH, {
    encoding: "utf-8"
  });

  const fd = fs.openSync(FILE_PATH, "w");

  return function(reducer, preloadState) {
    if (preloadState === undefined) {
      try {
        preloadState = JSON.parse(stateFromFile);
      } catch (err) {
        preloadState = undefined;
      }
    }

    const store = createStore(reducer, preloadState);
    const prevState = store.getState();

    const unsubscribe = store.subscribe(function() {
      const nextState = store.getState();

      if (prevState !== nextState) {
        fs.writeFileSync(fd, JSON.stringify(nextState, null, 2), {
          encoding: "utf-8"
        });
      }
    });

    process.on("exit", function() {
      fs.closeSync(fd);
      unsubscribe();
    });

    return store;
  };
}

const store = createStore((state, action) => {
  switch (action.type) {
    case "INCREMENT":
      return { count: state.count + 1 };
    case "DECREMENT":
      return { count: state.count - 1 };
    default:
      return state || { count: 0 };
  }
}, persist);

store.dispatch({
  type: "INCREMENT"
});
