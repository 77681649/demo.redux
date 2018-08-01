import fsmIterator, { qEnd, safeName } from "./fsmIterator";
import { cancel, take, fork } from "../io";
import { END } from "../channel";

/**
 * saga helper - takeLatest
 * 每次匹配到指定action或channel中有input时, 都会fork一个worker, 并且自动取消哪些启动但仍在执行中的worker
 *
 * @param {String|String[]|Object} patternOrChannel 匹配模式 or channel
 * @param {Generator} worker saga worker
 * @param {...any} args 传递给worker的参数
 */
export default function takeLatest(patternOrChannel, worker, ...args) {
  const yTake = { done: false, value: take(patternOrChannel) };
  const yFork = ac => ({ done: false, value: fork(worker, ...args, ac) });
  const yCancel = task => ({ done: false, value: cancel(task) });

  // 记录当前的task
  // 记录当前的action
  let task, action;

  const setTask = t => (task = t);
  const setAction = ac => (action = ac);

  /**
   * takeLastet
   * take() --> is END? --YES--> END
   *  ^                 ---NO--> has task? --YES--> cancel(task) 
   *  |                                                  |
   *  |                                                  |
   *  |                                    ---NO--> fork(worker,action)
   *  |                                                  |
   *  |--------------------------------------------------|
   */
  return fsmIterator(
    {
      q1() {
        return ["q2", yTake, setAction];
      },
      q2() {
        return action === END
          ? [qEnd]
          : task // 有运行task
            ? ["q3", yCancel(task)]
            : ["q1", yFork(action), setTask];
      },
      q3() {
        return ["q1", yFork(action), setTask];
      }
    },
    "q1",
    `takeLatest(${safeName(patternOrChannel)}, ${worker.name})`
  );
}
