import { sendSyncMessage } from '../helper/icp'

const USER_LOGIN = 'USER_LOGIN'
const USER_SIGNOUT = 'USER_SIGNOUT'

const initState = {
  loginState: false,
  user: {}
}

export const user = (state = initState, action = {}) => {
  switch (action.type) {
    case USER_LOGIN:
      return { ...state, loginState: action.loginState, user: action.user }
    case USER_SIGNOUT:
      return { ...state, loginState: false}
    default:
      return state
  }
}

export const login = (username, password) => dispatch => {
  try{
    let result = sendSyncMessage('login', { username, password })
    if (result && result.code === 200)
      dispatch({
        type: USER_LOGIN,
        user: result.data,
        loginState: true
      })
    return result
  }catch(e){
    return e.message
  }
}

export const logout = () => dispatch => {
  dispatch({
    type: USER_SIGNOUT
  })
}

// 发送验证码
export const phoneVerifyCode = (phone) => dispatch => {
  try{
    let result = sendSyncMessage('phoneVerifyCode', { phone })
    if (result && result.code === 200){
      return null
    } else {
      return result.msg
    }
  }catch(e){
    console.log('phoneVerifyCode error', e)
    return e.message
  }
}

// 验证码修改账号密码
export const changePassword = ({phone, code, newPwd}) => dispatch => {
  try{
    let result = sendSyncMessage('changePassword', {phone, code, newPwd})
    if (result && result.code === 200){
      return null
    } else {
      return result.msg
    }
  }catch(e){
    console.log('changePassword error', e)
    return e.message
  }
}

// 修改密码
export const resetPassword = ({oldPwd, newPwd}) => dispatch => {
  try{
    let result = sendSyncMessage('resetPassword', {oldPwd, newPwd})
    if (result && result.code === 200){
      return null
    } else {
      return result.msg
    }
  }catch(e){
    console.log('resetPassword error', e)
    return e.message
  }
}

