const { getPressPart } = require('./position_config')
// 默认为新布局
let pressPart = getPressPart(true)
let leftLandState = false // 左脚着地状态
let rightLandState = false // 右脚着地状态
let characteristicList = [] // 特征值记录 // 1.左跟着地；2.右掌离地；3.右跟着地；4.左掌离地
let characteristicListTime = [] // 特征值时间记录
let lastCharacteristic = null // 记录上一个特征值
let firstState = true // 用来丢掉第一个特征值
// 压力阈值
const Threshold = 5

// 记录出现首个完整步态
let firstGaitFlag = false

// 指标项
let target = {
  gaitCycle_L: 0, // 左腿步态周期：从左跟着地到左跟着地
  gaitCycle_R: 0, // 右腿步态周期：从右跟着地到右跟着地
  singleStance_L: 0, // 左脚单独着地的时间（右脚不着地），右掌离地到右跟着地
  singleStance_R: 0, // 右脚单独着地的时间（左脚不着地），左掌离地到左跟着地
  doubleStance_land_L: 0, // 双腿支撑时间（触地开始）/L：左跟着地到右掌离地
  doubleStance_land_R: 0, // 双腿支撑时间（触地开始）/R：右跟着地到左掌离地
  doubleStance_leave_L: 0, // 双腿支撑时间（离地前）/L：右跟着地到左掌离地
  doubleStance_leave_R: 0, // 双腿支撑时间（离地前）/R：左跟着地到右掌离地
  swing_L: 0, // 左腿摆动相
  swing_R: 0, // 右腿摆动相
  gaitNum_L: 0, // 左腿步态周期
  gaitNum_R: 0, // 右腿步态周期
  pressure_L: [0, 0, 0], // 下肢负重/L 左脚单腿支撑时间内各部分压力点压力值加和再除以帧数得到三部分压力的平均值
  pressure_R: [0, 0, 0] // 下肢负重/R 右脚单腿支撑时间内各部分压力点压力值加和再除以帧数得到三部分压力的平均值
}

let press_L_num = 0 // 记录总的左脚支持帧数
let press_L_temp_num = 0 // 记录单个步态内的左脚支持帧数
let press_L_temp_sum = [0, 0, 0] // 记录单个步态内的各部分压力和

let press_R_num = 0
let press_R_temp_num = 0
let press_R_temp_sum = [0, 0, 0]

// 监听数据流
process.stdin.on('readable', () => {
  let chunk
  while (null !== (chunk = process.stdin.read(56))) {
    computeGait(chunk)
  }
})

// 监听初始化消息
process.on('message', msg => {
  switch (msg.type) {
    case 'init':
      firstGaitFlag = false
      pressPart = getPressPart(msg.isNewLayout)
      leftLandState = false
      rightLandState = false
      characteristicList = []
      characteristicListTime = []
      firstState = true
      press_L_num = 0
      press_L_temp_num = 0
      press_L_temp_sum = [0, 0, 0]
      press_R_num = 0
      press_R_temp_num = 0
      press_R_temp_sum = [0, 0, 0]

      target = {
        gaitCycle_L: 0, // 左腿步态周期：从左跟着地到左跟着地
        gaitCycle_R: 0, // 右腿步态周期：从右跟着地到右跟着地
        singleStance_L: 0, // 左脚单独着地的时间（右脚不着地），右掌离地到右跟着地
        singleStance_R: 0, // 右脚单独着地的时间（左脚不着地），左掌离地到左跟着地
        doubleStance_land_L: 0, // 双腿支撑时间（触地开始）/L：左跟着地到右掌离地
        doubleStance_land_R: 0, // 双腿支撑时间（触地开始）/R：右跟着地到左掌离地
        doubleStance_leave_L: 0, // 双腿支撑时间（离地前）/L：右跟着地到左掌离地
        doubleStance_leave_R: 0, // 双腿支撑时间（离地前）/R：左跟着地到右掌离地
        swing_L: 0, // 左腿摆动相
        swing_R: 0, // 右腿摆动相
        gaitNum_L: 0, // 左腿步态周期
        gaitNum_R: 0, // 右腿步态周期
        pressure_L: [0, 0, 0], // 下肢负重/L 左脚单腿支撑时间内各部分压力点压力值加和再除以帧数得到三部分压力的平均值
        pressure_R: [0, 0, 0] // 下肢负重/R 右脚单腿支撑时间内各部分压力点压力值加和再除以帧数得到三部分压力的平均值
      }
      break
    default:
      break
  }
})

