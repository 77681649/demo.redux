/**
 * 使用 take: 在我们的 Todo 应用中，我们希望监听用户的操作，并在用户初次创建完三条 Todo 信息时显示祝贺信息
 */
import { store, runSaga, effects } from "../createStoreWithSaga";
const { take, put, call } = effects;

store.replaceReducer(function(state = [], action) {
  switch (action.type) {
    case "add_todo":
      return state.concat(action.todo);
    default:
      return state;
  }
});

function* watchAddTodo() {
  let addTodoCount = 0;

  while (true) {
    const action = yield take("request_add_todo");

    addTodoCount++;

    yield call(addTodo, action.todo);

    if (addTodoCount === 3) {
      yield call(printCongratulation);
    }
  }
}

function* addTodo(todo) {
  yield put({ type: "add_todo", todo });
}

function* printCongratulation() {
  yield call([console, console.log], "congratulation!");
}

runSaga(watchAddTodo);

store.dispatch({
  type: "request_add_todo",
  todo: { id: 1, name: "todo1" }
});

store.dispatch({
  type: "request_add_todo",
  todo: { id: 2, name: "todo2" }
});

store.dispatch({
  type: "request_add_todo",
  todo: { id: 3, name: "todo3" }
});

store.dispatch({
  type: "request_add_todo",
  todo: { id: 4, name: "todo4" }
});
