const { upsertUser, insertRecord, removeRecords, insertSerialprotData, saveGait } = require('../database')
import { openSerialport as openPort, closeSerialport as closePort, querySerialportList, setSerialport } from '../serialport'
import { variables } from '../global_variables'
import { initializeCompute } from '../compute'
import { computeCopEllipse } from './report'

let press_AD_temp = []
let press_temp = []
let posture_temp = []
let temp = 10000 // 计数器 用于批量插入数据

const sendDataToSave = () => {
  insertSerialprotData({ press: press_temp, pressAD: press_AD_temp, posture: posture_temp })
  press_temp = []
  press_AD_temp = []
  posture_temp = []
  temp = 10000
}

// 保存串口数据到数据库
export const saveData = ({ sensorData_AD, sensorData, posturedata }) => {
  let pressObj = {}
  pressObj['$record_id'] = variables.recordInfo._id
  pressObj['$lr'] = sensorData[0]
  pressObj['$num_order'] = sensorData[1]
  pressObj['$current_time'] = sensorData_AD[44]
  for (let i = 2; i < 44; i++) {
    pressObj[`$force${i - 1}`] = sensorData[i]
  }
  press_temp.push(pressObj)

  let pressAdObj = {}
  pressAdObj['$record_id'] = variables.recordInfo._id
  pressAdObj['$lr'] = sensorData_AD[0]
  pressAdObj['$num_order'] = sensorData_AD[1]
  pressAdObj['$current_time'] = sensorData_AD[44]
  for (let i = 2; i < 44; i++) {
    pressAdObj[`$force${i - 1}`] = sensorData_AD[i]
  }
  press_AD_temp.push(pressAdObj)

  let posturObj = {}
  posturObj['$record_id'] = variables.recordInfo._id
  posturObj['$lr'] = posturedata[0]
  posturObj['$num_order'] = posturedata[1]
  posturObj['$current_time'] = sensorData_AD[11]
  posturObj['$acc_x'] = posturedata[2]
  posturObj['$acc_y'] = posturedata[3]
  posturObj['$acc_z'] = posturedata[4]
  posturObj['$angle_x'] = posturedata[5]
  posturObj['$angle_y'] = posturedata[6]
  posturObj['$angle_z'] = posturedata[7]
  posturObj['$mag_x'] = posturedata[8]
  posturObj['$mag_y'] = posturedata[9]
  posturObj['$mag_z'] = posturedata[10]
  posture_temp.push(posturObj)

  temp--
  if (temp <= 0) sendDataToSave()
}

// 打开串口 接收串口数据
export const openSerialport = ({ name, certificate_no, height, weigth, shoe_size }, cb) => {
  if (!name || !certificate_no || !shoe_size) return cb(null, '缺少用户信息', -1)

  // 创建或者更新患者信息
  upsertUser({ name, certificate_no, height, weigth, shoe_size }, () => {
    // 插入训练记录
    insertRecord({ certificate_no, shoe_size }, (_, row) => {
      if (!row) return cb(null, '创建记录失败', -1)
      // 打开串口
      openPort(err => {
        if (err) {
          // 串口打开失败时
          removeRecords([row._id])
          cb(null, err, -1)
        } else {
          // 设置全局变量
          variables.userInfo = { name, certificate_no, height, weigth, shoe_size }
          variables.recordInfo = row
          // 初始化计算模块
          initializeCompute()
          cb()
        }
      })
    })
  })
}

// 关闭串口，并结束计算
export const closeSerialport = (_, cb) => {
  closePort(err => {
    if (err) return cb(null, err, -1)
    cb()
    // 计算站立平衡时，95%cop椭圆面积
    computeCopEllipse()
    // 结束时，保存缓存里的数据
    sendDataToSave()
    // 在记录中存储步态指标
    saveGait({ recordId: variables.recordInfo._id, gaitInfo: variables.gaitInfo, copInfo: variables.copInfo })
  })
}

// 查询端口
export const querySerialport = (_, cb) => {
  querySerialportList(cb)
}

// 配置端口
export const configSerialport = ({ portName1, portName2 }, cb) => {
  if (!portName1 || !portName2) cb(null, '数据不对', -1)
  setSerialport([portName1, portName2])
  cb()
}
