import React, { Component } from 'react';
import { connect } from 'react-redux';
import { patientList, getHistoryRecord, setDataCompareState } from '../ducks'
import { Select, Tooltip } from 'antd';
import moment from 'moment'
import { Container, ChartCommonLine } from '../components';

const Option = Select.Option;

class DataCompare extends Component {
  constructor(props) {
    super(props);
    const { dataCompareState } = this.props
    const { patient_certificate_no = undefined, patient_name = undefined, search_times = 10000 } = dataCompareState
    this.state = {
      action_type: 1,
      data_compare: [],
      patient_certificate_no,
      patient_name,
      patient_data: [],
      search_times
    };
  }

  componentDidMount() { 
    const { patient_certificate_no, search_times } = this.state
    if(patient_certificate_no){
      this.getComparisonData(patient_certificate_no, search_times)
    }
  }

  async handlePatientSearch(keyword) {
    const { patientList } = this.props
    const data = patientList(keyword)

    this.setState({ patient_data: data })
  }

  handlePatientChange(value, option, search_times) {
    value = JSON.parse(value)
    this.setState({ patient_certificate_no: value.certificateNo, patient_name: value.name })
    // 去查询数据
    this.getComparisonData(value.certificateNo, search_times)
    this.props.setDataCompareState({patient_certificate_no: value.certificateNo, patient_name: value.name, search_times})
  }

  // 获取步态周期、单腿支撑时间、双腿支撑时间、下肢负重
  getComparisonData(patient_certificate_no, value) {
    const { getHistoryRecord } = this.props
    const data = getHistoryRecord({ keyword: patient_certificate_no, page: 1, limit: value })
    this.setState({ data_compare: data.reverse() })
  }

  // 步态周期
  renderGaitChart() {
    const { data_compare } = this.state
    const seriesName = ['左腿步行周期', '右腿步行周期'];

    let gaitCycle = []
    let leftGaitCycle = []
    let rightGaitCycle = []

    for (let { gaitInfo = {}, start_time } of data_compare) {
      let { gaitCycle_L = 0, gaitCycle_R = 0 } = gaitInfo
      start_time = moment(start_time).format('YYYY-MM-DD HH:mm:ss')
      leftGaitCycle.push([start_time, Math.round(gaitCycle_L)])
      rightGaitCycle.push([start_time, Math.round(gaitCycle_R)])
    }

    gaitCycle.push(leftGaitCycle)
    gaitCycle.push(rightGaitCycle)

    return (
      <div className={'data_gait_chart'}>
        <div>
          <ChartCommonLine data={gaitCycle} type={2} seriesName={seriesName} unit={'(ms)'} />
        </div>
      </div>
    );
  }

  // 单腿支撑时间
  renderSingleChart() {
    const { data_compare } = this.state
    const seriesName = ['左腿支撑时间', '右腿支撑时间'];

    let singleLegTimeData = []
    let leftSingleLegTimeData = []
    let rightSingleLegTimeData = []

    for (let { gaitInfo = {}, start_time } of data_compare) {
      let { singleStance_L = 0, singleStance_R = 0 } = gaitInfo
      start_time = moment(start_time).format('YYYY-MM-DD HH:mm:ss')
      leftSingleLegTimeData.push([start_time, Math.round(singleStance_L)])
      rightSingleLegTimeData.push([start_time, Math.round(singleStance_R)])
    }

    singleLegTimeData.push(leftSingleLegTimeData)
    singleLegTimeData.push(rightSingleLegTimeData)

    return (
      <div className={'data_single_chart'}>
        <div>
          <ChartCommonLine data={singleLegTimeData} type={2} seriesName={seriesName} unit={'(ms)'} />
        </div>
      </div>
    );
  }

  // 双腿支撑时间
  renderDoubleChart() {
    const { data_compare } = this.state
    const leaveSeriesName = ['离地前左', '离地前右'];
    const landSeriesName = ['触地开始左', '触地开始右'];

    let leaveDoubleLegTimeData = []
    let leftLeaveData = []
    let rightLeaveData = []

    let landDoubleLegTimeData = []
    let leftLandData = []
    let rightLandData = []

    for (let { gaitInfo = {}, start_time } of data_compare) {
      let { doubleStance_leave_L = 0, doubleStance_leave_R = 0, doubleStance_land_L = 0, doubleStance_land_R = 0 } = gaitInfo
      start_time = moment(start_time).format('YYYY-MM-DD HH:mm:ss')
      leftLeaveData.push([start_time, Math.round(doubleStance_leave_L)])
      rightLeaveData.push([start_time, Math.round(doubleStance_leave_R)])
      leftLandData.push([start_time, Math.round(doubleStance_land_L)])
      rightLandData.push([start_time, Math.round(doubleStance_land_R)])
    }

    leaveDoubleLegTimeData.push(leftLeaveData)
    leaveDoubleLegTimeData.push(rightLeaveData)
    landDoubleLegTimeData.push(leftLandData)
    landDoubleLegTimeData.push(rightLandData)

    return (
      <div className={'data_double_chart'}>
        <ChartCommonLine data={leaveDoubleLegTimeData} type={2} seriesName={leaveSeriesName} unit={'(ms)'} />
        <ChartCommonLine data={landDoubleLegTimeData} type={2} seriesName={landSeriesName} unit={'(ms)'} />
      </div>
    );
  }

