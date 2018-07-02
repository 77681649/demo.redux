import * as React from "react";
import { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";

import AddTodo from "../containers/AddTodo";
import VisibileTodoList from "../containers/VisibleTodoList";
import Footer from "../components/Footer";
import { fetchTodo } from "../actions";

interface IndexPageProps {
  fetchTodo();
}

export default connect(
  undefined,
  function mapDispatchToProps(dispatch) {
    return { fetchTodo: bindActionCreators(fetchTodo, dispatch) };
  }
)(
  class IndexPage extends Component {
    constructor(props: IndexPageProps) {
      super(props);

      props.fetchTodo();
    }

    render() {
      return (
        <div>
          <AddTodo />
          <VisibileTodoList />
          <Footer />
        </div>
      );
    }
  }
);
