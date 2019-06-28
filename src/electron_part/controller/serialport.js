const { insertRecord, removeRecords, insertSerialprotData, insertWifiData, insertEmgData } = require('../database')
import { openSerialport as openPort, closeSerialport as closePort } from '../serialport'
import { socketResume, socketPause } from '../socket'
import { variables } from '../global_variables'
import { initializeCompute } from '../compute'
import moment from 'moment'

let leftLandState = false // 左脚着地状态
const Threshold = 5// 压力阈值

let press_temp = []
let ptemp = 10000 // 计数器 用于批量插入足底压力数据
let wtemp = 10000 // 计数器 用于批量插入肌电数据
let wifiRecord_temp = [] // 肌电记录临时值
let wifiData_temp = {} // 4个客户端肌电数据临时值
let pressTemp = [] // 记录当前左腿压力点值之和
let emgTemp = {} // 记录肌电客户端肌电数据

const sendDataToSave = () => {
  insertSerialprotData({ press: press_temp })
  press_temp = []
  ptemp = 10000
}

const sendWiFiDataToSave = () => {
  insertWifiData(wifiRecord_temp)
  wifiRecord_temp = []
  wifiData_temp = {}
  wtemp = 10000
}

const sendEmgDataToSave = (emgData) => {
  insertEmgData(emgData)
  pressTemp = []
  emgTemp = {}
}

// 判断着地
const isLand = () => {
  // 获取左脚之前的状态，并将左脚当前着地状态置为 true
  let lastState = leftLandState
  leftLandState = true
  // 如果之前状态为离地，则左跟着地
  if (!lastState) return true
  return false
}

// 判断离地
const isLeave = () => {
  // 获取左脚之前的状态，并将左脚当前着地状态置为 false
  let lastState = leftLandState
  leftLandState = false
  // 如果之前状态为着地，则 左掌离地
  if (lastState) return true
  return false
}

// 保存串口数据到数据库
export const saveData = ({ sensorData_AD, sensorData, posturedata }) => {
  let pressObj = {}
  let pressArray = []
  pressObj['$record_id'] = variables.recordInfo.record_time
  pressObj['$lr'] = sensorData[0]
  pressObj['$num_order'] = sensorData[1]
  pressObj['$current_time'] = sensorData_AD[44]
  for (let i = 2; i < 44; i++) {
    pressObj[`$force${i - 1}`] = sensorData[i]
  }
  if(sensorData[0] == 1){
    for (let i = 2; i < 44; i++) {
      pressArray.push(sensorData[i])
    }
    let pressSum = pressArray.reduce((prev, curr) => {
      return prev + curr
    })
    pressTemp.push(pressSum)
  }
  press_temp.push(pressObj)

  ptemp--
  if (ptemp <= 0) sendDataToSave()
}

// 保存wifi数据到数据库
export const saveWifiData = ({ clientName, wifiData }) => {
  if(!wifiData_temp[clientName]) {
    wifiData_temp[clientName] = []
    emgTemp[clientName] = []
  }
  if(wifiData_temp[clientName].length >= 1000){
    let wifiObj = {}
    wifiObj['recordID'] = variables.recordInfo.record_time
    wifiObj['clientName'] = clientName
    wifiObj['recordTime'] = Date.now()//moment().format('YYYY-MM-DD HH:mm:ss')
    wifiObj['wifiData'] = wifiData_temp[clientName]

    wifiRecord_temp.push(wifiObj)
    wtemp--
    wifiData_temp[clientName] = []
  }
  wifiData_temp[clientName].push(wifiData)
  emgTemp[clientName].push(wifiData)

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
    socketResume(err => {
      if (err) console.log('socketResume err', err)
    })
    // 设置全局变量
    variables.userInfo = { shoe_size }
    variables.recordInfo = row
    // 初始化计算模块
    initializeCompute()
    cb()

    // *******Mac测试*******

    // 打开串口
    // openPort(err => {
    //   if (err) {
    //     // 串口打开失败时
    //     removeRecords([row._id])
    //     cb(null, err, -1)
    //   } else {
    //     // 恢复socket数据接收
    //     socketResume(err => {
    //       if (err) console.log('socketResume err', err)
    //     })
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

    // 结束时处理压力值与肌电数据
    let emgObj = {}
    emgObj['recordID'] = variables.recordInfo.record_time
    let pressPosition = [] // 左腿着地的点
    for(let i = 0; i < pressTemp.length; i++){
      if(pressTemp[i] > Threshold){
        if(isLand()){
          pressPosition.push(i)
        }
      }else{
        isLeave()
      }
    }
    let len = pressPosition.length
    pressPosition[len-1] = pressPosition[len-1] - 1

    emgObj['pressPosition'] = pressPosition
    let emgDataArray = {}

    for(let key in emgTemp){
      let emgData = emgTemp[key]
      let emgArray = []
      for(let i = 0; i < len; i++){
        let startPos = pressPosition[i] * 5
        let endPos = pressPosition[i+1] * 5 + 1
        emgArray.push(emgData.slice(startPos, endPos))
      }
      emgDataArray[key] = emgArray
    }

    emgObj['emgData'] = emgDataArray

    sendEmgDataToSave(emgObj)
  })
}
