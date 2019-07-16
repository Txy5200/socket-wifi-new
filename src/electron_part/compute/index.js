import { fork } from 'child_process'
import { variables } from '../global_variables'
import { timeToByteArray } from '../lib'

let glChild = fork(__dirname + '/compute_for_gl.js', { silent: true })
let gaitChild = fork(__dirname + '/compute_for_gait.js', { silent: true })
// 处理绘制消息
glChild.on('message', msg => {
  switch (msg.type) {
    case 'press':
      let lorR = msg.data_position.LorR
      if (lorR == 1) {
        variables.data_position.left = msg.data_position.data
      } else {
        variables.data_position.right = msg.data_position.data
      }
      break
    default:
      break
  }
})

// 处理步态消息
gaitChild.on('message', msg => {
  switch (msg.type) {
    case 'target':
      // console.log('========target=========', msg.data)
      variables.gaitInfo = { ...variables.gaitInfo, ...msg.data }
      break
    case 'firstGaitFlag':
      variables.cop_position = []
      break
    default:
      break
  }
})

// 计算信息
export const conputeData = data => {
  let data_buffer = Buffer.from(data.slice(0, 44))
  if (glChild.connected) glChild.stdin.write(data_buffer)

  const { start_time } = variables.recordInfo
  const current_time = data[44]
  if (!start_time || !current_time) {
    console.log('缺少时间')
  } else {
    const start_buffer = timeToByteArray(start_time) // 生成6个字节的buffer
    const current_buffer = timeToByteArray(current_time)
    let buf = Buffer.concat([data_buffer, start_buffer, current_buffer])
    if (gaitChild.connected) gaitChild.stdin.write(buf)
  }
}

// 初始化变量
export const initializeCompute = () => {
  const { shoe_size } = variables.recordInfo
  glChild.send({ type: 'init', isNewLayout: shoe_size >= 38 })
  variables.data_position = {
    left: [],
    right: []
  }
  variables.gaitInfo = {
    gaitCycle_L: 0,
    gaitCycle_R: 0,
    singleStance_L: 0,
    singleStance_R: 0,
    doubleStance_land_L: 0,
    doubleStance_land_R: 0,
    doubleStance_leave_L: 0,
    doubleStance_leave_R: 0,
    singleStability_L: 0,
    singleStability_R: 0,
    singleASI: 0,
    pressure_L: [0, 0, 0],
    pressure_R: [0, 0, 0]
  }
  variables.wifiPpm = {
    '192-168-1-101': [],
    '192-168-1-102': [],
    '192-168-1-103': [],
    '192-168-1-104': [],
    '192-168-1-105': [],
    '192-168-1-106': [],
    '192-168-1-107': [],
    '192-168-1-108': [],
    '192-168-1-109': [],
    '192-168-1-110': [],
    '192-168-1-111': [],
    '192-168-1-112': [],
    '192-168-1-113': [],
    '192-168-1-114': [],
    '192-168-1-115': [],
    '192-168-1-116': []
  }
}
