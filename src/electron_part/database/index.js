import { recordDB, pressDB, wifiPpmDB } from './nedb'
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
}

export const insertWifiData = (data) => {
  wifiPpmDB.insert(data, function (err, newdoc) {
    if (err) console.log('insertWifiData======', err)
  })
}

export const deleteAllRecord = callback => {
  recordDB.remove({}, { multi: true }, callback)
  pressDB.remove({}, { multi: true })
  wifiPpmDB.remove({}, { multi: true })
}

export { recordDB, pressDB }
