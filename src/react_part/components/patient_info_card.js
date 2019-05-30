import React from 'react'
import { checkIdCard, getAgeByIdCard } from '../helper/util'
export default class PatientInfoCard extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      tip: ''
    }
  }

  render() {
    const { patientInfo, onChange, clickState } = this.props
    const { name, certificateNo, height, weight, age, shoeSize } = patientInfo

    return (
      <div className={'user_info_card'}>
        <div className={'top_info'}>
          <div className={'user_image'}>
            <img src={`${__dirname}/../public/icons/Edituser.png`} />
          </div>
          {/* <div className={'user_change'}
            onClick={() => {
              console.log('切换用户')
            }}>
            切换用户
          </div> */}
        </div>
        <div className={'patient_info'}>
          <label>
            <span>姓名</span>
            <input placeholder={'请输入姓名'} 
              value={name} 
              readOnly={!clickState}
              onChange={(e) => {
                onChange('name', e.target.value)
              }} 
            />
          </label>
          <label>
            <span>身份证号</span>
            <input placeholder={'请输入身份证'} 
              value={certificateNo} 
              onChange={(e) => {
                onChange('certificateNo', e.target.value)
              }} 
              readOnly={!clickState}
              onBlur={e => {
                let { pass, tip } = checkIdCard(e.target.value)
                if (!pass) {
                  this.setState({tip})
                }else{
                  onChange('age',getAgeByIdCard(e.target.value))
                }
              }}
            />
          </label>
          <label>{this.state.tip}</label>
        </div>
        <div className={'sign_info'}>
          <div>
            <label>
              <input placeholder={'--'} 
                type={'number'} 
                value={height} 
                readOnly={!clickState}
                onChange={(e) => {
                  onChange('height', e.target.value)
                }} 
              />
              <span>cm</span>
            </label>
            <div>身高</div>
          </div>
          <div>
            <label>
              <input placeholder={'--'} 
                type={'number'} 
                value={weight} 
                readOnly={!clickState}
                onChange={(e) => {
                  onChange('weight', e.target.value)
                }} 
              />
              <span>kg</span>
            </label>
            <div>体重</div>
          </div>
          <div>
            <label>
              <input placeholder={'--'} 
                type={'number'} 
                value={age} 
                readOnly={!clickState} 
                onChange={(e) => {
                  onChange('age', e.target.value)
                }}
              />
              <span>岁</span>
            </label>
            <div>年龄</div>
          </div>
          <div>
            <label>
              <input placeholder={'--'} 
                type={'number'} 
                value={shoeSize} 
                readOnly={!clickState}
                onChange={(e) => {
                  onChange('shoeSize', e.target.value)
                }} 
              />
              <span>码</span>
            </label>
            <div>鞋码</div>
          </div>
        </div>
      </div>
    )
  }
}