import { fork } from 'child_process'
import { variables } from '../global_variables'

let glChild = fork(__dirname + '/compute_for_gl.js', { silent: true })

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

// 计算信息
export const conputeData = data => {
  let data_buffer = Buffer.from(data.slice(0, 44))
  if (glChild.connected) glChild.stdin.write(data_buffer)
}

// 初始化变量
export const initializeCompute = () => {
  const { shoe_size } = variables.recordInfo
  glChild.send({ type: 'init', isNewLayout: shoe_size >= 38 })
  variables.data_position = {
    left: [],
    right: []
  }
  variables.wifiPpm = {
    '192-168-1-101': [],
    '192-168-1-102': [],
    '192-168-1-103': [],
    '192-168-1-104': []
  }
}
