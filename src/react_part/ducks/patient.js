
import { sendSyncMessage } from '../helper/icp'

const SET_PATIENTINFO = 'SET_PATIENTINFO'
const PATIENT_LIST = 'PATIENT_LIST'

const initState = {
  patient_list: [],
  patientInfo: {}
}

export const patient = (state = initState, action = {}) => {
  switch (action.type) {
    case SET_PATIENTINFO:
      return { ...state, patientInfo: action.patientInfo }
    case PATIENT_LIST:
      return { ...state, patient_list: action.patient_list }
    default:
      return state
  }
}

export const patientList = (keyword) => dispatch => {
  try {
    let result = sendSyncMessage('patientList', { keyword, page: 1, limit: 10 })
    let docs = result.data.items || []
    if (result && result.code === 200)
      dispatch({
        type: PATIENT_LIST,
        patient_list: docs
      })
    return docs
  } catch (e) {
    console.log('patientList error', e)
    return e.message
  }
}

export const playback = (recordId) => dispatch => {
  try {
    let result = sendSyncMessage('playback', { recordId })
    if (result && result.code === 200)
      return null
    return result.msg
  } catch (e) {
    console.log('playback error', e)
    return e.message
  }
}

export const stopplay = () => dispatch => {
  try {
    let result = sendSyncMessage('stopplay')
    if (result && result.code === 200)
      return null
    return result.msg
  } catch (e) {
    console.log('stopplay error', e)
    return e.message
  }
}

export const pausePlay = () => dispatch => {
  try {
    let result = sendSyncMessage('pausePlay')
    if (result && result.code === 200)
      return null
    return result.msg
  } catch (e) {
    console.log('pausePlay error', e)
    return e.message
  }
}

export const continuePlay = (startTime) => dispatch => {
  try {
    let result = sendSyncMessage('continuePlay', {startTime})
    if (result && result.code === 200)
      return null
    return result.msg
  } catch (e) {
    console.log('continuePlay error', e)
    return e.message
  }
}

export const changePlay = (startTime) => dispatch => {
  try {
    let result = sendSyncMessage('changePlay', {startTime})
    if (result && result.code === 200)
      return null
    return result.msg
  } catch (e) {
    console.log('changePlay error', e)
    return e.message
  }
}

export const setPatientInfo = (patientInfo) => dispatch => {
  dispatch({
    type: SET_PATIENTINFO,
    patientInfo
  })
}