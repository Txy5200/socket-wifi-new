const SerialPortModel = require('serialport')
const { handleData } = require('./hander')
const baudRate = 921600 // 固定波特率
const serialPortPath = process.argv[2]
// 判断是否为有效的端口
let invalid = true

setTimeout(() => {
  if (invalid) {
    process.send({ type: 'error', msg: '无效的串口' })
  }
}, 3000)

const serialPort = new SerialPortModel(serialPortPath, {
  baudRate,
  autoOpen: false
})

// 打开串口并发送一条测试命令
serialPort.open(err => {
  console.log('测试串口', serialPortPath, err)
  if (err) {
    process.send({ type: 'error', msg: err.message })
  } else {
    serialPort.write('1000101001', (err, data) => {
      process.send({ type: 'success' })
      serialPort.close()
      invalid = false
    })
  }
})

// 串口关闭时,触发消息
serialPort.on('close', err => {
  if (err) process.send({ type: 'error', msg: err.message })
})

// 当串口接收到数据时
serialPort.on('data', data => {
  if (invalid || !Buffer.isBuffer(data)) return
  handleData(data)
})

process.on('message', msg => {
  if (msg.type === 'open') {
    serialPort.open(err => {
      if (err) console.log('open err', err.message)
    })
  }
  if (msg.type === 'close') {
    serialPort.close(err => {
      if (err) console.log('close err', err.message)
    })
  }
})
