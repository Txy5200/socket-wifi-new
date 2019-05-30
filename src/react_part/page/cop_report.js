import React from 'react'
import { ChartCommonLine, ChartCopLine } from '../components'
import { connect } from 'react-redux'
import { Pagination, message, Slider } from 'antd';
import moment from 'moment'
import { createEllipse, formatSliderTime } from '../helper/util'
import { setHeaderState, setExportFileName, playback, setCopDraw, stopplay, pausePlay, continuePlay } from '../ducks'

const globalVariable = require('electron').remote.getGlobal('variables')

class CopReport extends React.Component {
  constructor(props) {
    super(props);
    const { copInfo } = this.props
    this.state = {
      page: 1,
      playState: false,// 是否回放中
      initState: true,// 是否初始状态
      cop_position: [],
      modulus_angle: [],
      speed: [],
      speed_angle: [],
      x: [],
      y: [],
      modulus_value: [],
      cop_static_data: [],
      area: 0,
      copInfo,
      replayInfo: {// 回放进度信息
        currentTime: 0,
        startTime: 0,
        endTime: 0
      }
    };
    this.state.initxAxisData = (function () {
      let array = []
      for (let i = 1; i < 1000000; i++) {
        array.push(i/50)
      }
      return array
    })()
  }

  componentDidMount() {
    const { patientInfo } = this.props
    const { name, inspectionTime } = patientInfo
    this.props.setExportFileName(`${name}-${moment(inspectionTime).format('YYYY-MM-DD HH:mm:ss')}-COP报告.pdf`);
  }
  
  componentWillUnmount() {
    clearInterval(this.timeOut);
    this.props.setHeaderState({ clickState: true })
    // this.props.setCopDraw({ currentCopDraw: {
    //   x: [],
    //   y: [],
    //   modulus_value: [],
    //   modulus_angle: [],
    //   speed: [],
    //   speed_angle: []
    // } })
  }

  // 开始回放后定时获取全局变量中的数据
  intervalFunc() {
    const { cop_position, cop_draw, stopFlag, replayInfo, copEllipse } = globalVariable
    const { modulus_angle, speed, speed_angle, x, y, modulus_value } = cop_draw

    // 判断回放结束标志 结束后停止
    if (stopFlag) {
      let ellipseData = createEllipse(copEllipse)
      let area =  copEllipse.a * copEllipse.b * Math.PI
      area = area ? area.toFixed(2) : 0

      let cop_static_data = []
      cop_static_data.push(ellipseData)
      cop_static_data.push(cop_position)
      this.setState({ playState: false, cop_static_data, area });
      clearInterval(this.timeOut);
      this.props.setHeaderState({ clickState: true })
    } else {
      // this.props.setCopDraw({ currentCopDraw: cop_draw })
      // this.setState({ cop_position })
      this.setState({ cop_position, modulus_angle, speed, speed_angle, x, y, modulus_value, replayInfo })
    }
  }

  //开始回放
  getPlaybackData() {
    // 调取后台回放接口,然后定时通过全局变量获取回放数据
    let data = this.props.playback(this.props.currentRecordId)
    if(data){
      message.error(`回放失败:${data}`)
    }else{
      this.setState({ playState: true, initState: false })
      this.props.setHeaderState({ clickState: false });
      this.timeOut = setInterval(this.intervalFunc.bind(this), 20);
    }
  }

  itemRender(current, type, originalElement) {
    if (type === 'prev') {
      return <a>上一页</a>;
    }
    if (type === 'next') {
      return <a>下一页</a>;
    }
    return originalElement;
  }

  pageOnChange(page, limit) {
    this.setState({ page })
  }

  //停止回放
  stopPlayBack() {
    let data = this.props.stopplay()
    if(data){
      message.error(`停止失败:${data}`)
    }else {
      this.setState({ playState: false, initState: true  })
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
      this.setState({ playState: false });
      clearInterval(this.timeOut);
      this.props.setHeaderState({ clickState: true });
    }
  }

  //继续回放
  continuePlayback() {
    // 调取后台继续回放接口,然后定时通过全局变量获取回放数据
    let data = this.props.continuePlay();
    if (data) {
      message.error(`继续回放失败:${data}`);
    } else {
      this.setState({ playState: true, initState: false });
      this.props.setHeaderState({ clickState: false });
      this.timeOut = setInterval(this.intervalFunc.bind(this), 20);
    }
  }

