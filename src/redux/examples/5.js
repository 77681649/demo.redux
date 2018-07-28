/**
 * 5.使用 compose 进行复合函数运算
 */
const { compose } = require("./redux");

const add = (x, y) => x + y;
const minus = (x, y) => x - y;
const multiple = (x, y) => x * y;
const divide = (x, y) => x / y;

const addFour = x => add(x, 4);
const multipleFive = x => multiple(x, 5);
const minusTen = x => minus(x, 10);
const divideTwo = x => divide(x, 2);

const composed = compose(
  divideTwo,
  minusTen,
  multipleFive,
  addFour
);

console.log(composed(100));