const computeGait = data => {
  const lorR = data[0]

  // 获取压力和
  let press_sum = 0
  for (let index = 0; index < 42; index++) {
    press_sum += data[index + 2]
  }

  // 计算特征值  1:左跟着地；2:右掌离地；3:右跟着地；4:左掌离地；
  const characteristic = getCharacteristic(press_sum, lorR)
  // computePartPress2(characteristic, data, lorR)
  // 去除第一个特征值
  if (characteristic && firstState) return (firstState = false)
  // 从第一个特征值后计算脚部各部分压力
  if (!firstState) computePartPress(characteristic, data, lorR)
  // 如果特征值不存在，就不进行指标值的计算
  if (!characteristic) return
  // 获取特征点的时间差
  const start_time_buffer = data.slice(44, 50)
  const current_time_buffer = data.slice(50, 56)
  let start_time = 0
  let current_time = 0
  for (let i = 0; i < 6; i++) {
    start_time += Math.pow(256, i) * start_time_buffer[5 - i]
    current_time += Math.pow(256, i) * current_time_buffer[5 - i]
  }
  const msFromStart = current_time - start_time

  computeCharacteristic(characteristic, msFromStart)

  process.send({ type: 'target', data: target })
}

// 获取特征值
const getCharacteristic = (press, lorR) => {
  if (press > Threshold) {
    return isLand(lorR)
  } else {
    return isLeave(lorR)
  }
}

// 判断着地
const isLand = lorR => {
  if (lorR == 1) {
    // 获取左脚之前的状态，并将左脚当前着地状态置为 true
    let lastState = leftLandState
    leftLandState = true
    // 如果之前状态为离地，则左跟着地
    if (!lastState) return 1
  } else {
    let lastState = rightLandState
    rightLandState = true
    if (!lastState) return 3
  }
  return null
}

// 判断离地
const isLeave = lorR => {
  if (lorR == 1) {
    // 获取左脚之前的状态，并将左脚当前着地状态置为 false
    let lastState = leftLandState
    leftLandState = false
    // 如果之前状态为着地，则 左掌离地
    if (lastState) return 4
  } else {
    let lastState = rightLandState
    rightLandState = false
    if (lastState) return 2
  }
  return null
}

// 计算各指标值
const computeCharacteristic = (characteristic, msFromStart) => {
  characteristicList.push(characteristic)
  characteristicListTime.push(msFromStart)

  // 特征值不足5个时，不予计算
  if (characteristicList.length < 5) return

  // 左腿步态周期内，计算左腿指标
  if (characteristicList.toString() == [1, 2, 3, 4, 1].toString()) {
    sendfirstGiatSignal()
    target.gaitCycle_L += characteristicListTime[4] - characteristicListTime[0]
    target.singleStance_L += characteristicListTime[2] - characteristicListTime[1]
    target.doubleStance_land_L += characteristicListTime[1] - characteristicListTime[0]
    target.doubleStance_leave_L += characteristicListTime[3] - characteristicListTime[2]
    target.swing_L += characteristicListTime[4] - characteristicListTime[3]
    target.gaitNum_L++
  }

  // 右腿步态周期内，计算右腿指标
  if (characteristicList.toString() == [3, 4, 1, 2, 3].toString()) {
    sendfirstGiatSignal()
    target.gaitCycle_R += characteristicListTime[4] - characteristicListTime[0]
    target.singleStance_R += characteristicListTime[2] - characteristicListTime[1]
    target.doubleStance_land_R += characteristicListTime[1] - characteristicListTime[0]
    target.doubleStance_leave_R += characteristicListTime[3] - characteristicListTime[2]
    target.swing_R += characteristicListTime[4] - characteristicListTime[3]
    target.gaitNum_R++
  }

  characteristicList.shift()
  characteristicListTime.shift()
}

