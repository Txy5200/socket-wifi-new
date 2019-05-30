import { createTables, queryData, insertData, queryOne, executeSql } from './sqlite'

let forceString = ''
let forceValu = []
for (let i = 1; i < 43; i++) {
  forceString += `force${i} INTEGER NOT NULL,`
  forceValu.push(`$force${i}`)
}

// 初始化数据库
export const initDataBase = () => {
  const createUserSql = `create table if not exists user(
    username TEXT PRIMARY KEY NOT NULL, 
    password TEXT NOT NULL
  );`

  const createPatientSql = `create table if not exists patient(
    name TEXT NOT NULL, 
    certificate_no TEXT PRIMARY KEY NOT NULL, 
    height INTEGER, 
    weigth INTEGER, 
    shoe_size INTEGER NOT NULL
  );`

  const createRecordSql = `create table if not exists record(
    id INTEGER PRIMARY KEY AUTOINCREMENT, 
    certificate_no TEXT NOT NULL, 
    start_time INTEGER NOT NULL, 
    shoe_size INTEGER NOT NULL,
    FOREIGN KEY (certificate_no) REFERENCES patient(certificate_no) ON DELETE CASCADE
  );`

  const createGaitSql = `create table if not exists gait(
    id INTEGER PRIMARY KEY AUTOINCREMENT, 
    record_id INTEGER NOT NULL, 
    l_stance_time INTEGER, 
    r_stance_time INTEGER, 
    l_cycle_time INTEGER, 
    r_cycle_time INTEGER, 
    l_max_force INTEGER, 
    r_max_force INTEGER, 
    stl INTEGER, 
    str INTEGER, 
    double_stance_l INTEGER, 
    double_stance_r INTEGER, 
    gait_cyc INTEGER, 
    l_lf INTEGER, 
    l_lb INTEGER, 
    l_rf INTEGER, 
    l_rb INTEGER, 
    r_lf INTEGER, 
    r_lb INTEGER, 
    r_rf INTEGER, 
    r_rb INTEGER, 
    ver_max_distance INTEGER, 
    hor_max_distance INTEGER, 
    hor_average_speed INTEGER, 
    ver_average_speed INTEGER, 
    overall_average_speed INTEGER, 
    FOREIGN KEY (record_id) REFERENCES record(id) ON DELETE CASCADE
  );`

  const createPressSql = `create table if not exists press(
    id INTEGER PRIMARY KEY AUTOINCREMENT, 
    record_id INTEGER NOT NULL, 
    lr INTEGER NOT NULL, 
    num_order INTEGER NOT NULL, 
    current_time INTEGER NOT NULL, 
    ${forceString}
    FOREIGN KEY (record_id) REFERENCES record(id) ON DELETE CASCADE
  );`

  const createPressAdSql = `create table if not exists press_ad(
    id INTEGER PRIMARY KEY AUTOINCREMENT, 
    record_id INTEGER NOT NULL, 
    lr INTEGER NOT NULL, 
    num_order INTEGER NOT NULL, 
    current_time INTEGER NOT NULL, 
    ${forceString}
    FOREIGN KEY (record_id) REFERENCES record(id) ON DELETE CASCADE
  );`

  const createPostureSql = `create table if not exists posture(
    id INTEGER PRIMARY KEY AUTOINCREMENT, 
    record_id INTEGER NOT NULL, 
    lr INTEGER NOT NULL, 
    num_order INTEGER NOT NULL, 
    current_time INTEGER NOT NULL, 
    acc_x INTEGER NOT NULL, 
    acc_y INTEGER NOT NULL, 
    acc_z INTEGER NOT NULL, 
    angle_x INTEGER NOT NULL, 
    angle_y INTEGER NOT NULL, 
    angle_z INTEGER NOT NULL, 
    mag_x INTEGER NOT NULL, 
    mag_y INTEGER NOT NULL, 
    mag_z INTEGER NOT NULL, 
    FOREIGN KEY (record_id) REFERENCES record(id) ON DELETE CASCADE
  );`

  // 开启外键
  queryOne('PRAGMA foreign_keys = ON')

  createTables([createUserSql, createPatientSql, createRecordSql, createGaitSql, createPressSql, createPressAdSql, createPostureSql])

  // 创建默认管理员
  queryOne(`select * from user`, (_, row) => {
    if (!row) insertData(`INSERT INTO user VALUES (?, ?)`, [['admin', '123456']])
  })
}

