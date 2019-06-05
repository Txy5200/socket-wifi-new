import { fork } from 'child_process'
import { saveWifiData } from '../controller/serialport'
import { variables } from '../global_variables'

// 启动子线程去链接串口
let child = fork(__dirname + '/socket_server.js')
child.on('message', msg => {
  // TODO 子进程错误、关闭子进程

  // 接收到校验通过后的串口数据
  if (msg.type === 'saveWifiData') {
    const { clientName, wifiData } = msg

    variables.wifiPpm[clientName].push(wifiData)
    if (variables.wifiPpm[clientName].length > 3000) {
      variables.wifiPpm[clientName] = variables.wifiPpm[clientName].slice(-3000)
    }
    // 储存原始数据
    saveWifiData(msg)
  }
})

// 回复数据读取
export const socketResume = cb => {
  child.send({ type: 'resume' })
  cb()
}

// 关闭数据读取
export const socketPause = cb => {
  child.send({ type: 'pause' })
  cb()
}