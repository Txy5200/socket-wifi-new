import React, { Component } from 'react';
import xlsx from 'node-xlsx';
import { connect } from 'react-redux';
import { ChartDynamicPressureScatter, CharLine } from '../components';
import { Modal, message, Button, Input } from 'antd'
import { openSerialport, closeSerialport, setCurrentRecordID, deleteHistoryRecord, setUserInfo, setGaitInfo } from '../ducks';
import fs from 'fs'
import path from 'path'
import readline from 'readline'
import { formatEmgData } from '../helper/util'
import PressAnalysis from './pressAnalysis'

const globalVariable = require('electron').remote.getGlobal('variables');
const { dialog, app } = require('electron').remote
message.config({
  top: 60
});
class Inspection extends Component {
  constructor(props) {
    super(props);
    this.state = {
      deviceArrayJson: globalVariable.wifiPpm || {},
      initxAxisData: [],
      startState: false,
      endState: false,
      playState: false,
      pressureArrayData: [],
      userData: {},
      page: 1, // 1-首页，2-压力分析
    };
  }

  componentDidMount() {
    let initxAxisData = []
    for (let i = 0; i < 3000; i++) {
      initxAxisData.push(i)
    }
    const { user } = this.props
    this.setState({ initxAxisData, userData: { ...user } })
  }

  componentWillUnmount() {
    clearInterval(this.timeOut);
  }

  // 开始检测后定时获取全局变量中的数据
  intervalFunc() {
    const { data_position, wifiPpm } = globalVariable;
    const { left, right } = data_position;
    let pressureArrayData = [...left, ...right];
    this.setState({ pressureArrayData, deviceArrayJson: wifiPpm });
  }

  // 开始检测
  startInspect() {
    const { openSerialport } = this.props;
    const {userData} = this.state
    const {name = '', age = '', sex = ''} = userData
    let result = openSerialport({name, age, sex})
    if (result.code !== 200) {
      message.error('串口打开错误')
      return
    } else {
      this.timeOut = setInterval(this.intervalFunc.bind(this), 20);
      this.setState({ startState: true, endState: false });
    }
  }

  // 结束检测
  endInspect() {
    const { recordInfo, gaitInfo } = globalVariable
    // const { timeOut } = this.state;
    const { closeSerialport, deleteHistoryRecord } = this.props;
    let result = closeSerialport()
    if (result.code !== 200) {
      message.error('串口关闭错误')
    } else {
      clearInterval(this.timeOut);
      if (!recordInfo._id) {
        message.error('记录数据错误')
        return
      }
      // 存贮当前记录id
      this.props.setCurrentRecordID({ currentRecordId: recordInfo._id });
      this.props.setGaitInfo({ currentGaitInfo: gaitInfo })
      this.setState({ startState: false, endState: true });
      Modal.confirm({
        content: '是否保存',
        cancelText: '否',
        okText: '是',
        onCancel: () => {
          deleteHistoryRecord([recordInfo.record_time])
        },
        onOk: () => { }
      })
    }
  }

  // 导出Press数据库文件到excel
  exportDataBase(type) {
    // 选择导出的文件夹
    dialog.showSaveDialog(null, {
      title: '导出数据库文件',
      buttonLabel: '导出',
      defaultPath: type ? 'PressData.xlsx' : 'EMGData.xlsx'
    }, async (filePath) => {
      if (filePath) {
        const isDevMode = process.execPath.match(/[\\/]electron/)
        let userDataPath = app.getPath('userData') + '/db'
        if (isDevMode) userDataPath = path.join(__dirname, '../../electron_part/database/db')

        if (type) {
          const data = [["姓名", "记录ID", "CurrentTime", "L/R", "压力值", "压力值", "压力值", "压力值", "压力值", "压力值", "压力值", "压力值", "压力值", "压力值",
            "压力值", "压力值", "压力值", "压力值", "压力值", "压力值", "压力值", "压力值", "压力值", "压力值",
            "压力值", "压力值", "压力值", "压力值", "压力值", "压力值", "压力值", "压力值", "压力值", "压力值",
            "压力值", "压力值", "压力值", "压力值", "压力值", "压力值", "压力值", "压力值", "压力值", "压力值",
            "压力值", "压力值"]];
          const readliner = readline.createInterface({
            input: fs.createReadStream(`${userDataPath}/press.db`),
          });

          readliner.on('line', function (chunk) {
            //处理每一行数据
            chunk = JSON.parse(chunk)
            let { name, recordID, currentTime, forces, LorR } = chunk
            let tempData = [name, recordID, currentTime, LorR]
            tempData = [...tempData, ...forces]
            data.push(tempData)
          });

          readliner.on('close', function () {
            //文件读取结束
            let buffer = xlsx.build([{ name: "压力值统计", data }]);
            fs.writeFile(filePath, buffer, (err) => {
              if (err) {
                console.log('==========', err)
                message.error('导出数据库错误')
                return
              }
              message.success('导出数据库成功')
            })
          });
        } else {
          const data = [["姓名", '记录ID', 'RecordTime', 'ClientName', 'EMGData']]
          const readliner = readline.createInterface({
            input: fs.createReadStream(`${userDataPath}/wifiPpm.db`),
          });

          readliner.on('line', function (chunk) {
            //处理每一行数据
            chunk = JSON.parse(chunk)
            let { name, recordID, clientName, recordTime, wifiData } = chunk
            let tempData = [name, recordID, recordTime, clientName, wifiData]
            data.push(tempData)
          });

          readliner.on('close', function () {
            //文件读取结束
            let buffer = xlsx.build([{ name: "肌电数据统计", data }]);
            fs.writeFile(filePath, buffer, (err) => {
              if (err) {
                console.log('==========', err)
                message.error('导出数据库错误')
                return
              }
              message.success('导出数据库成功')
            })
          });
        }
      }
    })
  }