// 计算脚部各部分压力
const computePartPress = (characteristic, data, lorR) => {
  // 状态值发生变化时
  if (characteristic) {
    if (lastCharacteristic === 2) {
      // 如果状态由状态2变为3
      if (characteristic === 3) {
        if (press_L_temp_num != 0) {
          let press_sum_1 = target.pressure_L[0] * press_L_num + press_L_temp_sum[0]
          let press_sum_2 = target.pressure_L[1] * press_L_num + press_L_temp_sum[1]
          let press_sum_3 = target.pressure_L[2] * press_L_num + press_L_temp_sum[2]
          press_L_num += press_L_temp_num
          target.pressure_L = [press_sum_1 / press_L_num, press_sum_2 / press_L_num, press_sum_3 / press_L_num]
        }
      }
      // 开始新一轮的压力计算
      press_L_temp_num = 0
      press_L_temp_sum = [0, 0, 0]
    }
    if (lastCharacteristic === 4) {
      // 状态由左掌离地变为左跟着地
      if (characteristic === 1) {
        if (press_R_temp_num != 0) {
          let press_sum_1 = target.pressure_R[0] * press_R_num + press_R_temp_sum[0]
          let press_sum_2 = target.pressure_R[1] * press_R_num + press_R_temp_sum[1]
          let press_sum_3 = target.pressure_R[2] * press_R_num + press_R_temp_sum[2]
          press_R_num += press_R_temp_num
          target.pressure_R = [press_sum_1 / press_R_num, press_sum_2 / press_R_num, press_sum_3 / press_R_num]
        }
      }
      press_R_temp_num = 0
      press_R_temp_sum = [0, 0, 0]
    }
    // 记录执行状态
    lastCharacteristic = characteristic
  } else {
    // 状态值保持不变时
    // 如果是左脚, 且执行状态为右掌离地
    if (lorR == 1 && lastCharacteristic === 2) {
      // 获取各部分压力和
      let press1 = 0,
        press2 = 0,
        press3 = 0
      for (let i = 0; i < pressPart[0].length; i++) {
        press1 += data[pressPart[0][i] + 1] // pressPart 中从1开始，而data中压力数值index从2开始
      }
      for (let i = 0; i < pressPart[1].length; i++) {
        press2 += data[pressPart[1][i] + 1]
      }
      for (let i = 0; i < pressPart[2].length; i++) {
        press3 += data[pressPart[2][i] + 1]
      }

      if (press1 + press2 + press3 > 0) {
        press_L_temp_num++
        press_L_temp_sum[0] += press1
        press_L_temp_sum[1] += press2
        press_L_temp_sum[2] += press3
      }
    }

    // 如果是右脚, 且执行状态为左掌离地
    if (lorR == 2 && lastCharacteristic === 4) {
      let press1 = 0,
        press2 = 0,
        press3 = 0
      for (let i = 0; i < pressPart[0].length; i++) {
        press1 += data[pressPart[0][i] + 1]
      }
      for (let i = 0; i < pressPart[1].length; i++) {
        press2 += data[pressPart[1][i] + 1]
      }
      for (let i = 0; i < pressPart[2].length; i++) {
        press3 += data[pressPart[2][i] + 1]
      }
      if (press1 + press2 + press3 > 0) {
        press_R_temp_num++
        press_R_temp_sum[0] += press1
        press_R_temp_sum[1] += press2
        press_R_temp_sum[2] += press3
      }
    }
  }
}

// 计算所有的压力
const computePartPress2 = (characteristic, data, lorR) => {
  let press1 = 0,
    press2 = 0,
    press3 = 0

  for (let i = 0; i < pressPart[0].length; i++) {
    press1 += data[pressPart[0][i] + 1] // pressPart 中从1开始，而data中压力数值index从2开始
  }
  for (let i = 0; i < pressPart[1].length; i++) {
    press2 += data[pressPart[1][i] + 1]
  }
  for (let i = 0; i < pressPart[2].length; i++) {
    press3 += data[pressPart[2][i] + 1]
  }

  if (press1 + press2 + press3 > 5) {
    if (lorR == 1) {
      target.pressure_L[0] = (target.pressure_L[0] * press_L_num + press1) / (press_L_num + 1)
      target.pressure_L[1] = (target.pressure_L[1] * press_L_num + press2) / (press_L_num + 1)
      target.pressure_L[2] = (target.pressure_L[2] * press_L_num + press3) / (press_L_num + 1)
      press_L_num++
    } else {
      target.pressure_R[0] = (target.pressure_R[0] * press_R_num + press1) / (press_R_num + 1)
      target.pressure_R[1] = (target.pressure_R[1] * press_R_num + press2) / (press_R_num + 1)
      target.pressure_R[2] = (target.pressure_R[2] * press_R_num + press3) / (press_R_num + 1)
      press_R_num++
    }
  }
}

// 首个完整步态出现后，清空cop坐标点
const sendfirstGiatSignal = () => {
  if (firstGaitFlag) return
  firstGaitFlag = true
  process.send({ type: 'firstGaitFlag' })
}
