/**
 * 8: 使用 fork: 实现以非阻塞的方式执行任务 - 并行的获得两种不同的资源
 *
 *
 */
import { store, runSaga, effects, takeEvery } from "../createStoreWithSaga";
const { put, call, fork } = effects;

store.replaceReducer(function(state = { flights: null, hotels: [] }, action) {
  switch (action.type) {
    case "FETCH_FLIGHTS_SUCCESS":
      return { ...state, flights: action.payload };
    case "FETCH_HOTELS_SUCCESS":
      return { ...state, hotels: action.payload };
    default:
      return state;
  }
});

/**
 * saga
 */
function* watcher() {
  yield takeEvery("FETCH_RESOURCE", fetchResoure);
}

function* fetchResoure() {
  const start = new Date();

  // 非阻塞
  const fetchFlightsTask = yield fork(fetchFlights);
  const fetchHotelsTask = yield fork(fetchHotels);

  const flights = yield call(() => fetchFlightsTask.done);
  const hotels = yield call(() => fetchHotelsTask.done);

  // 阻塞
  // const flights = yield call(fetchFlights);
  // const hotels = yield call(fetchHotels);

  if (flights) {
    yield put({ type: "FETCH_FLIGHTS_SUCCESS", payload: flights });
  }

  if (hotels) {
    yield put({ type: "FETCH_HOTELS_SUCCESS", payload: hotels });
  }

  yield call(store.printState);
  yield call([console, console.log], "timestamp:", new Date() - start);
}

function* fetchFlights() {
  try {
    return yield call(requestFlights);
  } catch (err) {
    yield put({ type: "FETCH_FLIGHT_ERROR", err });
  }
}

function requestFlights() {
  console.log("request flights");

  return new Promise((resolve, reject) => {
    setTimeout(function() {
      // resolve([{ id: 1, name: "HKG-TPE" }, { id: 2, name: "HKG-BJE" }]);
      reject(new Error("haha"));
    }, 1000);
  });
}

function* fetchHotels() {
  return yield call(requestHotels);
}

function requestHotels() {
  console.log("request hotels");

  return new Promise(resolve => {
    setTimeout(function() {
      resolve([{ id: 1, name: "皇冠酒店" }, { id: 2, name: "希尔顿酒店" }]);
    }, 1000);
  });
}

/**
 * run saga
 */
runSaga(watcher);

store.dispatch({
  type: "FETCH_RESOURCE"
});
