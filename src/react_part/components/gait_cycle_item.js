import React, { Component } from 'react';
export default class GaitCycleItem extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  render() {
    const {
      title,
      width,
      widthValue,
      color,
      value,
      showText = true
    } = this.props
    return (
      <div className={'basic_report_gait_cycle'} style={{ width: widthValue, flex: widthValue == '0%' ? 1 : 'unset' }}>
        <div className={'gait_cycle_item_value'} style={{backgroundColor: color}}>
          <span>{widthValue}</span>
        </div>
        {/* {
          showText ? <div className={'gait_cycle_item_text'}>
          <span><label style={{color, fontSize: ' 0.926vw', fontWeight: 'bold'}}>{value}</label>ms</span>
          <span>{title}</span>
        </div> : ''
        } */}
      </div>
    );
  }
}
