import React, { Component } from 'react';
import { Select } from 'antd';

export default class SelectInput extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  render() {
    const { title, style, placeholder, value, selectOption } = this.props;
    return (
      <div className={'select_input'} style={style}>
        {title ? <span>{title}</span> : ''}
        <div className={'select_box'}>
          <Select 
            showSearch
            value={value}
            notFoundContent={null}
            placeholder={placeholder} 
            style={style} 
            defaultActiveFirstOption={false} 
            filterOption={false} 
            onChange={this.props.handleChange}
          >
            {selectOption}
          </Select>
        </div>
      </div>
    );
  }
}
