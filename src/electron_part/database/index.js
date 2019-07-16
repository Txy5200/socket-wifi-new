import { recordDB, pressDB, wifiPpmDB, emgDB } from './nedb'
import moment from 'moment'

export const insertRecord = ({ shoe_size }, callback) => {
  let start_time = Date.now()
  let record_time = moment().format('YYYY-MM-DD HH:mm:ss')
  recordDB.insert({ record_time, start_time, shoe_size }, callback)
}

export const removeRecords = (ids, callback) => {
  recordDB.remove({ record_time: { $in: ids } }, { multi: true }, callback)
  pressDB.remove({ recordID: { $in: ids } }, { multi: true })
  wifiPpmDB.remove({ recordID: { $in: ids } }, { multi: true })
  emgDB.remove({ recordID: { $in: ids } }, { multi: true })
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
        name: p['$name'],
        LorR: p['$lr'],
        numOrder: p['$num_order'],
        currentTime: p['$current_time'],
        forces
      }
      objs.push(obj)
    }
    pressDB.insert(objs)
  }
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

export const saveGait = ({ recordId, gaitInfo, copInfo }) => {
  recordDB.update({ _id: recordId }, { $set: { gaitInfo, copInfo } }, () => {
    recordDB.findOne({ _id: recordId }, (_, doc) => {
      // sendSynStatisticsData(doc)
    })
  })
}

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
    // sendDataToServer(str, err => {
    //   if (!err) pressDB.update({ _id: record._id }, { $set: { sendFlag: true } })
    // })
  } catch (e) {
    console.log(e)
  }
}

export const insertWifiData = (data) => {
  wifiPpmDB.insert(data, function (err, newdoc) {
    if (err) console.log('insertWifiData======', err)
  })
}

export const insertEmgData = (data) => {
  emgDB.insert(data, function (err, newdoc) {
    if (err) console.log('insertEmgData======', err)
  })
}

export const deleteAllRecord = callback => {
  recordDB.remove({}, { multi: true }, callback)
  pressDB.remove({}, { multi: true })
  wifiPpmDB.remove({}, { multi: true })
}

export { recordDB, pressDB }
