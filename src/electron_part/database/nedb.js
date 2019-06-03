const Datastore = require('nedb')
const electron = require('electron')
const path = require('path')
const isDevMode = process.execPath.match(/[\\/]electron/)
let userDataPath = electron.app.getPath('userData') + '/db'
if (isDevMode) userDataPath = path.join(__dirname, './db')

export const recordDB = new Datastore({ filename: `${userDataPath}/record.db`, autoload: true })
export const pressDB = new Datastore({ filename: `${userDataPath}/press.db`, autoload: true })
export const wifiPpmDB = new Datastore({ filename: `${userDataPath}/wifiPpm.db`, autoload: true })
