import { adminDB, patientDB, recordDB, pressDB, wifiPpmDB } from './nedb'
import { sendDataToServer } from '../controller/websocket'
import moment from 'moment'

export const initDataBase = () => {
  // 创建默认管理员
  adminDB.findOne({ username: 'admin' }, (_, doc) => {
    if (!doc) adminDB.insert({ username: 'admin', password: '123456' })
  })
}

export const resetAdmin = ({ oldPwd, newPwd }, callback) => {
  adminDB.findOne({ username: 'admin' }, (_, admin) => {
    if (admin.password != oldPwd) return callback('密码不对')
    adminDB.update({ username: 'admin' }, { $set: { password: newPwd }})
    callback()
  })
}

export const findUser = ({ username, password }, callback) => {
  adminDB.findOne({ username, password }, callback)
}

export const upsertUser = ({ name, certificate_no, height, weigth, shoe_size }, callback) => {
  patientDB.update({ certificate_no }, { name, certificate_no, height, weigth, shoe_size }, { upsert: true }, callback)
}

export const insertRecord = ({ shoe_size }, callback) => {
  let start_time = Date.now()
  let record_time = moment().format('YYYY-MM-DD HH:mm:ss')
  recordDB.insert({ record_time, start_time, shoe_size }, callback)
}

export const removeRecords = (ids, callback) => {
  recordDB.remove({ _id: { $in: ids } }, { multi: true }, callback)
  pressDB.remove({ recordID: { $in: ids } }, { multi: true })
  wifiPpmDB.remove({ recordID: { $in: ids } }, { multi: true })
}

export const insertSerialprotData = ({ press, pressAD, posture }) => {
  if (press.length) {
    let objs = []
    for (let p of press) {
      let forces = []

      for (let i = 1; i < 43; i++) {
        forces.push(p[`$force${i}`])
      }
      let obj = {
        recordID: p['$record_id'],
        LorR: p['$lr'],
        numOrder: p['$num_order'],
        currentTime: p['$current_time'],
        forces
      }
      objs.push(obj)
    }
    pressDB.insert(objs)
  }
  // if (pressAD.length) insertData(`insert into press_ad VALUES(NULL, $record_id, $lr, $num_order, $current_time, ${forceValu.join(',')})`, pressAD)
  // if (posture.length) insertData('insert into posture VALUES(NULL, $record_id, $lr, $num_order, $current_time, $acc_x, $acc_y, $acc_z, $angle_x, $angle_y, $angle_z, $mag_x, $mag_y, $mag_z)', posture)
}

export const insertWifiData = (data) => {
  wifiPpmDB.insert(data, function(err, newdoc){
    if(err) console.log('insertWifiData======', err)
  })
}

export const findRecords = ({ page = 1, limit = 10, keyword }, callback) => {
  page = page * 1
  limit = limit * 1
  let skip = (page - 1) * limit

  const cb = query => {
    recordDB.count(query, function(_, count) {
      recordDB
        .find(query)
        .sort({ start_time: -1 })
        .skip(skip)
        .limit(limit)
        .exec(async function(_, items) {
          let pageInfo = {
            page,
            limit,
            count
          }

          for (let item of items) {
            let pa = await new Promise(function(resolve) {
              patientDB.findOne({ certificate_no: item.certificate_no }, (_, p) => {
                resolve(p)
              })
            })
            item.name = pa && pa.name
          }

          callback(null, { pageInfo, items })
        })
    })
  }

  if (keyword) {
    findPatients({ keyword, limit: 100 }, (_, { items }) => {
      let cers = []
      for (let p of items) cers.push(p.certificate_no)
      let reg = new RegExp(keyword)
      let query = { $or: [{ certificate_no: reg }, { certificate_no: { $in: cers } }] }
      cb(query)
    })
  } else {
    cb({})
  }
}

export const deleteAllRecord = callback => {
  recordDB.remove({}, { multi: true }, callback)
  pressDB.remove({}, { multi: true })
}

export const findPatients = ({ page = 1, limit = 10, keyword }, callback) => {
  page = page * 1
  limit = limit * 1
  let skip = (page - 1) * limit
  let query = {}
  if (keyword) {
    let reg = new RegExp(keyword)
    query = { $or: [{ name: reg }, { certificate_no: reg }] }
  }

  patientDB.count(query, (_, count) => {
    patientDB
      .find(query)
      .skip(skip)
      .limit(limit)
      .exec((_, items) => {
        let pageInfo = {
          page,
          limit,
          count
        }
        callback(null, { pageInfo, items })
      })
  })
}

