import React, { Component } from 'react'
export default class InputBox extends Component {
  constructor(props) {
    super(props)
    this.state = {
    }
  }
  render() {
    const {
      title,
      type,
      style,
      placeholder,
      extraBtn,
      value,
      icon,
      onBlur
    } = this.props
    return (
      <div
        className={'input_box'}
        style={style}
      >
        {icon ? <img src={icon} /> : ''}
        {title ? <span>{title}</span> : ''}
        <div className={'input'}>
          <input
            type={type}
            value={value}
            placeholder={placeholder}
            onChange={e => {
              this.props.onChange(e.target.value)
            }}
            onBlur={e => {
              onBlur ? this.props.onBlur(e.target.value) : ''
            }}
          />
        </div>
        {extraBtn ? <div
          className={'extra_btn'}
          onClick={() => {
            this.props.onBtnClick()
          }}
        >{extraBtn}</div> : ''}
      </div>
    )
  }
}
