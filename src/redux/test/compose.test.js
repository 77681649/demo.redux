const { compose } = require("../dist/redux");

test("compose - 从右往左依次执行传递给它的函数的", () => {
  let fn1 = x => x + 2;
  let fn2 = x => x - 10;
  let fn3 = x => x * 2;
  let fns = compose(
    fn1,
    fn2,
    fn3
  );

  expect(typeof fns === "function").toBeTruthy();
  expect(fns(10)).toBe(12);
});
