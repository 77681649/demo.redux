import * as React from "react";
import { Component } from "react";
import { Provider } from "react-redux";
import { createStore, applyMiddleware } from "redux";
import { composeWithDevTools } from "redux-devtools-extension";
import reduxPromise from "redux-promise";

import IndexPage from "./pages/index";
import rootReduers from "./reducers";

export default class App extends Component {
  store: any;

  constructor(props) {
    super(props);

    let middlewares = [reduxPromise];
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