  renderRightContent() {
    // let { cop_draw } = this.props
    // console.log('cop_draw======>', cop_draw)
    // let { modulus_angle, speed, speed_angle, x, y, modulus_value } = cop_draw
    
    let { page, initxAxisData, copInfo = [], modulus_angle, speed, speed_angle, x, y, modulus_value, cop_static_data, area } = this.state

    let rightContent
    switch (page) {
      case 1:
        rightContent = (
          <div className={'cop_report_content_right_top'}>
            <div className={'gait_chart'}>
              <span>COP综合结果</span>
              <ul>
                <li>
                  <i />
                  <span>COP前后最大距离</span>
                  <label>{copInfo[1] ? copInfo[1].toFixed(2) : '0.00'} px</label>
                </li>
                <li>
                  <i />
                  <span>COP左右最大距离</span>
                  <label>{copInfo[0] ? copInfo[0].toFixed(2) : '0.00'} px</label>
                </li>
                <li>
                  <i />
                  <span>COP左右移动平均速度</span>
                  <label>{copInfo[2] ? copInfo[2].toFixed(2) : '0.00'} px/ms</label>
                </li>
                <li>
                  <i />
                  <span>COP前后移动平均速度</span>
                  <label>{copInfo[3] ? copInfo[3].toFixed(2) : '0.00'} px/ms</label>
                </li>
                <li>
                  <i />
                  <span>COP整体移动平均速度</span>
                  <label>{copInfo[4] ? copInfo[4].toFixed(2) : '0.00'} px/ms</label>
                </li>
              </ul>
            </div>
            <div className={'cop_speed'}>
              <span>COP速度</span>
              <ChartCommonLine yAxisName={'距离/像素'} xAxisName={'时间/秒'} data={speed} type={1} xAxisData={initxAxisData} />
            </div>
            <div className={'cop_modulus_angle'}>
              <span>COP模值角度</span>
              <ChartCommonLine yAxisName={'距离/像素'} xAxisName={'时间/秒'} data={modulus_angle} type={1} xAxisData={initxAxisData} />
            </div>
            <div className={'cop_speed_angle'}>
              <span>COP速度角度</span>
              <ChartCommonLine yAxisName={'距离/像素'} xAxisName={'时间/秒'} data={speed_angle} type={1} xAxisData={initxAxisData} />
            </div>
          </div>
        )
        break
      case 2:
        rightContent = (
          <div className={'cop_report_content_right_top'}>
            <div className={'cop_x'}>
              <span>COP-X轴坐标值</span>
              <ChartCommonLine yAxisName={'距离/像素'} xAxisName={'时间/秒'} data={x} type={1} xAxisData={initxAxisData} />
            </div>
            <div className={'cop_y'}>
              <span>COP-Y轴坐标值</span>
              <ChartCommonLine yAxisName={'距离/像素'} xAxisName={'时间/秒'} data={y} type={1} xAxisData={initxAxisData} />
            </div>
            <div className={'cop_modulus_value'}>
              <span>COP模值</span>
              <ChartCommonLine yAxisName={'距离/像素'} xAxisName={'时间/秒'} data={modulus_value} type={1} xAxisData={initxAxisData} />
            </div>
            <div className={'cop_static_state'}>
              <span>静态平衡COP移动曲线</span>
              <ChartCommonLine yAxisName={'y'} xAxisName={'x'} data={cop_static_data} type={3} />
              <span>{`椭圆面积EA=${area}`}</span>
            </div>
          </div>
        )
        break
      default:
        break
    }
    return rightContent
  }

  render() {
    const { clickState } = this.props
    let { cop_position, playState, initState, replayInfo } = this.state
    const { currentTime, startTime, endTime } = replayInfo

    let totalTime = endTime - startTime;
    let current = currentTime - startTime;
    let showTotalTime = formatSliderTime(totalTime)
    let showCurrent = formatSliderTime(current)
    let replySrc = `${__dirname}/../public/icons/playStart.png`
    if(playState) replySrc = `${__dirname}/../public/icons/playStop.png`

    return (
      <div className={'cop_report_content'}>
        <div className={'cop_report_reply'}>
          <ChartCopLine data={cop_position} />
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
              <div><Slider min={0} max={totalTime} value={current} tipFormatter={null} /></div>
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
        <div className={'cop_report_content_right'}>
          {this.renderRightContent()}
          <div className={'cop_report_content_right_bottom'}>
            <Pagination
              total={2}
              pageSize={1}
              current={this.state.page}
              onChange={(page, pageSize) => this.pageOnChange(page, pageSize)}
              itemRender={(page, type, originalElement) => this.itemRender(page, type, originalElement)}
            />
          </div>
        </div>
      </div>
    );
  }
}
function mapStateToProps(state) {
  return {
    clickState: state.globalSource.clickState,
    patientInfo: state.patient.patientInfo,
    currentRecordId: state.globalSource.currentRecordId,
    cop_draw: state.globalSource.currentCopDraw,
    copInfo: state.globalSource.currentCopInfo
  };
}

export default connect(
  mapStateToProps,
  {
    setHeaderState,
    setExportFileName,
    setCopDraw,
    playback,
    stopplay,
    pausePlay,
    continuePlay
  }
)(CopReport);
