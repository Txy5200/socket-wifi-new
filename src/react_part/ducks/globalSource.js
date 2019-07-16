
const SETRECORDID = 'SETRECORDID'
const SETGAITINFO = 'SETGAITINFO'

const initState = {
  //当前recordId
  currentRecordId: '',
  // 当前步态信息
  currentGaitInfo: {},
}

export const globalSource = (state = initState, action = {}) => {
  switch (action.type) {
    case SETRECORDID:
      return { ...state, currentRecordId: action.currentRecordId }
    case SETGAITINFO:
      return { ...state, currentGaitInfo: action.currentGaitInfo }
    default:
      return state
  }
}

export const setCurrentRecordID = ({currentRecordId}) => dispatch => {
  dispatch({
    type: SETRECORDID,
    currentRecordId
  })
}

export const setGaitInfo = ({currentGaitInfo}) => dispatch => {
  dispatch({
    type: SETGAITINFO,
    currentGaitInfo
  })
}
