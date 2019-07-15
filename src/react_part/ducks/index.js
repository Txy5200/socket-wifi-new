import { createStore, applyMiddleware, compose } from 'redux'
import { persistStore, persistReducer, persistCombineReducers } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import thunk from 'redux-thunk'
import { serialport, openSerialport, closeSerialport } from './serialport'
import { globalSource, setCurrentRecordID } from './globalSource'
import { history, deleteHistoryRecord, clearHistoryRecord } from './history'
import { user, setUserInfo } from './user'

const reducers = { user, serialport, globalSource, history }

const persistConfig = {
  key: 'root',
  storage
}

const appReducer = persistCombineReducers(persistConfig, reducers)

const rootReducer = (state, action) => {
  if (action.type === 'USER_SIGNOUT') {
    state = {}
  }
  return appReducer(state, action)
}

const persistedReducer = persistReducer(persistConfig, rootReducer)

const store = createStore(persistedReducer, {}, compose(applyMiddleware(...[thunk])))
const persistor = persistStore(store, null, () => store.getState())

export { store, persistor }

// 抛出 actions
export {
  openSerialport,
  closeSerialport,
  deleteHistoryRecord,
  clearHistoryRecord,
  setCurrentRecordID,
  setUserInfo
}
