/**
 * cancel task
 * 通过某些 UI 命令启动或停止的后台同步任务。 
 * 
 * 在接收到 START_BACKGROUND_SYNC action 后，
 * 我们 fork 一个后台任务，
 * 周期性地从远程服务器同步一些数据
 * 
 * 将会一直执行直到一个 STOP_BACKGROUND_SYNC action 被触发。 
 * 然后我们取消后台任务，
 * 等待下一个 START_BACKGROUND_SYNC action
 */
const createStore = require("./create-store");
const store = createStore();

// 开始后台同步
store.dispatch({
  type:'START_BACKGROUND_SYNC'
})

setTimeout(function(){
  store.dispatch({
    type:'STOP_BACKGROUND_SYNC'
  })
},5000)