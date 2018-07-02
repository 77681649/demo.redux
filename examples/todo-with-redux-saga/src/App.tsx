import * as React from "react";
import { Component } from "react";
import { Provider } from "react-redux";
import { createStore, applyMiddleware } from "redux";
import { composeWithDevTools } from "redux-devtools-extension";
import reduxThunk from "redux-thunk";
import { hot } from "react-hot-loader";

import IndexPage from "./pages/index";
import rootReduers from "./reducers";

class App extends Component {
  store: any;

  constructor(props) {
    super(props);

    let middlewares = [reduxThunk];
    this.store = createStore(
      rootReduers,
      composeWithDevTools(applyMiddleware(...middlewares))
    );
  }

  render() {
    return (
      <Provider store={this.store}>
        <IndexPage />
      </Provider>
    );
  }
}

export default hot(module)(App)