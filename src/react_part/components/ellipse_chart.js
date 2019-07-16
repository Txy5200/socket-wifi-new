import React, { Component } from 'react';
import { Popover } from 'antd';
// 基础报告中圆形显示图
export default class EllipseChart extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  render() {
    const { title, value, referenceValue, popoverContent, popoverTitle } = this.props;
    return (
      <div className={'ellipse_chart'}>
        <div className={'content_div_title'}>
          <div className={'content_div_title_top'}>
            <span>{title[0]}</span>
            {/* <Popover content={popoverContent} title={<span style={{color: '#ffffff'}}>{popoverTitle}</span>} placement={"right"}>
              <i />
            </Popover> */}
          </div>
          <span>{title[1]}</span>
        </div>
        <div className={'content_div_content'}>
          <span>{value}</span>
        </div>
        <span>{referenceValue}</span>
      </div>
    );
  }
}
