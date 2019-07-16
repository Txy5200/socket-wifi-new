import React, { Component } from 'react';
export default class GaitCycleItemTop extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  render() {
    const { standPhaseValue, swingPhaseValue, width } = this.props;
    return (
      <div className={'gait_cycle_item_top'}>
        <div className={'phase_title'} style={{flex: width == '0%' ? 3 : 1}}>
          <span>
            <label>支撑相</label> <label>{standPhaseValue}</label>
            <label>ms</label>
          </span>
        </div>
        <div className={'phase_title'} style={{width, flex: width == '0%' ? 1 : 'unset'}} >
          <span>
            <label>摆动相</label> <label>{swingPhaseValue}</label>
            <label>ms</label>
          </span>
        </div>
      </div>
    );
  }
}
