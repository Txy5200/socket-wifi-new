import React, { Component } from 'react';
import { connect } from 'react-redux';
import BasicReportScreeen from './basic_report';
import CopReportScreeen from './cop_report';
import PressReportScreeen from './press_report';
import { Container } from '../components';
import moment from 'moment'

class ReportPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      action_type: 1
    };
  }

  showView() {
    let { action_type } = this.state;
    let map = {
      1: <BasicReportScreeen />,
      2: <CopReportScreeen />,
      3: <PressReportScreeen />
    };
    return map[action_type] || null;
  }

  render() {
    const {action_type} = this.state
    const { patientInfo, clickState } = this.props
    const { name, age, shoeSize, certificateNo, inspectionTime } = patientInfo
    return (
      <Container {...this.props}>
        <div className={'report_top_content'}>
          <div className={'basic_report_patient'}>
            <div className={'patient_content'}>
              <div className={'top_info'}>
                <div className={'user_image'}>
                  <img src={`${__dirname}/../public/icons/basic_user.png`} />
                </div>
                <div className={'user_change'}>{moment(inspectionTime).format('YYYY-MM-DD HH:mm:ss')}</div>
              </div>

              <div className={'patient_info'}>
                <span>{name}</span>
                <span>{age}岁</span>
                <span>{shoeSize}码</span>
                <span>{certificateNo}</span>
              </div>
            </div>
          </div>
          <div className={'switch_btn'}>
            <div className={ action_type === 1 ? 'sel' : ''}
              onClick={() =>{
                clickState ? this.setState({action_type: 1}) : ''
              }}
            >
              <button className={'basic_btn'} />
              <span>基础报告</span>
            </div>
            <div className={ action_type === 2 ? 'sel' : ''}
              onClick={() =>{
                clickState ? this.setState({action_type: 2}) : ''
              }}
            >
              <button className={'cop_btn'} />
              <span>cop报告</span>
            </div>
            <div className={ action_type === 3 ? 'sel' : ''}
              onClick={() =>{
                clickState ? this.setState({action_type: 3}) : ''
              }}
            >
              <button className={'press_btn'} />
              <span>压力视频</span>
            </div>
          </div>
          {this.showView()}
        </div>
      </Container>
    );
  }
}

function mapStateToProps(state) {
  return {
    patientInfo: state.patient.patientInfo,
    clickState: state.globalSource.clickState
  };
}

export default connect(
  mapStateToProps,
  {}
)(ReportPage);
