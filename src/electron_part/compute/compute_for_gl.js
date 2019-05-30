// 旧版左脚42点对应的像素点
const { getPosition } = require('./position_config')
// 默认为新布局
let position = getPosition(true)
const MAX_X = 452
const MAX_Y = 528
let cop_x_temp = 0 // 记录 上一个 x
let cop_y_temp = 0 // 记录 上一个 y

let cop_x_max = 0 // 记录最大的x 用以计算cop指标
let cop_x_min = 0
let cop_y_max = 0
let cop_y_min = 0

let cop_count = 0 // 记录cop计算次数
let cop_speed_ave = 0 //  COP整体移动平均速度
let cop_speed_ave_x = 0 // COP左右移动平均速度
let cop_speed_ave_y = 0 // COP左右移动平均速度

let cop_source_X = [] // cop X原始坐标 最多保留5个，用作中心平均滤波
let cop_source_Y = [] // cop Y原始坐标 最多保留5个，用作中心平均滤波

let modulus_value_temp = null
let modulus_angle_temp = null
let speed_temp = null
let speed_angle_temp = null

// 分别缓存上一帧左右脚压力值
let press_L = Buffer.alloc(42)
let press_R = Buffer.alloc(42)

let compute_num = 5

// 监听数据流
process.stdin.on('readable', () => {
  let chunk
  while (null !== (chunk = process.stdin.read(44))) {
    computedata_position(chunk)
    computeCOP_position(chunk)
  }
})

// 监听初始化消息
process.on('message', msg => {
  switch (msg.type) {
    case 'init':
      position = getPosition(msg.isNewLayout)
      press_L = Buffer.alloc(42)
      press_R = Buffer.alloc(42)
      cop_x_temp = 0
      cop_y_temp = 0
      cop_source_X = []
      cop_source_Y = []
      cop_x_max = 0
      cop_x_min = 0
      cop_y_max = 0
      cop_y_min = 0
      cop_count = 0
      cop_speed_ave = 0
      cop_speed_ave_x = 0
      cop_speed_ave_y = 0
      modulus_value_temp = null
      modulus_angle_temp = null
      speed_temp = null
      speed_angle_temp = null
      compute_num = 0
      break
    default:
      break
  }
})

// 计算各像素压力
const computedata_position = data => {
  const { l_position, r_position } = position
  const LorR = data[0]
  const pos = LorR === 1 ? l_position : r_position
  const pressArray = data.slice(2, 44)

  let dataArray = []

  for (let i = 0; i < pressArray.length; i++) {
    //     // 获取点的压力 以及 坐标
    let press = pressArray[i]
    // 将坐标原点从中心移动到左下角
    let x = pos[i][0] + MAX_X / 2
    let y = pos[i][1] + MAX_Y / 2
    dataArray.push([x, y, press])
    // 对每个点 以及半径为 10 的像素点点进行赋值
    // for (let m = 0; m <= 20; m++) {
    //   for (let n = 0; n <= 20; n++) {
    //     // 获取附近点的坐标, 如果超出坐标系，不予计算
    //     let xi = x + m - 10
    //     let yi = y + n - 10
    //     if (xi < 0 || xi > 452) continue
    //     if (yi < 0 || yi > 528) continue
    //     // 通过距离，求出周围点的压力
    //     let distance = Math.sqrt(Math.pow(m - 10, 2) + Math.pow(n - 10, 2))
    //     if (distance > 10) continue
    //     let press_i = Math.round(press * (1 - distance / 10))
    //     // 同一像素点赋值时，赋较大的数
    //     data_position[xi][yi] = press_i > data_position[xi][yi] ? press_i : data_position[xi][yi]
    //   }
    // }
  }

  process.send({ type: 'press', data_position: { LorR, data: dataArray } })
}