export const findUser = ({ username, password }, callback) => {
  const sql = `select * from user where username='${username}' and password='${password}'`
  queryOne(sql, callback)
}

export const upsertUser = ({ name, certificate_no, height = 'NULL', weigth = 'NULL', shoe_size }, callback) => {
  queryOne(`select * from patient where certificate_no='${certificate_no}'`, (_, pat) => {
    if (pat) {
      executeSql(`update patient set name='${name}',height=${height},weigth=${weigth},shoe_size=${shoe_size} where certificate_no='${certificate_no}'`, callback)
    } else {
      executeSql(`INSERT INTO patient VALUES ('${name}', '${certificate_no}', ${height}, ${weigth}, ${shoe_size})`, callback)
    }
  })
}

export const insertRecord = ({ certificate_no, shoe_size }, callback) => {
  let start_time = Date.now()
  executeSql(`INSERT INTO record VALUES (NULL, '${certificate_no}', ${start_time}, ${shoe_size})`, err => {
    if (err) return callback(err)
    queryOne(`select * from record where certificate_no='${certificate_no}' and start_time=${start_time}`, (err, row) => {
      callback(err, row)
    })
  })
}

export const removeRecords = (ids, callback) => {
  executeSql(`delete from record where id in(${ids.join(',')})`, callback)
}

export const insertSerialprotData = ({ press, pressAD, posture }) => {
  if (press.length) insertData(`insert into press VALUES(NULL, $record_id, $lr, $num_order, $current_time, ${forceValu.join(',')})`, press)
  if (pressAD.length) insertData(`insert into press_ad VALUES(NULL, $record_id, $lr, $num_order, $current_time, ${forceValu.join(',')})`, pressAD)
  if (posture.length) insertData('insert into posture VALUES(NULL, $record_id, $lr, $num_order, $current_time, $acc_x, $acc_y, $acc_z, $angle_x, $angle_y, $angle_z, $mag_x, $mag_y, $mag_z)', posture)
}

export const findRecords = ({ page = 1, limit = 10, keyword }, callback) => {
  let countSql = `select count(*) as count from record r left join patient p where p.certificate_no = r.certificate_no`

  if (keyword) countSql += ` and (p.certificate_no like '%${keyword}%' or p.name like '%${keyword}%')`

  let sql = `select p.name,r.certificate_no,r.start_time,r.id as record_id from record r left join patient p where p.certificate_no = r.certificate_no order by start_time DESC Limit ${limit} Offset ${limit *
    (page * 1 - 1)}`

  if (keyword)
    sql = `select p.name,r.certificate_no,r.start_time,r.id as record_id from record r left join patient p where p.certificate_no = r.certificate_no and (p.certificate_no like '%${keyword}%' or p.name like '%${keyword}%') order by start_time DESC Limit ${limit} Offset ${limit *
      (page * 1 - 1)}`
  queryOne(countSql, (_, count) => {
    let page_info = {
      page,
      limit,
      count: count.count
    }
    queryData(sql, (_, data) => {
      callback(null, { page_info, items: data })
    })
  })
}

export const deleteRecord = ({ ids }, callback) => {
  const sql = `delete from record where id in(${ids}) `
  executeSql(sql, callback)
}

export const deleteAllRecord = callback => {
  const sql = `delete from record`
  executeSql(sql, callback)
}

