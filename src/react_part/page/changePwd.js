import React from 'react';
import { connect } from 'react-redux';
import { history } from '../helper/history';
import { InputBox } from '../components';
import { message } from 'antd';
import { resetPassword } from '../ducks'

class ChangePwd extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      phone: '',
      code: '',
      oldPwd: '',
      newPwd: '',
      certainPwd: '',
      extraBtnText: '发送验证码',
      seconds: 60,
      tips: ''
    };
  }

  async phoneVerifyCode() {
    const { phoneVerifyCode } = this.props;
    const { phone } = this.state;
    let data = await phoneVerifyCode({ phone });
    if (data.code !== 200 && data.code !== '200' && data.code === undefined) {
      this.refs.myAlert.alert('提示', data.msg || data, '', 'Danger');
      this.setState({ extraBtnText: '重新发送' });
      clearInterval(this.timerID);
    }
  }

  async getVerificationCode() {
    this.timerID = setInterval(() => {
      this.setSeconds();
    }, 1000);
  }

  setSeconds() {
    const { seconds } = this.state;
    if (seconds > 0) {
      this.setState({ seconds: seconds - 1, extraBtnText: seconds + 's' });
    } else {
      this.setState({ extraBtnText: '重新发送' });
      clearInterval(this.timerID);
    }
  }

  submit() {
    let { oldPwd, newPwd, certainPwd } = this.state
    if( newPwd !== certainPwd){
      message.error('输入的两次新密码不同，请确认')
      return
    }
    let data = this.props.resetPassword({oldPwd, newPwd})
    if(data){
      message.error('修改密码失败')
    }else{
      history.push('/login')
    }
  }

  render() {
    const { phone, code, oldPwd, newPwd, certainPwd, extraBtnText } = this.state;

    return (
      <div className={'loginPage'}>
        <div className={'input_center'}>
          <div className={'section_title'}>
            <span className={'loginTxt'}>修改密码</span>
          </div>
          {/* <InputBox
            type={'text'}
            placeholder={'请输入手机号码'}
            value={phone}
            onChange={e => {
              this.setState({ phone: e });
            }}
          />
          <InputBox
            type={'text'}
            placeholder={'请输入验证码'}
            value={code}
            onChange={e => {
              this.setState({ code: e });
            }}
            extraBtn={extraBtnText}
            onBtnClick={() => {
              if (extraBtnText === '获取') {
                this.getVerificationCode();
                this.phoneVerifyCode();
              } else if (extraBtnText === '重新发送') {
                this.setState({ seconds: 60 });
                this.getVerificationCode();
                this.phoneVerifyCode();
              }
            }}
          /> */}
          <InputBox
            icon={`${__dirname}/../public/icons/password.png`}
            type={'password'}
            placeholder={'请输入原密码'}
            value={oldPwd}
            onChange={e => {
              this.setState({ oldPwd: e });
            }}
          />
          <InputBox
            icon={`${__dirname}/../public/icons/password.png`}
            type={'password'}
            placeholder={'请输入新密码'}
            value={newPwd}
            onChange={e => {
              this.setState({ newPwd: e });
            }}
            onBlur={e => {
              if(e !== certainPwd){
                message.error('输入的两次新密码不同，请确认')
              }
            }}
          />
          <InputBox
            icon={`${__dirname}/../public/icons/password.png`}
            type={'password'}
            placeholder={'请确认新密码'}
            value={certainPwd}
            onChange={e => {
              this.setState({ certainPwd: e });
            }}
            onBlur={e => {
              if(e !== newPwd){
                message.error('输入的两次新密码不同，请确认')
              }
            }}
          />
          <div className={'determine_btn'}>
            <button className="cancelBtn" onClick={() => history.push('/login')}>
              取消
            </button>
            <button className="loginBtn" onClick={() => this.submit()}>
              确认
            </button>
          </div>
        </div>
      </div>
    );
  }
}
function mapStateToProps(state) {
  return {};
}

export default connect(
  mapStateToProps,
  {
    resetPassword
  }
)(ChangePwd);
