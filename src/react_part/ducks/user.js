const SET_USER_INFO = 'SET_USER_INFO'

const initState = {
  user: {}
}

export const user = (state = initState, action = {}) => {
  switch (action.type) {
    case SET_USER_INFO:
      return { ...state, user: action.user }
    default:
      return state
  }
}

export const setUserInfo = (userInfo) => dispatch => {
  dispatch({
    type: SET_USER_INFO,
    user: userInfo
  })
}