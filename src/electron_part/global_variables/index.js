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
  } // 当前压力点坐标 [[x, y, press], ...]
}

module.exports = { variables }
