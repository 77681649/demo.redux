/**
 * 任务调度器
 * 将负责调度的task: 
 *  1. 队列中的task, 按FIFO的顺序依次执行
 *  2. task执行具有"原子性": 同一时刻, 只会有一个task再执行
 */

const queue = [];

/**
 * 信号量
 * +1: 添加锁 scheduler.state = 挂起
 * -1: 释放锁 semaphore = 0 && scheduler.state = 已释放 && 触发队列的刷新操作
 */
let semaphore = 0;

/**
 * 以"原子性"的方式执行任务
 *
 * task 执行期间, scheduler.state = "挂起", 在此期间不能执行其他task
 * task 执行完毕, 释放锁
 */
function exec(task) {
  try {
    // lock, 防止其他task无法执行
    suspend();
    task();
  } finally {
    // 释放锁
    release();
  }
}

/**
 * 根据scheduler的状态:
 *  "挂起"    task  入队
 *  "已释放"  flush 队列 - 按FIFO的顺序, 依次执行所有的排队的task
 * @param {Object} task 任务
 */
export function asap(task) {
  queue.push(task);

  if (!semaphore) {
    suspend();
    flush();
  }
}

/**
 * 将shceduler设置为"挂起"状态 - 这个状态下, 调度的任务将被排队, 直到scheduler "已释放"时, 才能被执行
 */
export function suspend() {
  semaphore++;
}

/**
 * 将shceduler设置为"已释放"状态
 */
function release() {
  semaphore--;
}

/**
 * 释放当前的锁.
 * scheduler.state = 已释放, 执行所有排队的task
 */
export function flush() {
  release();

  let task;
  while (!semaphore && (task = queue.shift()) !== undefined) {
    exec(task);
  }
}
