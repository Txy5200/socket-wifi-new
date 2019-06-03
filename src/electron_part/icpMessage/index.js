const { recordDelete } = require('../controller/user')
const { openSerialport, closeSerialport } = require('../controller/serialport')

// 根据 type 跳转不同的函数
const router = (arg, cb, event) => {
  switch (arg.type) {
    case 'openSerialport':
      openSerialport(arg, cb)
      break
    case 'closeSerialport':
      closeSerialport(arg, cb)
    case 'recordDelete':
      recordDelete(arg, cb)
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
