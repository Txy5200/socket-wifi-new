import React from 'react';
import { connect } from 'react-redux';
import { Progress, message, Slider } from 'antd';
import { ChartPie, ChartDynamicPressureScatter } from '../components';
import { getUrlByPress, formatSliderTime } from '../helper/util';
import { setHeaderState, playback, stopplay, pausePlay, continuePlay, setExportFileName, changePlay } from '../ducks';
import moment from 'moment';

const globalVariable = require('electron').remote.getGlobal('variables');

class BasicReport extends React.Component {
  constructor(props) {
    super(props);
    const { gaitInfo } = this.props;
    let { 
      gaitCycle_L = 0, 
      gaitCycle_R = 0, 
      singleStance_L = 0, 
      singleStance_R = 0, 
      doubleStance_land_L = 0, 
      doubleStance_land_R = 0, 
      doubleStance_leave_L = 0, 
      doubleStance_leave_R = 0, 
      singleASI = 0, 
      pressure_L = [], 
      pressure_R = [] } = gaitInfo;

    const leftGaitCycle = [{ value: Math.round(gaitCycle_L - singleStance_R), name: '支撑相' }, { value: Math.round(singleStance_R), name: '摆动相' }];
    const rightGaitCycle = [{ value: Math.round(gaitCycle_R - singleStance_L), name: '支撑相' }, { value: Math.round(singleStance_L), name: '摆动相' }];
    const singleStance = [{ value: Math.round(singleStance_L), name: '左腿支撑时间' }, { value: Math.round(singleStance_R), name: '右腿支撑时间' }];

    this.state = {
      playState: false,// 是否回放中
      initState: true,// 是否初始状态 
      gaitCycle_L: Math.round(gaitCycle_L),
      gaitCycle_R: Math.round(gaitCycle_R),
      leftGaitCycle,
      rightGaitCycle,
      singleStance,
      doubleStance_land_L: Math.round(doubleStance_land_L),
      doubleStance_land_R: Math.round(doubleStance_land_R),
      doubleStance_leave_L: Math.round(doubleStance_leave_L),
      doubleStance_leave_R: Math.round(doubleStance_leave_R),
      singleStability_L: Math.round(((gaitCycle_L - singleStance_R) / gaitCycle_L) * 100),
      singleStability_R: Math.round(((gaitCycle_R - singleStance_L) / gaitCycle_R) * 100),
      singleASI: Math.round(singleASI * 100),
      pressure_L,
      pressure_R,
      pressureArrayData: [],
      replayInfo: {// 回放进度信息
        currentTime: 0,
        startTime: 0,
        endTime: 0
      }
    };
  }

  componentDidMount() {
    const { patientInfo } = this.props;
    const { name, inspectionTime } = patientInfo;
    this.props.setExportFileName(`${name}-${moment(inspectionTime).format('YYYY-MM-DD HH:mm:ss')}-基础报告.pdf`);
  }

  componentWillUnmount() {
    clearInterval(this.timeOut);
    this.props.setHeaderState({ clickState: true });
  }

  // 开始回放后定时获取全局变量中的数据
  intervalFunc() {
    const { data_position, stopFlag, replayInfo } = globalVariable;
    const { left, right } = data_position;
    let pressureArrayData = [...left, ...right];

    // 判断回放结束标志 结束后停止
    if (stopFlag) {
      this.setState({ playState: false });
      clearInterval(this.timeOut);
      this.props.setHeaderState({ clickState: true });
    } else {
      this.setState({ pressureArrayData, replayInfo: {...replayInfo} });
    }
  }

  //开始回放
  getPlaybackData() {
    // 调取后台回放接口,然后定时通过全局变量获取回放数据
    let data = this.props.playback(this.props.currentRecordId);
    if (data) {
      message.error(`回放失败:${data}`);
    } else {
      this.setState({ playState: true, initState: false });
      this.props.setHeaderState({ clickState: false });
      this.timeOut = setInterval(this.intervalFunc.bind(this), 20);
    }
  }

  //停止回放
  stopPlayBack() {
    let data = this.props.stopplay();
    if (data) {
      message.error(`停止失败:${data}`);
    } else {
      this.setState({ playState: false, initState: true });
      clearInterval(this.timeOut);
      this.props.setHeaderState({ clickState: true });
    }
  }

  //暂停回放
  pausePlayBack() {
    let data = this.props.pausePlay();
    if (data) {
      message.error(`暂停失败:${data}`);
    } else {
      clearInterval(this.timeOut);
      this.setState({ playState: false });
      this.props.setHeaderState({ clickState: true });
    }
  }

  //继续回放
  continuePlayback() {
    // 调取后台继续回放接口,然后定时通过全局变量获取回放数据
    const { replayInfo } = this.state
    let data = this.props.continuePlay(replayInfo.currentTime);
    if (data) {
      message.error(`继续回放失败:${data}`);
    } else {
      this.setState({ playState: true, initState: false });
      this.props.setHeaderState({ clickState: false });
      this.timeOut = setInterval(this.intervalFunc.bind(this), 20);
    }
  }

