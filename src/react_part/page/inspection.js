import React, { Component } from 'react';
import { connect } from 'react-redux';
import { ChartDynamicPressureScatter, CharLine } from '../components';
import { Modal, message } from 'antd';
import { openSerialport, closeSerialport, setCurrentRecordID, deleteHistoryRecord } from '../ducks';
const globalVariable = require('electron').remote.getGlobal('variables');
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
    for (let i = 0; i < 500; i++) {
      initxAxisData.push(i)
    }
    this.setState({ initxAxisData })
  }

  componentWillUnmount() {
    clearInterval(this.timeOut);
    this.props.setHeaderState({ clickState: true });
  }

  // 开始检测后定时获取全局变量中的数据
  intervalFunc() {
    const { data_position, wifiPpm } = globalVariable;
    const { left, right } = data_position;
    let pressureArrayData = [...left, ...right];
    // console.log('wifiPpm======>', wifiPpm)
    this.setState({ pressureArrayData, deviceArrayJson: wifiPpm });
  }

  // 开始检测
  startInspect() {
    console.log('************开始检测************');
    const { openSerialport, setHeaderState } = this.props;
    let result = openSerialport()
    if (result.code !== 200) {
      message.error('串口打开错误')
      return
    } else {
      setHeaderState({ clickState: false });
      let timeOut = setInterval(this.intervalFunc.bind(this), 20);
      this.setState({ startState: true, endState: false, timeOut });
    }
  }

  // 结束检测
  endInspect() {
    console.log('************结束检测************')
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
      this.props.setHeaderState({ clickState: true });
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
