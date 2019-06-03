const { removeRecords, deleteAllRecord } = require('../database')

export const recordDelete = ({ ids }, cb) => {
  removeRecords(ids, (_, data) => {
    cb(data, '操作成功')
  })
}

export const recordDeleteAll = (_, cb) => {
  deleteAllRecord((_, data) => {
    cb(data, '操作成功')
  })
}