  // 计算下肢负重压力比
  getFootPercent(array) {
    if(!array.length) return { footPercent: [0,0,0], total: 0 }
    let total = array.reduce((a, b) => {
      return a + b;
    });
    let footPercent = [];

    for (let i = 0; i < array.length; i++) {
      if (total) {
        if (i === array.length - 1) {
          let currentPercent = footPercent.reduce((a, b) => {
            return a + b;
          });
          footPercent.push(100 - currentPercent);
        } else {
          footPercent.push(Math.round((array[i] / total) * 100));
        }
      } else {
        footPercent.push(0);
      }
    }

    return { footPercent, total: total.toFixed(2) };
  }

  // 滑动条改变
  handleSlideChange(value) {
    // 回放中：1、先暂停回放，2、设置滑动条，3、调取后台接口，4、继续回放
    // 暂停回放时：2、设置滑动条，3、调取后台接口
    let { replayInfo, playState } = this.state
    if(playState){
      this.pausePlayBack()
    }
    let currentValue = replayInfo.startTime + value
    replayInfo.currentTime = currentValue
    this.props.changePlay(currentValue)

    const { data_position } = globalVariable;
    const { left, right } = data_position;
    let pressureArrayData = [...left, ...right];
    this.setState({ pressureArrayData, replayInfo: {...replayInfo} });
    if(playState){
      this.continuePlayback()
    }
  }

