const { pressDB, recordDB } = require('../database')
const { conputeData, initializeCompute } = require('../compute')
const { computeCopEllipse } = require('./report')
import { variables } from '../global_variables'

// 开始回放
export const playback = ({ recordId }, cb) => {
  recordDB.findOne({ _id: recordId }, async (_, record) => {
    if (!record) cb(null, '未找到指定记录', -1)
    else {
      variables.stopFlag = false
      variables.recordInfo = record

      let document = await new Promise(resolve => {
        pressDB
          .findOne({ recordID: variables.recordInfo._id })
          .sort({ currentTime: -1 })
          .projection({ currentTime: 1 })
          .exec((_, doc) => {
            resolve(doc)
          })
      })

      variables.replayInfo.currentTime = record.start_time
      variables.replayInfo.startTime = record.start_time
      variables.replayInfo.endTime = (document && document.currentTime) || record.start_time

      cb()

      initializeCompute()

      computePlayData({})
    }
  })
}

// 停止回放
export const stopplay = (_, cb) => {
  variables.stopFlag = true
  if (typeof cb == 'function') cb(null, '操作成功')
}

// 继续回放
export const continuePlay = ({ startTime = variables.replayInfo.currentTime }, cb) => {
  variables.stopFlag = false
  cb()
  computePlayData({ startTime })
}

// 响应滑动条
export const changePlay = ({ startTime = variables.replayInfo.currentTime }, cb) => {
  let query = { recordID: variables.recordInfo._id }
  if (startTime) query.currentTime = { $gt: startTime }
  pressDB
    .find(query)
    .limit(1)
    .sort({ currentTime: 1 })
    .exec(async (_, items) => {
      if (!items.length) return cb()
      const { LorR, numOrder, currentTime, forces } = items[0]
      let data = [LorR, numOrder, ...forces, currentTime]
      variables.replayInfo.currentTime = currentTime
      conputeData(data)
      cb()
    })
}

const computePlayData = ({ startTime = 0 }) => {
  let query = { recordID: variables.recordInfo._id }
  if (startTime) query.currentTime = { $gt: startTime }
  let skip = 0
  const findItem = () => {
    pressDB
      .find(query)
      .skip(skip++ * 1000)
      .limit(1000)
      .sort({ currentTime: 1 })
      .exec(async (_, items) => {
        for (let i = 0; i < items.length; i++) {
          const { LorR, numOrder, currentTime, forces } = items[i]
          let data = [LorR, numOrder, ...forces, currentTime]
          variables.replayInfo.currentTime = currentTime
          conputeData(data)
          if (variables.stopFlag) return
          await sleep(5)
        }
        if (items.length < 1000) {
          computeCopEllipse()
          stopplay()
        } else findItem()
      })
  }
  findItem()
}

const sleep = time => {
  return new Promise(resolve => {
    setTimeout(resolve, time)
  })
}
