import { is, makeIterator } from "../utils";

/**
 * 完成状态
 */
const done = { done: true, value: undefined };

/**
 * FSM状态: 结束状态
 */
export const qEnd = {};

/**
 *
 * @param {String|Object} patternOrChannel
 * @returns {String}
 */
export function safeName(patternOrChannel) {
  if (is.channel(patternOrChannel)) {
    return "channel";
  } else if (Array.isArray(patternOrChannel)) {
    return String(patternOrChannel.map(entry => String(entry)));
  } else {
    return String(patternOrChannel);
  }
}

/**
 * 基于Iterator实现FSM(有限状态机)
 * 
 * 
 * next() -> 获得次状态 -> 将次状态的行为作为返回值返回
 *   ^                        |
 *   |-------------------------
 * 
 * 
 * // Iterator执行器
 * function next(){
 *    const result = iterator.next()  // iterator = saga()
 * 
 *    if(!result.done){
 *      runEffect(....,next) // 继续执行
 *    } else {
 *      end()
 *    }
 * }
 * 
 * @param {Object} fsm 状态机
 * @param {String} q0 起始状态
 * @param {String} name 状态机的名称
 * @returns {Iterator} 返回一个Iterator对象
 */
export default function fsmIterator(fsm, q0, name = "iterator") {
  // 更新action函数
  let updateState;

  // 次态
  let qNext = q0;

  /**
   * 定义Iterator next行为
   * @param {Object} arg 事件 - 来自Iterator外部, 用来告知
   * @param {Error} error 错误对象
   */
  function next(arg, error) {
    // 如果次态"结束状态", 返回done ( 状态机成功完成 )
    if (qNext === qEnd) {
      return done;
    }

    if (error) {
      // 如果发生错误, 转移到"结束终态", 并抛出异常
      qNext = qEnd;
      throw error;
    } else {
      // 将next()接受到的参数, 作为接受到的action
      updateState && updateState(arg);

      // 通过iterator.next() 转换到下一个状态
      // 
      let [q, output, _updateState] = fsm[qNext]();

      // 设置次态
      qNext = q;

      // 设置状态更新
      updateState = _updateState;

      return qNext === qEnd ? done : output;
    }
  }

  // 返回一个Iterator
  return makeIterator(next, error => next(null, error), name, true);
}
