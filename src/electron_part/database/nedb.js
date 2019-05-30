const Datastore = require('nedb')
const electron = require('electron')
const path = require('path')
const isDevMode = process.execPath.match(/[\\/]electron/)
let userDataPath = electron.app.getPath('userData') + '/db'
if (isDevMode) userDataPath = path.join(__dirname, './db')

export const adminDB = new Datastore({ filename: `${userDataPath}/admin.db`, autoload: true })
export const patientDB = new Datastore({ filename: `${userDataPath}/patient.db`, autoload: true })
export const recordDB = new Datastore({ filename: `${userDataPath}/record.db`, autoload: true })
export const gaitDB = new Datastore({ filename: `${userDataPath}/gait.db`, autoload: true })
export const pressDB = new Datastore({ filename: `${userDataPath}/press.db`, autoload: true })
export const pressAdDB = new Datastore({ filename: `${userDataPath}/pressAd.db`, autoload: true })
export const postureDB = new Datastore({ filename: `${userDataPath}/posture.db`, autoload: true })
