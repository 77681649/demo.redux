/**
 * 任务调度器
 * 将负责调度的task按FIFO的顺序以"原子性"(同一时刻,只能执行一个task)的方式依次的同步执行
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
    // 添加锁
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
