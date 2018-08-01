import fsmIterator, { qEnd, safeName } from "./fsmIterator";
import { take, fork, actionChannel, call } from "../io";
import { END } from "../channel";
import { buffers } from "../buffers";
import { delay } from "../utils";

/**
 * saga helper - throttle
 * 实现节流 - worker之间间隔相同的时间
 * 匹配匹配到指定action时, 在指定时间间隔内, 只会fork一次worker 
 * 
 * @param {Number} delayLength
 * @param {String|String[]} pattern 匹配模式
 * @param {Generator} worker saga worker
 * @param {...any} args 传递给worker的参数
 */
export default function throttle(delayLength, pattern, worker, ...args) {
  let action, channel;

  // buffer 循环队列
  const yActionChannel = {
    done: false,
    value: actionChannel(pattern, buffers.sliding(1))
  };
  const yTake = () => ({ done: false, value: take(channel) });
  const yFork = ac => ({ done: false, value: fork(worker, ...args, ac) });
  const yDelay = { done: false, value: call(delay, delayLength) };

  const setAction = ac => (action = ac);
  const setChannel = ch => (channel = ch);

  /**
   * throttle
   *
   * actionChannel()
   *  |
   * take(channel) --> is END? --YES--> END
   *  ^                        ---NO--> fork(worker,action)
   *  |                                   |                    
   *  |---------------------------------delay()
   *  
   */
  return fsmIterator(
    {
      q1() {
        return ["q2", yActionChannel, setChannel];
      },
      q2() {
        return ["q3", yTake(), setAction];
      },
      q3() {
        return action === END ? [qEnd] : ["q4", yFork(action)];
      },
      q4() {
        return ["q2", yDelay];
      }
    },
    "q1",
    `throttle(${safeName(pattern)}, ${worker.name})`
  );
}