export const saveGait = ({ recordId, gaitInfo, copInfo }) => {
  recordDB.update({ _id: recordId }, { $set: { gaitInfo, copInfo } }, () => {
    // recordDB.findOne({ _id: recordId }, (_, doc) => {
    //   sendSynStatisticsData(doc)
    // })
  })
}

const colname = [
  'start_datetime',
  'certificateNo',
  'L_Stance_Time',
  'R_Stance_Time',
  'ST1',
  'L_Single_Time',
  'R_Single_Time',
  'ST2',
  'LMaxForce',
  'RMaxForce',
  'ForceRate',
  'STL',
  'STR',
  'ASI',
  'Double_Stance_L',
  'Double_Stance_R',
  'Double_Gait_Time',
  'cop_hor_max_distance',
  'cop_ver_max_distance',
  'cop_hor_average_speed',
  'cop_ver_average_speed',
  'cop_overall_average_speed'
]
const sendSynStatisticsData = record => {
  try {
    if (!record.gaitInfo || !record.copInfo) return
    let value = []
    value.push(record.start_time)
    value.push(record.certificate_no)

    const {
      gaitCycle_L,
      gaitCycle_R,
      singleStance_L,
      singleStance_R,
      doubleStance_land_L,
      doubleStance_land_R,
      doubleStance_leave_L,
      doubleStance_leave_R,
      singleStability_L,
      singleStability_R,
      singleASI,
      pressure_L,
      pressure_R
    } = record.gaitInfo

    value.push(Math.round(singleStance_L))
    value.push(Math.round(singleStance_R))
    if (singleStance_L && singleStance_R) {
      if (singleStance_L > singleStance_R) {
        let st = Math.round((singleStance_L / singleStance_R) * 100) + '%'
        value.push(st)
      } else {
        let st = Math.round((singleStance_R / singleStance_L) * 100) + '%'
        value.push(st)
      }
    } else {
      value.push('')
    }

    value.push(Math.round(gaitCycle_L))
    value.push(Math.round(gaitCycle_R))
    if (gaitCycle_L && gaitCycle_R) {
      if (gaitCycle_L > gaitCycle_R) {
        let st = Math.round((gaitCycle_L / gaitCycle_R) * 100) + '%'
        value.push(st)
      } else {
        let st = Math.round((gaitCycle_R / gaitCycle_L) * 100) + '%'
        value.push(st)
      }
    } else {
      value.push('')
    }

    let lForce = pressure_L[0] + pressure_L[1] + pressure_L[2]
    let rForce = pressure_R[0] + pressure_R[1] + pressure_R[2]
    value.push(Math.round(lForce))
    value.push(Math.round(rForce))
    if (lForce && rForce) {
      if (lForce > rForce) {
        let st = Math.round((lForce / rForce) * 100) + '%'
        value.push(st)
      } else {
        let st = Math.round((rForce / lForce) * 100) + '%'
        value.push(st)
      }
    } else {
      value.push('')
    }

    value.push(Math.round(singleStability_L))
    value.push(Math.round(singleStability_R))
    value.push(Math.round(singleASI))
    value.push(Math.round(doubleStance_land_L + doubleStance_leave_L))
    value.push(Math.round(doubleStance_land_R + doubleStance_leave_R))
    value.push('')

    const copInfo = record.copInfo

    value.push(record.gaitInfo.ST1)

    value.push(Math.round(copInfo[0]))
    value.push(Math.round(copInfo[1]))
    value.push(Math.round(copInfo[2]))
    value.push(Math.round(copInfo[3]))
    value.push(Math.round(copInfo[4]))

    let str = 'SynStatisticsData||' + colname.join(',') + '||' + value.join(',')
    sendDataToServer(str, err => {
      if (!err) pressDB.update({ _id: record._id }, { $set: { sendFlag: true } })
    })
  } catch (e) {
    console.log(e)
  }
}

const sendRedcord = () => {
  recordDB
    .find({ sendFlag: { $ne: true } })
    .limit(100)
    .exec((_, docs) => {
      for (let doc of docs) sendSynStatisticsData(doc)
    })
}

setInterval(sendRedcord, 5 * 60 * 1000)

export { recordDB, pressDB }
