const timeSeed = () => Math.round(Math.random() * 100);

let nextTodoId = 3;

export default class TodosModel {
  static generateID() {
    return nextTodoId++;
  }

  static fetch() {
    // mock http request
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve([
          {
            id: 0,
            text: "Drink Water",
            completed: false
          },
          {
            id: 1,
            text: "Write report",
            completed: false
          },
          {
            id: 2,
            text: "Sleep",
            completed: false
          }
        ]);
      }, timeSeed());
    });
  }
}
