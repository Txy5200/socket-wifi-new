const { findUser, findRecords, removeRecords, deleteAllRecord, findPatients, resetAdmin } = require('../database')

export const userLogin = ({ username, password }, cb) => {
  findUser({ username, password }, (err, data) => {
    if (!data) return cb(null, '账号或密码错误', -1)
    cb(data, '登录成功')
  })
}

export const recordList = ({ page, limit, keyword }, cb) => {
  findRecords({ page, limit, keyword }, (_, data) => {
    cb(data, '操作成功')
  })
}

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

export const patientList = ({ page, limit, keyword }, cb) => {
  findPatients({ page, limit, keyword }, (_, data) => {
    cb(data, '操作成功')
  })
}

export const resetPassword = ({ oldPwd, newPwd }, cb) => {
  resetAdmin({ oldPwd, newPwd }, err => {
    if (err) cb(null, err, -1)
    else cb()
  })
}