export const findPatients = ({ page = 1, limit = 10, keyword }, callback) => {
  let countSql = 'select count(*) as count from patient'
  if (keyword) countSql += ` where certificate_no like '%${keyword}%' or name like '%${keyword}%'`
  let querySql = 'select * from patient'
  if (keyword)  querySql += ` where certificate_no like '%${keyword}%' or name like '%${keyword}%'`
  querySql += ` Limit ${limit} Offset ${limit * (page * 1 - 1)}`
  queryOne(countSql, (_, count) => {
    let page_info = {
      page,
      limit,
      count: count.count
    }
    queryData(querySql, (_, data) => {
      callback(null, { page_info, items: data })
    })
  })
}

// export { queryData, insertData, queryOne, executeSql, initDataBase }
// /**
//  * user  管理员
//  * {
//  *     字段名     字段类型    备注说明
//  *     username  String     用户名
//  *     password  String     密码
//  * }
//  */

// /**
//  * patient  患者
//  * {
//  *     字段名           字段类型    备注说明
//  *     name            String     姓名
//  *     certificate_no   String     身份证号码
//  *     height          Number     身高（cm）
//  *     weigth          Number     体重（kg）
//  *     shoe_size        Number     鞋码 (最近一次测试的鞋码)
//  * }
//  */

// /**
//  * record 训练记录
//  * {
//  *     字段名           字段类型    备注说明
//  *     id               Number      主键
//  *     certificate_no   String     身份证号码
//  *     start_time       Number     训练开始时间
//  *     shoe_size        Number     鞋码
//  * }
//  */

// /**
//  * gaitDB  步态信息
//  * {
//  *     字段名             字段类型    备注说明
//  *     recordID          String     训练记录id
//  *     lStanceTime       Number     左脚支撑时间
//  *     rStanceTime       Number     右脚支撑时间
//  *     lCycleTime        Number     左脚步态周期
//  *     rCycleTime        Number     右脚步态周期
//  *     lMaxForce         Number     左肢负重
//  *     rMaxForce         Number     右肢负重
//  *     stl               Number     左腿步态稳定性
//  *     str               Number     右腿步态稳定性
//  *     doubleStanceL     Number     双腿支撑时间左
//  *     doubleStanceR     Number     双腿支撑时间右
//  *     gaitCyc           Number     双腿步态周期
//  *     l_lf              Number     L-左前
//  *     l_lb              Number     L-左后
//  *     l_rf              Number     L-右前
//  *     l_rb              Number     L-右后
//  *     r_lf              Number     r-左前
//  *     r_lb              Number     r-左后
//  *     r_rf              Number     r-右前
//  *     r_rb              Number     r-右后
//  *     verMaxDistance    Number     COP-前后最大距离
//  *     horMaxDistance    Number     COP-左右最大距离
//  *     horAverageSpeed   Number     COP-左右移动平均速度
//  *     verAverageSpeed   Number     COP-前后移动平均速度
//  *     overallAverageSpeed    Number     COP-整体移动平均速度
//  * }
//  */

// /**
//  * press 压力数据
//  * {
//  *     字段名          字段类型       备注说明
//  *     recordID       String       训练记录id
//  *     LorR           Number       1为左脚，2为右脚
//  *     numOrder       Number       序号
//  *     currentTime    Number       上传时间
//  *     forces         【Number】     42个点的压力数据
//  * }
//  */

// /**
//  * pressAd 压力Ad数据（串口原始数据）
//  * {
//  *     字段名          字段类型       备注说明
//  *     recordID       String       训练记录id
//  *     LorR           Number       1为左脚，2为右脚
//  *     numOrder       Number       序号
//  *     currentTime    Number       上传时间
//  *     forces         【Number】     42个点的压力数据
//  * }
//  */

// /**
//  * posture 姿态信息
//  * {
//  *     字段名          字段类型       备注说明
//  *     recordID       String       训练记录id
//  *     LorR           Number       1为左脚，2为右脚
//  *     numOrder       Number       序号
//  *     AccX           Number
//  *     AccY           Number
//  *     AccZ           Number
//  *     AngleX         Number
//  *     AngleY         Number
//  *     AngleZ         Number
//  *     MagX           Number
//  *     MagY           Number
//  *     MagZ           Number
//  * }
//  */
