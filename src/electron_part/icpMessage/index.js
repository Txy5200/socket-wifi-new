const { userLogin, recordList, recordDelete, recordDeleteAll, patientList, resetPassword } = require('../controller/user')
const { openSerialport, closeSerialport } = require('../controller/serialport')
const { playback, stopplay, continuePlay, changePlay } = require('../controller/play')
const { exportToPDF } = require('../controller/report')

// 根据 type 跳转不同的函数
const router = (arg, cb, event) => {
  switch (arg.type) {
    case 'login':
      userLogin(arg, cb)
      break
    case 'resetPassword':
      resetPassword(arg, cb)
      break
    case 'openSerialport':
      openSerialport(arg, cb)
      break
    case 'closeSerialport':
      closeSerialport(arg, cb)
    // case 'querySerialport':
    //   querySerialport(arg, cb)
    //   break
    // case 'configSerialport':
    //   configSerialport(arg, cb)
    //   break
    case 'recordList':
      recordList(arg, cb)
      break
    case 'recordDelete':
      recordDelete(arg, cb)
      break
    case 'recordDeleteAll':
      recordDeleteAll(arg, cb)
      break
    case 'patientList':
      patientList(arg, cb)
      break
    case 'playback':
      playback(arg, cb)
      break
    case 'stopplay':
      stopplay(arg, cb)
      break
    case 'pausePlay':
      stopplay(arg, cb)
      break
    case 'changePlay':
      changePlay(arg, cb)
      break
    case 'continuePlay':
      continuePlay(arg, cb)
      break
    case 'exportToPDF':
      exportToPDF(arg, cb, event)
      break
    default:
      break
  }
}

// 异步接口处理函数
export const asynchronousMessageCon = (event, arg) => {
  const callback = (data = null, msg = '操作成功', code = 200) => {
    event.sender.send('asynchronous-reply', { code, data, msg, arg })
  }
  router(arg, callback, event)
}

// 同步接口处理函数
export const synchronousMessageCon = (event, arg) => {
  const callback = (data = null, msg = '操作成功', code = 200) => {
    event.returnValue = { code, data, msg }
  }
  router(arg, callback, event)
}
