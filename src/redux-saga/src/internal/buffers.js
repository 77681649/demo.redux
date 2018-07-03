import { kTrue, noop } from "./utils";

export const BUFFER_OVERFLOW = "Channel's Buffer overflow!";

const ON_OVERFLOW_THROW = 1;
const ON_OVERFLOW_DROP = 2;
const ON_OVERFLOW_SLIDE = 3;
const ON_OVERFLOW_EXPAND = 4;

const zeroBuffer = { isEmpty: kTrue, put: noop, take: noop };

/**
 * 创建一个缓冲区, 存储结构为循环队列 ( 先进先出 FIFO )
 * @param {Number} limit 最大长度
 * @param {Number} overflowAction 移除之后的动作
 * @returns {Buffer} 返回创建的缓冲区
 */
function ringBuffer(limit = 10, overflowAction) {
  let arr = new Array(limit);

  // 当前长度
  let length = 0;

  // 尾指针
  let pushIndex = 0;

  // 头指针
  let popIndex = 0;

  /**
   * 入队(从尾部)
   * @param {any} it
   */
  const push = it => {
    arr[pushIndex] = it;
    pushIndex = (pushIndex + 1) % limit;
    length++;
  };

  /**
   * 出栈(从头部)
   */
  const take = () => {
    if (length != 0) {
      let it = arr[popIndex];
      arr[popIndex] = null;
      length--;
      popIndex = (popIndex + 1) % limit;
      return it;
    }
  };

  /**
   * 清空队列
   * @returns {Array} 返回由清空项组成的数组
   */
  const flush = () => {
    let items = [];
    while (length) {
      items.push(take());
    }
    return items;
  };

  return {
    /**
     * 判断缓冲区是否为空
     */
    isEmpty: () => length == 0,

    /**
     * 入队
     */
    put: it => {
      if (length < limit) {
        // 未溢出时, 插入队列
        push(it);
      } else {
        // 溢出时, 根据情况处理
        let doubledLimit;
        switch (overflowAction) {
          // 抛出异常
          case ON_OVERFLOW_THROW:
            throw new Error(BUFFER_OVERFLOW);
          //
          case ON_OVERFLOW_SLIDE:
            arr[pushIndex] = it;
            pushIndex = (pushIndex + 1) % limit;
            popIndex = pushIndex;
            break;

          //
          case ON_OVERFLOW_EXPAND:
            doubledLimit = 2 * limit;

            arr = flush();

            length = arr.length;
            pushIndex = arr.length;
            popIndex = 0;

            arr.length = doubledLimit;
            limit = doubledLimit;

            push(it);
            break;
          default:
          // DROP
        }
      }
    },

    /**
     * 出队
     */
    take,

    /**
     * 清空缓冲区
     */
    flush
  };
}

export const buffers = {
  /**
   * 空缓冲区
   */
  none: () => zeroBuffer,

  /**
   * 固定长度的缓冲区, 溢出时抛出异常
   */
  fixed: limit => ringBuffer(limit, ON_OVERFLOW_THROW),

  /**
   * 可丢弃的缓冲区, 溢出时丢弃插入数据
   */
  dropping: limit => ringBuffer(limit, ON_OVERFLOW_DROP),

  /**
   * 可循环的缓冲区, 溢出时循环利用队头空间
   */
  sliding: limit => ringBuffer(limit, ON_OVERFLOW_SLIDE),

  /**
   * 可扩容的缓冲区, 溢出时自动扩容
   */
  expanding: initialSize => ringBuffer(initialSize, ON_OVERFLOW_EXPAND)
};
