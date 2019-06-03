
const SETRECORDID = 'SETRECORDID'

const initState = {
  //当前recordId
  currentRecordId: ''
}

export const globalSource = (state = initState, action = {}) => {
  switch (action.type) {
    case SETRECORDID:
      return { ...state, currentRecordId: action.currentRecordId }
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