  render() {
    const { clickState } = this.props;
    let {
      playState,
      initState,
      gaitCycle_L,
      gaitCycle_R,
      pressureArrayData,
      leftGaitCycle,
      rightGaitCycle,
      singleStance,
      doubleStance_land_L,
      doubleStance_land_R,
      doubleStance_leave_L,
      doubleStance_leave_R,
      singleStability_L,
      singleStability_R,
      singleASI,
      pressure_L,
      pressure_R,
      replayInfo
    } = this.state;

    const { currentTime, startTime, endTime } = replayInfo;
    const leftPressArray = getUrlByPress(pressure_L, 'left');
    const rightPressArray = getUrlByPress(pressure_R, 'right');
    const { footPercent: leftPressPercentArray, total: leftPressTotal } = this.getFootPercent(pressure_L);
    const { footPercent: rightPressPercentArray, total: rightPressTotal } = this.getFootPercent(pressure_R);

    let pressTotal = leftPressTotal * 1 + rightPressTotal * 1;
    let leftPressTotalPercent = pressTotal ? (leftPressTotal / pressTotal) * 100 : 0;
    let rightPressTotalPercent = 100 - leftPressTotalPercent;
    leftPressTotalPercent = leftPressTotalPercent.toFixed(1);
    rightPressTotalPercent = rightPressTotalPercent.toFixed(1);

    let singleStanceStr = `${singleStance[0].value}/${singleStance[1].value}`;

    if (singleStance[0].value - singleStance[1].value > 0) {
      `${singleStance[1].value}/${singleStance[0].value}`;
    }

    let totalTime = endTime - startTime;
    let current = currentTime - startTime;
    let showTotalTime = formatSliderTime(totalTime)
    let showCurrent = formatSliderTime(current)

    let replySrc = `${__dirname}/../public/icons/playStart.png`
    if(playState) replySrc = `${__dirname}/../public/icons/playStop.png`

    return (
      <div className={'basic_report_content'}>
        <div className={'basic_report_color'}>
          <img src={`${__dirname}/../public/icons/color.png`} />
        </div>
        <div className={'basic_report_reply'}>
          <ChartDynamicPressureScatter data={pressureArrayData} />
          {initState ? (
            <img
              onClick={() => {
                clickState ? this.getPlaybackData() : '';
              }}
              src={`${__dirname}/../public/icons/playback.png`}
            />
          ) : (
            <div className={'reply_bottom'}>
              <span>{showCurrent}</span>
              <div>
                <Slider 
                  min={0} 
                  max={totalTime} 
                  value={current} 
                  tipFormatter={(value) => {
                    return formatSliderTime(value)
                  }} 
                  onChange={(value) => {
                    this.handleSlideChange(value)
                  }}
                />
              </div>
              <span>{showTotalTime}</span>
              <img
                onClick={() => {
                  playState ? this.pausePlayBack() : this.continuePlayback()
                }}
                src={replySrc}
              />
              <img
                onClick={() => {
                  this.stopPlayBack()
                }}
                src={`${__dirname}/../public/icons/pausePlay.png`}
              />
            </div>
          )}
        </div>
        <div className={'basic_content_right'}>
          <div className={'report_gait_chart'}>
            <div className={'basic_content_div_title'}>
              <span>步行周期</span>
              <i />
            </div>
            <div className={'gait_chart_content'}>
              <div className={'gait_chart_content_item'} id={'left_gait_cycle'}>
                <ChartPie name={'左腿步行周期'} title={'左腿步行周期'} position={'inner'} data={leftGaitCycle} />
                <span>{`左腿步行周期${gaitCycle_L}ms`}</span>
              </div>
              <div className={'gait_chart_content_item'} id={'right_gait_cycle'}>
                <ChartPie name={'右腿步行周期'} title={'右腿步行周期'} position={'inner'} data={rightGaitCycle} />
                <span>{`右腿步行周期${gaitCycle_R}ms`}</span>
              </div>
            </div>
          </div>
          <div className={'single_time_chart'}>
            <div className={'basic_content_div_title'}>
              <span>单腿支撑时间</span>
              <i />
            </div>
            <div className={'single_time_chart_content'}>
              <div className={'gait_chart_content_item'} style={{ position: 'relative' }}>
                <span className={'time_proportion'}>
                  <i />
                  {singleStanceStr}
                </span>
                <ChartPie name={'单腿支撑时间'} title={'支撑时间比'} position={'center'} radius={['35%', '40%']} data={singleStance} />
              </div>
            </div>
          </div>
          <div className={'crura_weight_chart'}>
            <div className={'basic_content_div_title'}>
              <span>下肢负重</span>
              <span>稳定性</span>
              <i />
            </div>
            <div className={'crura_weight_chart_content'}>
              <div className={'gait_chart_content_item'}>
                <div className={'foot_imgs'}>
                  <div className={'left_foot_weight'}>
                    <div className={'foot_top'}>
                      <img src={`${__dirname}/../public/icons/${leftPressArray[0]}`} />
                      <span>{leftPressPercentArray[0]}%</span>
                    </div>
                    <div className={'foot_center'}>
                      <img src={`${__dirname}/../public/icons/${leftPressArray[1]}`} />
                      <span>{leftPressPercentArray[1]}%</span>
                    </div>
                    <div className={'foot_bottom'}>
                      <img src={`${__dirname}/../public/icons/${leftPressArray[2]}`} />
                      <span>{leftPressPercentArray[2]}%</span>
                    </div>
                    <span>{leftPressTotal}N</span>
                  </div>
                  <div className={'right_foot_weight'}>
                    <div className={'foot_top'}>
                      <img src={`${__dirname}/../public/icons/${rightPressArray[0]}`} />
                      <span>{rightPressPercentArray[0]}%</span>
                    </div>
                    <div className={'foot_center'}>
                      <img src={`${__dirname}/../public/icons/${rightPressArray[1]}`} />
                      <span>{rightPressPercentArray[1]}%</span>
                    </div>
                    <div className={'foot_bottom'}>
                      <img src={`${__dirname}/../public/icons/${rightPressArray[2]}`} />
                      <span>{rightPressPercentArray[2]}%</span>
                    </div>
                    <span>{rightPressTotal}N</span>
                  </div>
                </div>
                <div className={'crura_weight_chart_bottom'}>
                  <div className={'bottom_top'}>
                    <span>左脚压力</span>
                    <span>右脚压力</span>
                  </div>
                  <div className={'bottom_bottom'}>
                    <span>{leftPressTotalPercent}%</span>
                    <div className={'press_progress_bar'}>
                      <div className={'progress_bar_inner'} style={{ width: `${leftPressTotalPercent}%` }} />
                      <i style={{ left: `${leftPressTotalPercent}%` }} />
                    </div>
                    <span>{rightPressTotalPercent}%</span>
                  </div>
                </div>
              </div>

              <div className={'gait_chart_content_item'}>
                <ul>
                  <li>
                    <span>双腿对称性</span>
                    <Progress
                      percent={singleASI}
                      format={percent => {
                        return `${percent}%`;
                      }}
                    />
                  </li>
                  <li>
                    <span>左腿步态稳定性</span>
                    <Progress
                      percent={singleStability_L}
                      format={percent => {
                        return `${percent}%`;
                      }}
                    />
                  </li>
                  <li>
                    <span>右腿步态稳定性</span>
                    <Progress
                      percent={singleStability_R}
                      format={percent => {
                        return `${percent}%`;
                      }}
                    />
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className={'double_time_chart'}>
            <div className={'basic_content_div_title'}>
              <span>双腿支撑时间</span>
              <i />
            </div>
            <div className={'double_time_chart_content'}>
              <ul>
                <li>
                  <i />
                  <span>离地前左</span>
                  <label>{doubleStance_leave_L}ms</label>
                </li>
                <li>
                  <i />
                  <span>离地前右</span>
                  <label>{doubleStance_leave_R}ms</label>
                </li>
                <li>
                  <i />
                  <span>触底开始左</span>
                  <label>{doubleStance_land_L}ms</label>
                </li>
                <li>
                  <i />
                  <span>触底开始右</span>
                  <label>{doubleStance_land_R}ms</label>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
function mapStateToProps(state) {
  return {
    patientInfo: state.patient.patientInfo,
    clickState: state.globalSource.clickState,
    currentRecordId: state.globalSource.currentRecordId,
    gaitInfo: state.globalSource.currentGaitInfo
  };
}

export default connect(
  mapStateToProps,
  {
    setHeaderState,
    setExportFileName,
    stopplay,
    playback,
    pausePlay,
    continuePlay,
    changePlay
  }
)(BasicReport);
