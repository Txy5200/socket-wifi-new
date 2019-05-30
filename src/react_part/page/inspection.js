import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Container, PatientInfoCard, SelectInput, ChartDynamicPressureScatter, ChartCopLine } from '../components';
import { Modal, message, Icon } from 'antd';
import { history } from '../helper/history';
import { openSerialport, closeSerialport, setHeaderState, setPatientInfo, playback, stopplay, setCurrentRecordID, setGaitInfo, setCopInfo, deleteHistoryRecord } from '../ducks';
import moment from 'moment';
const globalVariable = require('electron').remote.getGlobal('variables');
message.config({
  top: 60
});
class Inspection extends Component {
  constructor(props) {
    super(props);
    const { patientInfo } = this.props;
    this.state = {
      showSettingModal: true,
      startState: false,
      endState: false,
      playState: false,
      copArrayData: [],
      pressureArrayData: [],
      patientInfo,
      port1: '',
      port2: '',
      baudrate: '',
      dataBit: '',
      parityBit: '',
      stopBit: ''
    };
  }

  componentDidMount() {}

  componentWillUnmount() {
    clearInterval(this.timeOut);
    this.props.setHeaderState({ clickState: true });
  }

  // 开始检测后定时获取全局变量中的数据
  intervalFunc() {
    const { data_position, cop_position } = globalVariable;
    const { left, right } = data_position;
    let pressureArrayData = [...left, ...right];
    this.setState({ copArrayData: cop_position, pressureArrayData });
  }

  // 开始检测
  startInspect() {
    console.log('************开始检测************');
    const { openSerialport, setPatientInfo, setHeaderState } = this.props;
    let { patientInfo } = this.state;
    let { name, certificateNo, shoeSize } = patientInfo;
    if (!name) {
      message.error('请填写患者姓名');
      return;
    }
    if (!certificateNo) {
      message.error('请填写患者身份证');
      return;
    }
    if (!shoeSize) {
      message.error('请填写患者鞋码');
      return;
    }
    let result = openSerialport(patientInfo)
    if (result.code !== 200) {
      message.error('串口打开错误')
      return
    } else {
      setHeaderState({ clickState: false });
      setPatientInfo({ ...patientInfo, inspectionTime: moment().format('YYYY-MM-DD HH:mm') });
      let timeOut = setInterval(this.intervalFunc.bind(this), 20);
      this.setState({ startState: true, endState: false, timeOut });
    }
  }

  // 结束检测
  endInspect() {
    console.log('************结束检测************')
    const { recordInfo, gaitInfo, copInfo } = globalVariable
    const { timeOut } = this.state;
    const { closeSerialport, deleteHistoryRecord } = this.props;
    let result = closeSerialport()
    if (result.code !== 200) {
      message.error('串口关闭错误')
    } else {
      clearInterval(timeOut);
      if(!recordInfo._id){
        message.error('记录数据错误')
        return
      }
      // 存贮当前步态信息
      this.props.setGaitInfo({ currentGaitInfo: gaitInfo })
      // 存贮当前COP信息
      this.props.setCopInfo({ currentCopInfo: copInfo })
      // 存贮当前记录id
      this.props.setCurrentRecordID({ currentRecordId: recordInfo._id });
      this.props.setHeaderState({ clickState: true });
      this.setState({ startState: false, endState: true });
      Modal.confirm({
        content: '是否保存',
        cancelText: '否',
        okText: '是',
        onCancel: () => {
          deleteHistoryRecord([recordInfo._id])
        },
        onOk: () => {}
      })
    }
  }

  // 开始回放后定时获取全局变量中的数据
  playBackIntervalFunc() {
    const { data_position, cop_position, stopFlag } = globalVariable;
    const { left, right } = data_position;
    let pressureArrayData = [...left, ...right];

    //stopFlag 判断回放结束标志 结束后停止
    if(stopFlag){
      this.setState({ playState: false });
      clearInterval(this.timeOut);
      this.props.setHeaderState({ clickState: true });
    }else{
      this.setState({ copArrayData: cop_position, pressureArrayData });
    }
  }
  
  //开始回放
  getPlaybackData() {
    // 调取后台回放接口,然后定时通过全局变量获取回放数据
    let data = this.props.playback(this.props.currentRecordId)
    if(data){
      message.error(`回放失败:${data}`)
    }else{
      this.setState({ playState: true })
      this.props.setHeaderState({ clickState: false });
      this.timeOut = setInterval(this.playBackIntervalFunc.bind(this), 20);
    }
  }

  //停止回放
  stopPlayBack() {
    let data = this.props.stopplay()
    if(data){
      message.error(`停止失败:${data}`)
    }else {
      this.setState({ playState: false })
      clearInterval(this.timeOut);
      this.props.setHeaderState({ clickState: true });
    }
  }


