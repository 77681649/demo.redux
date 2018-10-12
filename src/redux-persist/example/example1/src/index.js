import { createStore } from 'redux';
import { persistStore, persistReducer } from 'redux-persist/index';
import storage from 'redux-persist/storage/index'; // defaults to localStorage for web and AsyncStorage for react-native

function rootReducer(state, action) {
	return state || {};
}

const persistConfig = {
	key: 'root',
	storage,
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

let store = createStore(persistedReducer);
let persistor = persistStore(store);

store.dispatch({ type: 'a', payload: 123123 });
