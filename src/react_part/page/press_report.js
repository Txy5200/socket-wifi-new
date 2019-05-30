import React from 'react';
import { connect } from 'react-redux';
import { message, Slider } from 'antd';
import { ChartDynamicPressureScatter, ChartCopLine } from '../components'
import { formatSliderTime } from '../helper/util'
import { setHeaderState, setExportFileName , playback, stopplay, pausePlay, continuePlay  } from '../ducks'

const globalVariable = require('electron').remote.getGlobal('variables')

class PressReport extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      playState: false,// 是否回放中
      initState: true,// 是否初始状态
      copArrayData: [],
      pressureArrayData: [],
      replayInfo: {// 回放进度信息
        currentTime: 0,
        startTime: 0,
        endTime: 0
      }
    };
  }

  componentDidMount() {
    this.props.setExportFileName('');
  }

  componentWillUnmount() {
    clearInterval(this.timeOut);
    this.props.setHeaderState({ clickState: true });
  }

  // 开始回放后定时获取全局变量中的数据
  intervalFunc() {
    let { data_position, cop_position, stopFlag, replayInfo } = globalVariable
    let { left, right } = data_position
    let pressureArrayData = [...left, ...right]

    // 判断回放结束标志 结束后停止
    if(stopFlag){
      this.setState({ playState: false });
      clearInterval(this.timeOut);
      this.props.setHeaderState({ clickState: true });
    }else{
      this.setState({copArrayData: cop_position, pressureArrayData, replayInfo})
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

  //停止回放
  stopPlayBack() {
    let data = this.props.stopplay()
    if(data){
      message.error(`停止失败:${data}`)
    }else {
      this.setState({ playState: false, initState: true })
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

  render() {
    let { copArrayData, pressureArrayData, playState, initState, replayInfo } = this.state
    const { currentTime, startTime, endTime } = replayInfo
    let { clickState } = this.props

    let totalTime = endTime - startTime;
    let current = currentTime - startTime;
    let showTotalTime = formatSliderTime(totalTime)
    let showCurrent = formatSliderTime(current)
    let replySrc = `${__dirname}/../public/icons/playStart.png`
    if(playState) replySrc = `${__dirname}/../public/icons/playStop.png`

    return (
      <div className={'press_info'}>
        <div className={'playback_content'}>
          <div className={'playback_content_top'}>
            <div className={'dynamic_pressure_content'}>
              <span>动态压力显示</span>
              <ChartDynamicPressureScatter data={pressureArrayData} />
            </div>
            <div className={'cop_content'}>
              <span>cop显示</span>
              <ChartCopLine data={copArrayData} />
            </div>
          </div>
          <div className={'playback_content_bottom'}>
          {initState ? (
            <img
              onClick={() => {
                clickState ? this.getPlaybackData() : '';
              }}
              src={`${__dirname}/../public/icons/playback.png`}
            />
          ) : (
            <div style={{ width: '52vw', marginLeft: '25vw'}} className={'reply_bottom'}>
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
        </div>

        <div className={'inspection_color'}>
          <img src={`${__dirname}/../public/icons/color.png`} />
        </div>
      </div>
    );
  }
}
function mapStateToProps(state) {
  return {
    clickState: state.globalSource.clickState,
    currentRecordId: state.globalSource.currentRecordId
  };
}

export default connect(
  mapStateToProps,
  {
    setHeaderState,
    setExportFileName,
    playback,
    stopplay, 
    pausePlay, 
    continuePlay 
  }
)(PressReport);
