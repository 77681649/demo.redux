const ReduxSaga = require("../../dist/redux-saga");
const { take,takeEvery } = ReduxSaga.effects;
const { select, call, put, fork, cancel, cancelled } = ReduxSaga.effects;
const { all } = ReduxSaga.effects;

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

function* fetchProduct() {
  yield takeEvery('FETCH_PRODUCT',function* fetchProduct(action){
    let {productId}  =action;
    let [master,detail] = yield all([
      call(fetchProductMaster,productId),
      call(fetchProductDetail,productId)
    ])
  
    yield put({
      type:'FETCH_PRODUCT_SUCCESS',
      product:{
        id:productId,
        master,
        detail
      }
    })
  })
}

function fetchProductMaster(productId) {
  return Promise.resolve({
    name:"威龙辣条",
    price:2
  })
}

function fetchProductDetail(productId) {
  return Promise.resolve([
   {
     'type':0,
     'details':[
      '白砂糖',
      '酱油',
      '辣椒',
      '面筋'
     ]
   },
  {
    'type':1,
    'details':[
     {k:'生产日期',v:'2018-10-10'}, 
     {k:'有效期',v:'12个月'},
    ]
  } 
  ])
}

module.exports = function* rootSaga() {
  yield all([watchAndLog(), fetchProduct()]);
};