  showSettingModal() {
    const { port1, port2, baudrate, dataBit, parityBit, stopBit, showSettingModal } = this.state;
    const portData = [];
    const portOptions = portData.map((item, index) => <Option key={index}>{item}</Option>);
    const baudrateOptions = [];
    const dataBitOptions = [];
    const parityBitOptions = [];
    const stopBitOptions = [];
    return (
      <Modal
        wrapClassName={'inspection_modal'}
        title={'配置串口'}
        footer={null}
        maskClosable={false}
        visible={showSettingModal}
        onCancel={() => {
          this.setState({ showSettingModal: false });
        }}
      >
        <div className={'setting_content inspection'}>
          <SelectInput
            title={'端口1'}
            placeholder={'选择端口'}
            value={port1}
            selectOption={portOptions}
            handleChange={value => {
              this.setState({ port1: value });
            }}
          />
          <SelectInput
            title={'端口2'}
            placeholder={'选择端口'}
            value={port2}
            selectOption={portOptions}
            handleChange={value => {
              this.setState({ port2: value });
            }}
          />
          <SelectInput
            title={'波特率'}
            placeholder={'设置波特率'}
            value={baudrate}
            selectOption={baudrateOptions}
            handleChange={value => {
              this.setState({ baudrate: value });
            }}
          />
          <SelectInput
            title={'数据位'}
            placeholder={'设置数据位'}
            value={dataBit}
            selectOption={dataBitOptions}
            handleChange={value => {
              this.setState({ dataBit: value });
            }}
          />
          <SelectInput
            title={'校验位'}
            placeholder={'设置校验位'}
            value={parityBit}
            selectOption={parityBitOptions}
            handleChange={value => {
              this.setState({ parityBit: value });
            }}
          />
          <SelectInput
            title={'停止位'}
            placeholder={'设置停止位'}
            value={stopBit}
            selectOption={stopBitOptions}
            handleChange={value => {
              this.setState({ stopBit: value });
            }}
          />
          <div className={'refreshBtn_div'}>
            <button
              className="refreshBtn"
              onClick={() => {
                console.log('刷新端口');
              }}
            >
              <Icon type={'reload'} />
              <span>刷新端口</span>
            </button>
          </div>
          <div className={'bottom_div'}>
            <button
              className="cancelBtn"
              onClick={() => {
                this.setState({ showSettingModal: false });
              }}
            >
              Cancel
            </button>
            <button
              className="saveBtn"
              onClick={() => {
                this.setState({ showSettingModal: false });
              }}
            >
              Save
            </button>
          </div>
        </div>
      </Modal>
    );
  }

  setUerInfo(key, value) {
    let { patientInfo } = this.state;
    patientInfo[key] = value;
    this.setState({ patientInfo });
  }

  render() {
    let { patientInfo, copArrayData, pressureArrayData, startState, endState, playState } = this.state;
    const { clickState } = this.props;
    return (
      <Container {...this.props}>
        <div className={'inspection_content'}>
          {endState && !playState ? (
            <div 
              className={'inspection_reply_btn'}
              onClick={() => {
                clickState ? this.getPlaybackData() : ''
              }}
            >
              <img src={`${__dirname}/../public/icons/playback.png`} />
            </div>
          ) : (
              ''
            )}
          {playState ? (
            <div 
              className={'inspection_reply_btn'}
              onClick={() => {
                this.stopPlayBack()
              }}
            >
              <img src={`${__dirname}/../public/icons/playbackStop.png`} />
            </div>
          ) : (
              ''
            )}
          <div className={'inspection_info'}>
            <PatientInfoCard
              clickState={clickState}
              patientInfo={patientInfo}
              onChange={(key, value) => {
                this.setUerInfo(key, value);
              }}
            />
            <div className={'dynamic_pressure_content'}>
              <span>动态压力显示</span>
              <ChartDynamicPressureScatter data={pressureArrayData} />
            </div>
            <div className={'cop_content'}>
              <span>cop显示</span>
              <ChartCopLine data={copArrayData} />
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
            {endState ? (
              <div
                className={'inspection_see_btn'}
                onClick={() => {
                  history.push('/inspection/report');
                }}
              >
                <span>查看报告</span>
                <img src={`${__dirname}/../public/icons/See.png`} />
              </div>
            ) : (
                ''
              )}
          </div>
        </div>
        {/* <div className={'inspection_modal'}>
          {this.showSettingModal()}
        </div> */}
      </Container>
    );
  }
}
function mapStateToProps(state) {
  return {
    clickState: state.globalSource.clickState,
    patientInfo: state.patient.patientInfo,
    currentRecordId: state.globalSource.currentRecordId
  };
}

export default connect(
  mapStateToProps,
  {
    openSerialport,
    closeSerialport,
    setHeaderState,
    setPatientInfo,
    playback,
    setCurrentRecordID,
    setGaitInfo,
    setCopInfo,
    stopplay,
    deleteHistoryRecord
  }
)(Inspection);
