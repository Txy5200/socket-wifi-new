import { sendSyncMessage } from '../helper/icp'

const HISTORY_RECORD = 'HISTORY_RECORD'

const initState = {
  history_record_data: [],
  pageInfo: {}
}

export const history = (state = initState, action = {}) => {
  switch (action.type) {
    case HISTORY_RECORD:
      return { ...state, history_record_data: action.history_record_data, pageInfo: action.pageInfo }
    default:
      return state
  }
}

// 获取历史记录
export const getHistoryRecord = ({ keyword, page, limit }) => dispatch => {
  try {
    let result = sendSyncMessage('recordList', { keyword, page, limit })
    let docs = result.data.items || []
    let pageInfo = result.data.pageInfo || {}
    if (result && result.code === 200) {
      dispatch({
        type: HISTORY_RECORD,
        history_record_data: docs,
        pageInfo
      })
    }
    return docs
  } catch (e) {
    console.log('getHistoryRecord error', e)
    return e.message
  }
}

// 删除历史记录
export const deleteHistoryRecord = (ids) => dispatch => {
  try {
    let result = sendSyncMessage('recordDelete', { ids })
    if (result && result.code === 200) {
      return null
    } else {
      return result.msg
    }
  } catch (e) {
    console.log('deleteRecord error', e)
    return e.message
  }
}

// 清除历史记录
export const clearHistoryRecord = () => dispatch => {
  try {
    let result = sendSyncMessage('recordDeleteAll')
    if (result && result.code === 200) {
      return null
    } else {
      return result.msg
    }
  } catch (e) {
    console.log('clearRecord error', e)
    return e.message
  }
}
