import { createStore, applyMiddleware, compose } from 'redux'
import { persistStore, persistReducer, persistCombineReducers } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import thunk from 'redux-thunk'
import { user, login, logout, phoneVerifyCode, changePassword, resetPassword } from './user'
import { serialport, openSerialport, closeSerialport, getSerialportList, configSerialport } from './serialport'
import { globalSource, setHeaderState, setCurrentRecordID, setGaitInfo, setCopInfo, setCopDraw, setExportFileName, setExportState, setDataCompareState, setHistoryState } from './globalSource'
import { report, getBasicReport, getCopReport, getPressVideoData, getGaitCycle, getSingleLegTime, getDoubleLegTime, getCruraWeight, exportPDF } from './report'
import { patient, setPatientInfo, patientList, playback, stopplay, pausePlay, continuePlay, changePlay } from './patient'
import { history, getHistoryRecord, deleteHistoryRecord, clearHistoryRecord } from './history'

const reducers = { user, serialport, report, globalSource, patient, history }

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
  login, 
  logout, 
  phoneVerifyCode, 
  changePassword, 
  openSerialport, 
  closeSerialport,
  getSerialportList,
  getBasicReport,
  getCopReport,
  getPressVideoData,
  getGaitCycle,
  getSingleLegTime,
  getDoubleLegTime,
  getCruraWeight,
  setHeaderState,
  setPatientInfo,
  patientList,
  playback,
  getHistoryRecord,
  deleteHistoryRecord,
  clearHistoryRecord,
  setCurrentRecordID,
  setGaitInfo,
  setCopInfo,
  setCopDraw,
  stopplay,
  configSerialport,
  setExportFileName,
  exportPDF,
  setExportState,
  pausePlay,
  continuePlay,
  changePlay,
  resetPassword,
  setDataCompareState,
  setHistoryState
}
