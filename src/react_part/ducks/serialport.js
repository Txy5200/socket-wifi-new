import { sendSyncMessage } from '../helper/icp'

const SERIALPORT_OPEN = 'SERIALPORT_OPEN'
const SERIALPORT_CLOSE = 'SERIALPORT_CLOSE'
const SERIALPORT_LIST = 'SERIALPORT_LIST'

const initState = {
  // 串口打开状态
  state: false,
  serialportList: []
}

export const serialport = (state = initState, action = {}) => {
  switch (action.type) {
    case SERIALPORT_OPEN:
      return { ...state, state: true }
    case SERIALPORT_CLOSE:
      return { ...state, state: false }
    case SERIALPORT_LIST:
      return { ...state, serialportList: action.serialportList }
    default:
      return state
  }
}

export const openSerialport = () => dispatch => {
  let result = sendSyncMessage('openSerialport', { shoe_size: 42 })
  if (result && result.code === 200)
    dispatch({
      type: SERIALPORT_OPEN
    })
  return result
}

export const closeSerialport = () => dispatch => {
  let result = sendSyncMessage('closeSerialport')
  if (result && result.code === 200)
    dispatch({
      type: SERIALPORT_CLOSE
    })
  return result
}

// 查询串口列表
export const getSerialportList = () => dispatch => {
  let result = sendSyncMessage('querySerialport')
  if (result && result.code === 200)
    dispatch({
      type: SERIALPORT_LIST,
      serialportList: result.data
    })
  return result
}

// 设置串口
export const configSerialport = (portName1, portName2) => dispatch => {
  let result = sendSyncMessage('configSerialport', {portName1, portName2})
  if (result && result.code === 200)
    return null
  return result.msg
}
