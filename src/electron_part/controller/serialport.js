const { insertRecord, removeRecords, insertSerialprotData, insertWifiData } = require('../database')
import { openSerialport as openPort, closeSerialport as closePort } from '../serialport'
import { socketResume, socketPause } from '../socket'
import { variables } from '../global_variables'
import { initializeCompute } from '../compute'
import moment from 'moment'

let press_temp = []
let ptemp = 10000 // 计数器 用于批量插入数据
let wifi_temp = []
let wtemp = 10000 // 计数器 用于批量插入数据
let wifiData_temp = []

const sendDataToSave = () => {
  insertSerialprotData({ press: press_temp })
  press_temp = []
  ptemp = 10000
}

const sendWiFiDataToSave = () => {
  insertWifiData(wifi_temp)
  wifi_temp = []
  wtemp = 10000
}

// 保存串口数据到数据库
export const saveData = ({ sensorData_AD, sensorData, posturedata }) => {
  let pressObj = {}
  pressObj['$record_id'] = variables.recordInfo.record_time
  pressObj['$lr'] = sensorData[0]
  pressObj['$num_order'] = sensorData[1]
  pressObj['$current_time'] = sensorData_AD[44]
  for (let i = 2; i < 44; i++) {
    pressObj[`$force${i - 1}`] = sensorData[i]
  }
  press_temp.push(pressObj)

  ptemp--
  if (ptemp <= 0) sendDataToSave()
}

// 保存wifi数据到数据库
export const saveWifiData = ({ clientName, wifiData }) => {
  wifiData_temp.push(wifiData)
  let wifiObj = {}
  wifiObj['recordID'] = variables.recordInfo.record_time
  wifiObj['clientName'] = clientName

  if (wifiData_temp.length >= 1000) {
    wifiObj['wifiData'] = wifiData_temp
    wifiObj['recordTime'] = new Date().getTime()//moment().format('YYYY-MM-DD HH:mm:ss')
    wifi_temp.push(wifiObj)
    wtemp--
    wifiData_temp = []
  }

  if (wtemp <= 0) sendWiFiDataToSave()
}

// 打开串口、接收串口数据,回复socket数据接收
export const openSerialport = ({ shoe_size }, cb) => {
  if (!shoe_size) return cb(null, '缺少用户信息', -1)

  // 插入训练记录
  insertRecord({ shoe_size }, (_, row) => {
    if (!row) return cb(null, '创建记录失败', -1)

    // *******Mac测试 不需要打开串口*******

    // 恢复socket数据接收
    // socketResume(err => {
    //   if (err) console.log('socketResume err', err)
    // })
    // // 设置全局变量
    // variables.userInfo = { shoe_size }
    // variables.recordInfo = row
    // // 初始化计算模块
    // initializeCompute()
    // cb()

    // *******Mac测试*******

    // 打开串口
    openPort(err => {
      if (err) {
        // 串口打开失败时
        removeRecords([row._id])
        cb(null, err, -1)
      } else {
        // 恢复socket数据接收
        socketResume(err => {
          if (err) console.log('socketResume err', err)
        })
        // 设置全局变量
        variables.userInfo = { shoe_size }
        variables.recordInfo = row
        // 初始化计算模块
        initializeCompute()
        cb()
      }
    })
  })
}

// 关闭串口、并结束计算,关闭socket数据接收
export const closeSerialport = (_, cb) => {
  // *******Mac测试 不需要关闭串口*******

  // 关闭socket数据接收
  // socketPause(err => {
  //   if (err) console.log('socketPause err', err)
  // })
  // cb()

  // // 结束时，保存缓存里的数据
  // sendDataToSave()
  // sendWiFiDataToSave()

  // *******Mac测试*******

  closePort(err => {
    if (err) return cb(null, err, -1)
    // 关闭socket数据接收
    socketPause(err => {
      if (err) console.log('socketPause err', err)
    })
    cb()

    // 结束时，保存缓存里的数据
    sendDataToSave()
    sendWiFiDataToSave()
  })
}
