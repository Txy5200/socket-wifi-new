import React, { Component } from 'react';
import xlsx from 'node-xlsx';
import { connect } from 'react-redux';
import { ChartDynamicPressureScatter, CharLine } from '../components';
import { Modal, message, Button } from 'antd';
import { openSerialport, closeSerialport, setCurrentRecordID, deleteHistoryRecord } from '../ducks';
import fs from 'fs'
import path from 'path'
import readline from 'readline'

const globalVariable = require('electron').remote.getGlobal('variables');
const { dialog, app } = require('electron').remote
message.config({
  top: 60
});
class Inspection extends Component {
  constructor(props) {
    super(props);
    this.state = {
      deviceArrayJson: {},
      initxAxisData: [],
      startState: false,
      endState: false,
      playState: false,
      pressureArrayData: []
    };
  }

  componentDidMount() {
    let initxAxisData = []
    for (let i = 0; i < 3000; i++) {
      initxAxisData.push(i)
    }
    this.setState({ initxAxisData })
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
    let result = openSerialport()
    if (result.code !== 200) {
      message.error('串口打开错误')
      return
    } else {
      let timeOut = setInterval(this.intervalFunc.bind(this), 20);
      this.setState({ startState: true, endState: false, timeOut });
    }
  }

  // 结束检测
  endInspect() {
    const { recordInfo } = globalVariable
    const { timeOut } = this.state;
    const { closeSerialport, deleteHistoryRecord } = this.props;
    let result = closeSerialport()
    if (result.code !== 200) {
      message.error('串口关闭错误')
    } else {
      clearInterval(timeOut);
      if (!recordInfo._id) {
        message.error('记录数据错误')
        return
      }
      // 存贮当前记录id
      this.props.setCurrentRecordID({ currentRecordId: recordInfo._id });
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
    },async (filePath) => {
      if(filePath){
        const isDevMode = process.execPath.match(/[\\/]electron/)
        let userDataPath = app.getPath('userData') + '/db'
        if (isDevMode) userDataPath = path.join(__dirname, '../../electron_part/database/db')

        if(type){
          const data = [["记录ID", "CurrentTime", "压力值", "压力值", "压力值", "压力值", "压力值", "压力值", "压力值", "压力值", "压力值", "压力值",
          "压力值", "压力值", "压力值", "压力值", "压力值", "压力值", "压力值", "压力值", "压力值", "压力值",
          "压力值", "压力值", "压力值", "压力值", "压力值", "压力值", "压力值", "压力值", "压力值", "压力值",
          "压力值", "压力值", "压力值", "压力值", "压力值", "压力值", "压力值", "压力值", "压力值", "压力值",
          "压力值", "压力值"]];
          const readliner = readline.createInterface({
            input: fs.createReadStream(`${userDataPath}/press.db`),
          });

          readliner.on('line', function(chunk) {
            //处理每一行数据
            chunk = JSON.parse(chunk)
            let {recordID, currentTime, forces} = chunk
            let tempData = [recordID, currentTime]
            tempData = [...tempData, ...forces]
            data.push(tempData)
          });
           
          readliner.on('close', function() {
            //文件读取结束
            let buffer = xlsx.build([{name: "压力值统计", data}]);
            fs.writeFile(filePath, buffer, (err) => {
              if(err) {
                console.log('==========', err)
                message.error('导出数据库错误')
                return
              }
              message.success('导出数据库成功')
            })
          });
        }else{
          const data =[['记录ID', 'RecordTime', 'ClientName', 'EMGData']]
          const readliner = readline.createInterface({
            input: fs.createReadStream(`${userDataPath}/wifiPpm.db`),
          });

          readliner.on('line', function(chunk) {
            //处理每一行数据
            chunk = JSON.parse(chunk)
            let {recordID, clientName, recordTime, wifiData } = chunk
            let tempData = [recordID, recordTime, clientName, wifiData]
            data.push(tempData)
          });
           
          readliner.on('close', function() {
            //文件读取结束
            let buffer = xlsx.build([{name: "肌电数据统计", data}]);
            fs.writeFile(filePath, buffer, (err) => {
              if(err) {
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

  render() {
    let { deviceArrayJson, pressureArrayData, startState, initxAxisData } = this.state;

    let array = []
    for (let key in deviceArrayJson) {
      array.push({
        name: key,
        array: deviceArrayJson[key]
      })
    }

    return (
      <div className={'inspection_content'}>
        <div className={'inspection_info'}>
          <div className={'dynamic_pressure_content'}>
            <span>动态压力显示</span>
            <ChartDynamicPressureScatter data={pressureArrayData} />
          </div>
          <div className={'line_charts'}>
            {array.map((item, index) => {
              return <CharLine key={index} data={item.array} seriesName={item.name} xAxisData={initxAxisData} />
            })}
          </div>
          <div className={'inspection_color'}>
            <img src={`${__dirname}/../public/icons/color.png`} />
          </div>
        </div>
        <div className={'inspection_bottom'}>
          {startState ? (
            <div className={'inspection_btn'}>
              <button
                className={'end_inspection_btn'}
                onClick={() => {
                  this.endInspect()
                }}
              />
            </div>
          ) : (
              <div className={'inspection_btn'}>
                <button
                  className={'start_inspection_btn'}
                  onClick={() => {
                    this.startInspect();
                  }}
                />
              </div>
            )}
          <div>
            <Button
              onClick={() => {
                this.exportDataBase(1)
              }}
            >导出Press数据库</Button>
          </div>
          <div>
            <Button
              onClick={() => {
                this.exportDataBase(0)
              }}
            >导出Wifi数据库</Button>
          </div>
        </div>
      </div>
    );
  }
}
function mapStateToProps(state) {
  return {
    currentRecordId: state.globalSource.currentRecordId
  };
}

export default connect(
  mapStateToProps,
  {
    openSerialport,
    closeSerialport,
    setCurrentRecordID,
    deleteHistoryRecord
  }
)(Inspection);
