const { ipcRenderer } = require('electron')

// 发送同步消息
export const sendSyncMessage = (type, params = {}) => {
  return ipcRenderer.sendSync('synchronous-message', { type, ...params })
}

// 发送异步消息
export const sendAsyncMessage = (type, params = {}) => {
  ipcRenderer.send('asynchronous-message', { type, ...params })
}

// 监听异步消息
ipcRenderer.on('asynchronous-reply', (event, arg) => {
  console.log('asynchronous-reply=====>', arg)
})