  // 下肢负重
  renderCruraChart() {
    const { data_compare } = this.state
    const seriesName = ['左脚压力', '右脚压力'];

    let cruraWeight = []
    let leftCruraWeight = []
    let rightCruraWeight = []

    for (let { gaitInfo = {}, start_time } of data_compare) {
      start_time = moment(start_time).format('YYYY-MM-DD HH:mm:ss')
      let { pressure_L = [], pressure_R = [] } = gaitInfo
      let leftTotal = pressure_L.length ? pressure_L.reduce((a, b) => {
        return a + b;
      }) : 0
      let rightTotal = pressure_R.length ? pressure_R.reduce((a, b) => {
        return a + b;
      }) : 0
      leftCruraWeight.push([start_time, Math.round(leftTotal)])
      rightCruraWeight.push([start_time, Math.round(rightTotal)])
    }

    cruraWeight.push(leftCruraWeight)
    cruraWeight.push(rightCruraWeight)

    return (
      <div className={'data_crura_chart'}>
        <div>
          <ChartCommonLine data={cruraWeight} type={2} seriesName={seriesName} unit={'(N)'} />
        </div>
      </div>
    );
  }

  showChart() {
    const { action_type } = this.state;
    let map = {
      1: this.renderGaitChart(),
      2: this.renderSingleChart(),
      3: this.renderDoubleChart(),
      4: this.renderCruraChart()
    };
    return map[action_type] || null;
  }

  render() {
    const { action_type, patient_certificate_no, patient_name, patient_data, search_times } = this.state;
    const patientOptions = patient_data.map(d => {
      const tooltipTitle = (
        <div className={'tooltipTitle'}>
          <span>
            姓名：
            {d.name}
          </span>
          <span>
            身份证号：
            {d.certificate_no || ''}
          </span>
        </div>
      )
      return (
        <Option key={JSON.stringify({certificateNo:d.certificate_no, name: d.name})} className={'patientAntdSelect'}>
          <Tooltip placement='topLeft' title={tooltipTitle}>
            {d.name}
          </Tooltip>
        </Option>
      )
    })
    return (
      <Container {...this.props}>
        <div className={'data_compare_top'}>
          <div className={'search_content'}>
            <div style={{ width: '27.037vh', height: '4.074vh' }}>
              <Select
                showSearch
                style={{ width: '100%' }}
                placeholder={'请输入姓名或身份证号'}
                defaultActiveFirstOption={false}
                showArrow={false}
                filterOption={false}
                value={patient_name}
                onFocus={() => this.handlePatientSearch()}
                onSearch={value => this.handlePatientSearch(value)}
                onChange={(value, option) => this.handlePatientChange(value, option, search_times)}
                notFoundContent={null}
              >
                {patientOptions}
              </Select>
            </div>
            <div className={'times_select'}>
              <Select
                dropdownClassName={'times_select_dropdown'}
                defaultValue={search_times}
                onChange={(value) => {
                  // 去查询数据
                  this.setState({ search_times: value })
                  if (patient_certificate_no) {
                    this.getComparisonData(patient_certificate_no, value)
                  }
                  this.props.setDataCompareState({patient_certificate_no, patient_name, search_times: value})
                }}
              >
                <Option value={10000}>全部检测</Option>
                <Option value={5}>最近五次</Option>
                <Option value={10}>最近十次</Option>
              </Select>
            </div>
          </div>
          <div className={'data_type_box'}>
            <button
              className={'data_type_btn ' + (action_type === 1 ? 'sel' : '')}
              onClick={() => {
                this.setState({ action_type: 1 });
              }}
            >
              步行周期
            </button>
            <button
              className={'data_type_btn ' + (action_type === 2 ? 'sel' : '')}
              onClick={() => {
                this.setState({ action_type: 2 });
              }}
            >
              单腿支撑时间
            </button>
            <button
              className={'data_type_btn ' + (action_type === 3 ? 'sel' : '')}
              onClick={() => {
                this.setState({ action_type: 3 });
              }}
            >
              双腿支撑时间
            </button>
            <button
              className={'data_type_btn ' + (action_type === 4 ? 'sel' : '')}
              onClick={() => {
                this.setState({ action_type: 4 });
              }}
            >
              下肢负重
            </button>
          </div>
        </div>
        <div className={'data_compare_chart'}>{this.showChart()}</div>
      </Container>
    );
  }
}
function mapStateToProps(state) {
  return {
    history_record_data: state.history.history_record_data,
    dataCompareState: state.globalSource.dataCompareState
  }
}

export default connect(
  mapStateToProps,
  {
    patientList,
    getHistoryRecord,
    setDataCompareState
  }
)(DataCompare);
