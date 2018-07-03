const ReduxSaga = require("../../dist/redux-saga");
const { delay } = ReduxSaga;
const { take,takeEvery } = ReduxSaga.effects;
const { select, call, put, fork, cancel, cancelled  } = ReduxSaga.effects;
const { all } = ReduxSaga.effects;

let id = 0
const Api = {
  fetch(){
    return new Promise(resolve=>{
      resolve({id:++id})
    })
  }
}

let count = 0;
function* watchAndLog() {
  while (true) {
    let action = yield take("*");
    let nextState = yield select();

    console.log(
      `------------------------------------------------------------------------------------------------ dispatch ACTION[${++count}]`
    );
    console.log("action: ", action);
    console.log("action nextState:", nextState);
  }
}

function* watchBackgroundSync()
{
  while(true){
    // 监听到 START_BACKGROUND_SYNC
    yield take("START_BACKGROUND_SYNC")

    // 无阻塞启动同步
    let task = yield fork(backgroundSync)

    // 监听到 STOP_BACKGROUND_SYNC
    yield take('STOP_BACKGROUND_SYNC')
    yield cancel(task)
  }
}

function* backgroundSync()
{ 
  while(true){
    // 每个1秒,同步一次
    yield delay(1000)
    let data = yield call(Api.fetch)
    yield put({type:'BACKGROUND_SYNC',data})
  }
}

module.exports = function* rootSaga() {
  yield all([watchAndLog(), watchBackgroundSync()]);
};