// 计算cop
const computeCOP_position = data => {
  const { l_position, r_position } = position

  // 缓存压力数据
  const LorR = data[0]
  const pressArray = data.slice(2, 44)
  if (LorR == 1) press_L = pressArray
  else press_R = pressArray

  // 左右脚压力和
  let force_sum_L = 0
  let force_sum_R = 0
  for (let i = 0; i < 42; i++) {
    force_sum_L += press_L[i]
    force_sum_R += press_R[i]
  }
  // 两脚压力和均小于4时，不计算
  if (force_sum_L < 4 && force_sum_R < 4) return

  let force_posX_sum = 0
  let force_posY_sum = 0

  for (let i = 0; i < 42; i++) {
    if (force_sum_L < 4 && force_sum_R >= 4) {
      force_posX_sum += press_R[i] * r_position[i][0]
      force_posY_sum += press_R[i] * r_position[i][1]
    }

    if (force_sum_L >= 4 && force_sum_R < 4) {
      force_posX_sum += press_L[i] * l_position[i][0]
      force_posY_sum += press_L[i] * l_position[i][1]
    }

    if (force_sum_L >= 4 && force_sum_R >= 4) {
      force_posX_sum += press_L[i] * l_position[i][0] + press_R[i] * r_position[i][0]
      force_posY_sum += press_L[i] * l_position[i][1] + press_R[i] * r_position[i][1]
    }
  }

  // 计算cop坐标
  let cop_x = force_posX_sum / (force_sum_L + force_sum_R)
  let cop_y = force_posY_sum / (force_sum_L + force_sum_R)
  // 中心平均滤波
  let { cop_x_new, cop_y_new } = filterAD(cop_x, cop_y)
  if (compute_num-- >= 0) return
  const drawData = computeCopDraw(cop_x_new, cop_y_new)
  const copInfo = computeCopInfo(cop_x_new, cop_y_new)
  cop_x_temp = cop_x_new
  cop_y_temp = cop_y_new
  // 将坐标移动到第一象限
  cop_x_new += MAX_X / 2
  cop_y_new += MAX_Y / 2
  process.send({ type: 'cop', cop_position: [cop_x_new, cop_y_new], drawData, copInfo })
}

// 计算cop分解曲线
const computeCopDraw = (x, y) => {
  const last_x = cop_x_temp
  const last_y = cop_y_temp

  let modulus_value = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2))
  if (modulus_value_temp) modulus_value = 0.5 * (modulus_value + modulus_value_temp) // 低通滤波
  let modulus_angle = Math.atan(y / x)
  if (modulus_angle_temp) modulus_angle = 0.5 * (modulus_angle + modulus_angle_temp)
  let speed = Math.sqrt(Math.pow(x - last_x, 2) + Math.pow(y - last_y, 2)) / 0.005
  if (speed > 20000) speed = 0
  if (speed_temp) speed = 0.5 * (speed + speed_temp)
  let speed_angle = Math.atan((y - last_y) / (x - last_x))
  if (speed_angle_temp) speed_angle = 0.5 * (speed_angle + speed_angle_temp)

  modulus_value_temp = modulus_value
  modulus_angle_temp = modulus_angle
  speed_temp = speed
  speed_angle_temp = speed_angle

  return [x, y, modulus_value, modulus_angle, speed, speed_angle]
}

// 对新值及其前面的4个数据共计5个数据用于中心平均滤波。
const filterAD = (cop_x, cop_y) => {
  cop_source_X.push(cop_x)
  cop_source_Y.push(cop_y)
  if (cop_source_X.length > 5) {
    cop_source_X.shift()
    cop_source_Y.shift()
  }

  // 如果小于五组数据直接返回
  if (cop_source_X.length < 5)
    return {
      cop_x_new: Math.round(cop_x),
      cop_y_new: Math.round(cop_y)
    }

  let min_x = cop_source_X[0]
  let max_x = cop_source_X[0]
  let min_y = cop_source_Y[0]
  let max_y = cop_source_Y[0]
  let sum_x = 0
  let sum_y = 0
  for (let i = 0; i < 5; i++) {
    let itemX = cop_source_X[i]
    let itemY = cop_source_Y[i]

    sum_x += itemX
    sum_y += itemY
    if (itemX < min_x) min_x = itemX
    if (itemX > max_x) max_x = itemX

    if (itemY < min_y) min_y = itemY
    if (itemY > max_y) max_y = itemY
  }
  let average_x = Math.round((sum_x - max_x - min_x) / 3)
  let average_y = Math.round((sum_y - min_y - max_y) / 3)
  return {
    cop_x_new: average_x,
    cop_y_new: average_y
  }
}

const computeCopInfo = (x, y) => {
  if (x > cop_x_max) cop_x_max = x
  if (x < cop_x_min) cop_x_min = x
  if (y > cop_y_max) cop_y_max = y
  if (y < cop_y_min) cop_y_min = y

  const cop_x_range = cop_x_max - cop_x_min
  const cop_y_range = cop_y_max - cop_y_min

  const var_x = x - cop_x_temp
  const var_y = y - cop_y_temp

  const distance = Math.sqrt(Math.pow(var_y, 2) + Math.pow(var_x, 2))
  const cop_speed = distance / 0.005
  cop_speed_ave = (cop_speed_ave * cop_count + cop_speed) / (cop_count + 1)

  const cop_speed_x = var_x / 0.005
  const cop_speed_y = var_y / 0.005
  cop_speed_ave_x = (cop_speed_ave_x * cop_count + cop_speed_x) / (cop_count + 1)
  cop_speed_ave_y = (cop_speed_ave_y * cop_count + cop_speed_y) / (cop_count + 1)

  cop_count++
  return [cop_x_range, cop_y_range, cop_speed_ave_x, cop_speed_ave_y, cop_speed_ave]
}