  setUserInfo(key, value) {
    const { user, setUserInfo } = this.props
    const { userData } = this.state
    user[key] = value
    userData[key] = value
    setUserInfo(user)
    this.setState({ userData })
  }

  renderTopUserInfo() {
    const { userData } = this.state
    const { name = '', sex = '', age = '' } = userData
    return (
      <div className={'user_info'}>
        <div className={'user_info_item'}>
          <span>姓名：</span>
          <div>
            <Input
              type={'text'}
              value={name}
              placeholder={'请填写姓名'}
              onChange={e => {
                this.setUserInfo('name', e.target.value)
              }}
            />
          </div>
        </div>
        <div className={'user_info_item'}>
          <span>性别：</span>
          <div>
            <Input
              type={'text'}
              value={sex}
              placeholder={'请填写性别'}
              onChange={e => {
                this.setUserInfo('sex', e.target.value)
              }}
            />
          </div>
        </div>
        <div className={'user_info_item'}>
          <span>年龄：</span>
          <div>
            <Input
              type={'text'}
              value={age}
              placeholder={'请填写年龄'}
              onChange={e => {
                this.setUserInfo('age', e.target.value)
              }}
            />
          </div>
        </div>
      </div>
    )
  }

  render() {
    let { page } = this.state;
    if (page === 1) {
      return (
        this.renderPage1()
      )
    } else if (page === 2) {
      return (
        this.renderPage2()
      )
    }
  }

  renderPage2() {
    return (
      <PressAnalysis
        back={() => {
          this.setState({page: 1})
        }}
      />
    )
  }

  renderPage1() {
    let { deviceArrayJson, pressureArrayData, startState, initxAxisData } = this.state;
    // 原来只显示四个图表
    // let array = []
    // for (let key in deviceArrayJson) {
    //   array.push({
    //     name: key,
    //     array: deviceArrayJson[key]
    //   })
    // }
    
    // 现在显示8+8个图表
    let array = formatEmgData(deviceArrayJson)
    let arrayL = array.slice(0, 8)
    let arrayR = array.slice(8, 16)
    // console.log('=======arrayL======arrayR========', arrayL, arrayR)
    return (
      <div className={'inspection_content'}>
        <div className={'inspection_info'}>
          <div className={'dynamic_pressure_content'}>
            {this.renderTopUserInfo()}
            <span>动态压力显示</span>
            <ChartDynamicPressureScatter data={pressureArrayData} />
            <div className={'inspection_bottom'}>
              <div className={'bottom_items'}>
                <div>
                  <Button
                    onClick={() => {
                      if (startState) {
                        this.endInspect()
                      } else {
                        this.startInspect();
                      }
                    }}
                  >
                    {startState ? '结束检测' : '开始检测'}
                  </Button>
                </div>
                <div>
                  <Button
                    onClick={() => {
                      this.exportDataBase(1)
                    }}
                  >导出压力值数据</Button>
                </div>
                <div>
                  <Button
                    onClick={() => {
                      this.exportDataBase(0)
                    }}
                  >导出肌电数据</Button>
                </div>
              </div>
              <div className={'bottom_items'}>
                <div>
                  <Button
                    onClick={() => {
                      this.setState({page: 2}, () => {
                        const { gaitInfo } = globalVariable
                        console.log('gaitInfo============', gaitInfo)
                        this.props.setGaitInfo({ currentGaitInfo: gaitInfo })
                      })
                    }}
                  >压力分析</Button>
                </div>
                <div>
                  <Button
                    onClick={() => {
                    }}
                  >肌肉协调性分析</Button>
                </div>
                <div>
                  <Button
                    onClick={() => {
                    }}
                  >综合报告</Button>
                </div>
              </div>
            </div>
          </div>
          <div className={'inspection_color'}>
            <img src={`${__dirname}/../public/icons/color.png`} />
          </div>
          <div className={'line_charts'} style={{ marginLeft: '60px' }}>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <span>左腿(L)</span>
            </div>
            {/* xAxisData={initxAxisData} */}
            {arrayL.map((item, index) => {
              return <CharLine key={index} data={item.array} seriesName={item.name} />
            })}
          </div>
          <div className={'line_charts'} style={{ margin: '0 15px' }}>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <span>右腿(R)</span>
            </div>
            {arrayR.map((item, index) => {
              return <CharLine key={index} data={item.array} seriesName={item.name} />
            })}
          </div>
        </div>
      </div>
    );
  }
}
function mapStateToProps(state) {
  return {
    currentRecordId: state.globalSource.currentRecordId,
    user: state.user.user
  };
}

export default connect(
  mapStateToProps,
  {
    openSerialport,
    closeSerialport,
    setCurrentRecordID,
    deleteHistoryRecord,
    setUserInfo,
    setGaitInfo
  }
)(Inspection);
