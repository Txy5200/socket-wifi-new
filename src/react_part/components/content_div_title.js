import React, { Component } from 'react';
import { Popover } from 'antd';
export default class GaitCycleDivTitle extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  render() {
    const { title, value, popoverContent, popoverTitle, color } = this.props;
    return (
      <div className={'basic_content_div_title'}>
        <div className={'content_div_title_top'}>
          <span>{title[0]}</span>
          {/* <Popover content={popoverContent} title={<span style={{color: '#ffffff'}}>{popoverTitle}</span>} placement={'rightTop'}>
            <i />
          </Popover> */}
        </div>
        <span>{title[1]}</span>
        <span><label style={{color, fontSize: '1.042vw'}}>{value}</label>ms</span>
      </div>
    );
  }
}
