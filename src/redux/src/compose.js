/**
 * Composes single-argument functions from right to left. The rightmost
 * function can take multiple arguments as it provides the signature for
 * the resulting composite function.
 *
 * @example
 * let fn1 = ()=>console.log('1');
 * let fn2 = ()=>console.log('2');
 * let fn2 = ()=>console.log('3');
 *
 * // 3
 * // 2
 * // 1
 * let composed = compose(fn1,fn2,fn3);
 * composed();
 *
 * @param {...Function} funcs The functions to compose.
 * @returns {Function} A function obtained by composing the argument functions
 * from right to left. For example, compose(f, g, h) is identical to doing
 * (...args) => f(g(h(...args))).
 */
export default function compose(...funcs) {
  // 返回一个identity函数
  if (funcs.length === 0) {
    return arg => arg;
  }

  // 直接返回
  if (funcs.length === 1) {
    return funcs[0];
  }

  const last = funcs[funcs.length - 1]; // 最后一个函数
  const rest = funcs.slice(0, -1); // 剩余的函数

  // 返回一个函数
  return (...args) =>
    rest.reduceRight((composed, f) => f(composed), last(...args));
}
