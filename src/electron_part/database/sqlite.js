const electron = require('electron')
const fs = require('fs')
const path = require('path')
var sqlite3 = require('sqlite3').verbose()
const isDevMode = process.execPath.match(/[\\/]electron/)

let userDataPath = electron.app.getPath('userData') + '/db'
// mac  /Users/{hostname}/Library/Application Support/gaitsys
// win  C:\Users\{hostname}\AppData\Roaming\gaitsys
if (isDevMode) userDataPath = path.join(__dirname, './db')
const exist = fs.existsSync(userDataPath)
if (!exist) fs.mkdirSync(userDataPath)
const file = userDataPath + '/data.db'
const existFile = fs.existsSync(file)
if (!existFile) fs.openSync(file, 'w')

const db = new sqlite3.Database(file)

const printErrorInfo = function(err) {
  if (err) console.log('Error Message:' + err.message)
}

export const createTables = sqls => {
  db.serialize(() => {
    for (let sql of sqls) {
      db.run(sql, printErrorInfo)
    }
  })
}

export const insertData = (sql, objects) => {
  db.serialize(() => {
    let stmt = db.prepare(sql)
    for (let i = 0; i < objects.length; ++i) {
      stmt.run(objects[i], printErrorInfo)
    }
    stmt.finalize()
  })
}

export const queryData = (sql, callback) => {
  db.all(sql, callback)
}

export const queryOne = (sql, callback) => {
  db.get(sql, callback)
}

export const executeSql = (sql, callback) => {
  db.run(sql, callback)
}
