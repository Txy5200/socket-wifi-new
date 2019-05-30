const WebSocket = require('ws')

const ws = new WebSocket('ws://127.0.0.1:9002')

ws.onerror = err => {
  console.log('Connection error')
}

ws.onopen = () => {
  console.log('Connection to server opened')
}

export const sendDataToServer = (data, cb) => {
  ws.send(data, cb)
}
