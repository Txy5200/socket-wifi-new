// 记录当前用户信息以及采集记录信息（作用于采集数据时，回放记录时）

let variables = {
  userInfo: {}, // 当前用户信息
  recordInfo: {}, // 当前训练记录信息
  gaitInfo: {
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
    gaitNum_L: 0, // 左腿步态周期个数
    gaitNum_R: 0, // 右腿步态周期个数
    singleStability_L: 0, // 单腿步态稳定性/L： swing_L / gaitCycle_L
    singleStability_R: 0, // 单腿步态稳定性/R： swing_R / gaitCycle_R
    singleASI: 0, // 双腿绝对对称性ASI  2 * |singleStance_L - singleStance_R| / (singleStance_L + singleStance_R)
    pressure_L: [0, 0, 0], // 下肢负重/L 左脚单腿支撑时间内各部分压力点压力值加和再除以帧数得到三部分压力的平均值
    pressure_R: [0, 0, 0] // 下肢负重/R 右脚单腿支撑时间内各部分压力点压力值加和再除以帧数得到三部分压力的平均值
  },
  wifiPpm: {
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
  }, // 当前肌力数据
  data_position: {
    left: [],
    right: []
  } // 当前压力点坐标 [[x, y, press], ...]
}

module.exports = { variables }
