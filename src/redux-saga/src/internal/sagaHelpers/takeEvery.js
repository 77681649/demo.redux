import fsmIterator, { qEnd, safeName } from "./fsmIterator";
import { take, fork } from "../io";
import { END } from "../channel";

/**
 * saga helper - takeEvery
 * 每次匹配到指定action或channel中有input时, 都会fork一个worker
 * 
 * @param {String|String[]|Object} patternOrChannel 匹配模式 or channel
 * @param {Generator} worker saga worker
 * @param {...any} args 传递给worker的参数
 */
export default function takeEvery(patternOrChannel, worker, ...args) {
  // 常量: 
  const yTake = {
    done: false,
    value: take(patternOrChannel)
  };

  // 常量: 
  const yFork = ac => ({ 
    done: false, 
    value: fork(worker, ...args, ac) 
  });

  let action,
    setAction = ac => (action = ac);

  // 
  // take() -> fork() 
  //   ^         |
  //   |----------
  //
  return fsmIterator(
    {
      // state: q1
      // action: take action
      // nextState: q2
      q1() {
        return ["q2", yTake, setAction];
      },

      // state: q2
      // action:
      //    isEnd - 转换"结束状态
      //    其他  - fork(worker)
      // nextState: q1 ( 无限循环 )
      q2() {
        // 接收到的action是否为END
        return action === END 
          ? [qEnd] 
          : ["q1", yFork(action)];
      }
    },
    "q1",
    `takeEvery(${safeName(patternOrChannel)}, ${worker.name})`
  );
}
