// 记录当前用户信息以及采集记录信息（作用于采集数据时，回放记录时）

let variables = {
  userInfo: {}, // 当前用户信息
  recordInfo: {}, // 当前训练记录信息
  wifiPpm: {
    '192-168-1-101': [],
    '192-168-1-102': [],
    '192-168-1-103': [],
    '192-168-1-104': []
  }, // 当前肌力数据
  data_position: {
    left: [],
    right: []
  }, // 当前压力点坐标 [[x, y, press], ...]
  cop_position: [], // cop 坐标 二维数据(10000 * 2) 例如[[1,2], [3,4]] 记录了10w个坐标点
  copEllipse: {
    x: 0,
    y: 0,
    angle: 0,
    a: 0,
    b: 0
  }, // 站立平衡时，95%椭圆面积
  gaitInfo: {
    gaitCycle_L: 0, // 左腿步态周期：从左跟着地到左跟着地
    gaitCycle_R: 0, // 右腿步态周期：从右跟着地到右跟着地
    singleStance_L: 0, // 左脚单独着地的时间（右脚不着地），右掌离地到右跟着地
    singleStance_R: 0, // 右脚单独着地的时间（左脚不着地），左掌离地到左跟着地
    doubleStance_land_L: 0, // 双腿支撑时间（触地开始）/L：左跟着地到右掌离地
    doubleStance_land_R: 0, // 双腿支撑时间（触地开始）/R：右跟着地到左掌离地
    doubleStance_leave_L: 0, // 双腿支撑时间（离地前）/L：右跟着地到左掌离地
    doubleStance_leave_R: 0, // 双腿支撑时间（离地前）/R：左跟着地到右掌离地
    singleStability_L: 0, // 单腿步态稳定性/L：单腿支撑时间/L  /  左腿步态周期
    singleStability_R: 0, // 单腿步态稳定性/R：单腿支撑时间/R  /  右腿步态周期
    singleASI: 0, // 双腿绝对对称性ASI
    pressure_L: [0, 0, 0], // 下肢负重/L 左脚单腿支撑时间内各部分压力点压力值加和再除以帧数得到三部分压力的平均值
    pressure_R: [0, 0, 0] // 下肢负重/R 右脚单腿支撑时间内各部分压力点压力值加和再除以帧数得到三部分压力的平均值
  },
  copInfo: [], // [cop_x_range, cop_y_range, cop_speed_ave_x, cop_speed_ave_y, cop_speed_ave]
  cop_draw: {
    // COP分解曲线图
    x: [], // Cop-x轴坐标值
    y: [], // Cop-Y轴坐标值
    modulus_value: [], // Cop模值
    modulus_angle: [], // Cop模值角度
    speed: [], // Cop 速度
    speed_angle: [] // Cop 速度角度
  },
  stopFlag: false, // 回放停止符号
  // 回放时记录时间
  replayInfo: {
    currentTime: 0,
    startTime: 0,
    endTime: 0
  }
}

module.exports = { variables }
