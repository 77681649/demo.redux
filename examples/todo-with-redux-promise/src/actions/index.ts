import TodosModel from "../models/todos";

export const fetchTodo = () => {
  return TodosModel.fetch()
    .then(todos => fetchTodoOK(todos))
};

export const fetchTodoOK = payload => {
  return {
    type: "FETCH_TODO_OK",
    payload
  };
};

export const fetchTodoError = err => {
  return {
    type: "FETCH_TODO_ERROR",
    error: err
  };
};

export const addTodo = text => {
  return {
    type: "ADD_TODO",
    id: TodosModel.generateID(),
    text
  };
};

export const setVisibilityFilter = filter => {
  return {
    type: "SET_VISIBILITY_FILTER",
    filter
  };
};

export const toggleTodo = id => {
  return {
    type: "TOGGLE_TODO",
    id
  };
};
