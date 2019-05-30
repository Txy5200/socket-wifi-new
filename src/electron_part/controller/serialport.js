const { insertRecord, removeRecords, insertSerialprotData, insertWifiData } = require('../database')
import { openSerialport as openPort, closeSerialport as closePort } from '../serialport'
import { socketResume, socketPause } from '../socket'
import { variables } from '../global_variables'
import { initializeCompute } from '../compute'

let press_temp = []
let ptemp = 10000 // 计数器 用于批量插入数据
let wifi_temp = []
let wtemp = 10000 // 计数器 用于批量插入数据

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
export const saveWifiData = ({ clientName, wifiData, recordTime }) => {

  let wifiObj = {}
  wifiObj['recordID'] = variables.recordInfo.record_time
  wifiObj['clientName'] = clientName
  wifiObj['wifiData'] = wifiData
  wifiObj['recordTime'] = recordTime
  wifi_temp.push(wifiObj)

  wtemp--
  if (wtemp <= 0) sendWiFiDataToSave()
}

// 打开串口、接收串口数据,回复socket数据接收
export const openSerialport = ({ shoe_size }, cb) => {
  if (!shoe_size) return cb(null, '缺少用户信息', -1)

  // 插入训练记录
  insertRecord({ shoe_size }, (_, row) => {
    if (!row) return cb(null, '创建记录失败', -1)
    socketResume(err => {
      if(err) console.log('socketResume err', err)
    })
    // 设置全局变量
    variables.userInfo = { shoe_size }
    variables.recordInfo = row
    // 初始化计算模块
    initializeCompute()
    cb()

    // 打开串口
    // openPort(err => {
    //   if (err) {
    //     // 串口打开失败时
    //     removeRecords([row._id])
    //     cb(null, err, -1)
    //   } else {
    //     // 回复socket数据接收
    //     socketResume()
    //     // 设置全局变量
    //     variables.userInfo = { shoe_size }
    //     variables.recordInfo = row
    //     // 初始化计算模块
    //     initializeCompute()
    //     cb()
    //   }
    // })
  })
}

// 关闭串口、并结束计算,关闭socket数据接收
export const closeSerialport = (_, cb) => {
  // 关闭socket数据接收
  socketPause(err => {
    if(err) console.log('socketPause err', err)
  })
  sendWiFiDataToSave()
  cb()
  
  // closePort(err => {
  //   if (err) return cb(null, err, -1)
  //   // 关闭socket数据接收
  //   socketPause()
  //   cb()

  //   // 计算站立平衡时，95%cop椭圆面积
  //   // computeCopEllipse()

  //   // 结束时，保存缓存里的数据
  //   sendDataToSave()
  //   sendWiFiDataToSave()

  //   // 在记录中存储步态指标
  //   // saveGait({ recordId: variables.recordInfo._id, gaitInfo: variables.gaitInfo, copInfo: variables.copInfo })
  // })
}
