const serialport = require('serialport')
import { fork } from 'child_process'
import { saveData } from '../controller/serialport'
import { conputeData } from '../compute'
const except = ['SOC', 'MALS', 'Bluetooth-Incoming-Port', 'usbmodem14411']


// 记录已连接的串口
let connectPorts = {}
// 记录链接失败的串口
let errorPorts = {}
// 手动配置的串口信息
let configPorts = []

// // 判断是否为系统自带串口
const checkPort = comName => {
  // 已连接过的
  if (connectPorts[comName] || errorPorts[comName]) return true
  // 系统接口
  for (let item of except) {
    if (comName.indexOf(item) > -1) return true
  }
  if (configPorts.length > 0 && configPorts.indexOf(comName) < 0) return true
  return false
}

// 查询所有可用的串口链接, 并自动链接
const availablePorts = () => {
  serialport.list((_, list) => {
    list.forEach(doc => {
      const { comName } = doc
      // 去除自带串口
      if (checkPort(comName)) return

      // 启动子线程去链接串口
      let child = fork(__dirname + '/child.js', [comName])
      child.on('message', msg => {
        if (msg.type === 'success') connectPorts[comName] = { isOpen: false, child }
        if (msg.type === 'error') {
          // 关闭进程
          child.kill()
          // 异常关闭的串口，如果是有效的串口 delete 后，自动重新连接
          if (connectPorts[comName]) delete connectPorts[comName]
          else errorPorts[comName] = { msg: msg.msg, time: Date.now() }
        }
        // 接收到校验通过后的串口数据
        if (msg.type === 'saveData') {
          const { sensorData_AD, sensorData, posturedata } = msg

          // 给每条数据添加上传时间
          const currentTime = Date.now()
          sensorData_AD.push(currentTime)
          sensorData.push(currentTime)
          posturedata.push(currentTime)
          // 计算步态和显示信息
          conputeData(sensorData)
          // 储存原始数据
          saveData(msg)
        }
      })
    })
  })
}

//  // 打开系统即查询一下串口信息 并 设置定时任务
const findPort = () => {
  const connectSize = Object.keys(connectPorts).length
  if (connectSize >= 2) return
  // 一分钟内的错误错口不予连接
  for (let key in errorPorts) {
    if (Date.now() - errorPorts[key].time > 1000 * 10) delete errorPorts[key]
  }
  availablePorts()
}
findPort()
setInterval(findPort, 5000)

// 打开串口
export const openSerialport = cb => {
  const connectSize = Object.keys(connectPorts).length
  if (connectSize < 2) return cb('串口未链接，请检查')
  for (let key in connectPorts) {
    const { child, isOpen } = connectPorts[key]
    if (isOpen) return cb('串口已打开, 请勿重复操作')
    connectPorts[key].isOpen = true
    child.send({ type: 'open' })
  }
  cb()
}

// 关闭串口
export const closeSerialport = cb => {
  for (let key in connectPorts) {
    const { child, isOpen } = connectPorts[key]
    if (!isOpen) return cb('串口已关闭, 请勿重复操作')
    connectPorts[key].isOpen = false
    child.send({ type: 'close' })
  }
  cb()
}

export const setSerialport = config => {
  configPorts = config
  let keys = Object.keys(connectPorts)
  // 关闭所有串口
  for (let i = 0; i < keys.length; i++) {
    connectPorts[keys[i]].child.kill()
  }
  connectPorts = {}
  findPort()
}

export const querySerialportList = cb => {
  serialport.list((_, list) => {
    let result = []
    for (let index = 0; index < list.length; index++) {
      const { comName } = list[index]
      let flag = false
      for (let item of except) {
        if (comName.indexOf(item) > -1) flag = true
      }
      if (!flag) result.push(comName)
    }
    cb(result)
  })
}
