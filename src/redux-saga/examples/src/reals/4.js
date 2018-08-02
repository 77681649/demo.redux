/**
 * 4: 撤销 - 实现addTodo的撤销操作 ( race, delay )
 */
import { store, runSaga, effects, delay } from "../createStoreWithSaga";
const { take, put, fork, call, cancel, cancelled, spawn } = effects;

store.replaceReducer(function(state = { todos: [] }, action) {
  switch (action.type) {
    case "add_todo":
      return { todos: state.todos.concat(action.todo) };
    case "undo_todo":
      let todos = [].concat(state.todos);
      let pos = todos.findIndex(t => t.id === action.id);

      if (~pos) {
        todos.splice(pos, 1);
      }

      return { todos };
    default:
      return state;
  }
});

function* watcher() {
  while (true) {
    const action = yield take("request_add_todo");
    yield call(addTodo, action.todo);
    yield fork(watcherUndoTodo, action);
  }
}

function* addTodo(todo) {
  yield put({ type: "add_todo", todo });
}

function* watcherUndoTodo({ id }) {
  yield take(action => action.type === "undo_todo" && action.id === id);
  yield undoTodo(id);
}

function* undoTodo(id) {
  yield put({ type: "undo_todo", id });
}

runSaga(watcher);

store.dispatch({
  type: "request_add_todo",
  todo: {
    id: 1,
    name: "todo1"
  }
});

store.dispatch({
  type: "request_add_todo",
  todo: {
    id: 2,
    name: "todo2"
  }
});

store.dispatch({
  type: "undo_todo",
  id: 2
});
