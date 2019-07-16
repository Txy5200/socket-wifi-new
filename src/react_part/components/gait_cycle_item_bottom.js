import React, { Component } from 'react';
export default class GaitCycleItemBottom extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  render() {
    const { title, color, value, width } = this.props;
    return (
      <div className={'gait_cycle_item_text'} style={{width}}>
        {value != undefined ? <span><label style={{color, fontSize: ' 0.926vw', fontWeight: 'bold'}}>{value}</label>ms</span> : ''}
        {value != undefined ? <span>{title}</span> : ''}
      </div>
    );
  }
}
