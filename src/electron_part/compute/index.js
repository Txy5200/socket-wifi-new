import { fork } from 'child_process'
import { variables } from '../global_variables'
import { timeToByteArray } from '../lib'

// let gaitChild = fork(__dirname + '/compute_for_gait.js', { silent: true })
let glChild = fork(__dirname + '/compute_for_gl.js', { silent: true })

// 处理步态消息
// gaitChild.on('message', msg => {
//   switch (msg.type) {
//     case 'target':
//       variables.gaitInfo = msg.data
//       break
//     case 'firstGaitFlag':
//       variables.cop_position = []
//       break
//     default:
//       break
//   }
// })

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
    case 'cop':
      variables.copInfo = msg.copInfo

      variables.cop_position.push(msg.cop_position)
      // if (variables.cop_position.length > 10000) variables.cop_position.shift()

      variables.cop_draw.x.push(msg.drawData[0])
      // if (variables.cop_draw.x > 10000) variables.cop_draw.x.shift()
      variables.cop_draw.y.push(msg.drawData[1])
      // if (variables.cop_draw.y > 10000) variables.cop_draw.y.shift()
      variables.cop_draw.modulus_value.push(msg.drawData[2])
      // if (variables.cop_draw.modulus_value > 10000) variables.cop_draw.modulus_value.shift()
      variables.cop_draw.modulus_angle.push(msg.drawData[3])
      // if (variables.cop_draw.modulus_angle > 10000) variables.cop_draw.modulus_angle.shift()
      variables.cop_draw.speed.push(msg.drawData[4])
      // if (variables.cop_draw.speed > 10000) variables.cop_draw.speed.shift()
      variables.cop_draw.speed_angle.push(msg.drawData[5])
      // if (variables.cop_draw.speed_angle > 10000) variables.cop_draw.speed_angle.shift()

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
  // gaitChild.send({ type: 'init', isNewLayout: shoe_size >= 38 })
  glChild.send({ type: 'init', isNewLayout: shoe_size >= 38 })
  variables.data_position = {
    left: [],
    right: []
  }
  variables.wifiPpm = {}
  variables.cop_position = []
  variables.cop_draw = {
    x: [],
    y: [],
    modulus_value: [],
    modulus_angle: [],
    speed: [],
    speed_angle: []
  }
  variables.copInfo = []
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
  variables.copEllipse = {
    x: 0,
    y: 0,
    angle: 0,
    a: 0,
    b: 0
  }
}
