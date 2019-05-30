import React from 'react';
import { connect } from 'react-redux';
import { login, setHeaderState } from '../ducks';
import { history } from '../helper/history';

class Login extends React.Component {
  constructor(props) {
    super(props);
    const { user } = this.props
    const { username, password } = user
    this.state = {
      username,
      password,
      showTips: false
    };
  }

  componentDidMount() {
    this.props.setHeaderState({clickState: true})
    if (this.props.loginState) history.push('/inspection');
  }

  userLogin() {
    const { username, password } = this.state;
    const { login } = this.props;
    if (!username || !password) return;
    let result = login(username, password);
    if (result.code === 200) {
      localStorage.setItem('username', username);
      localStorage.setItem('user', JSON.stringify(result));
      history.push('/inspection');
    } else {
      this.setState({ showTips: true })
    }
  }

  render() {
    const { username, password, showTips } = this.state;

    return (
      <div className={'loginPage'}>
        <section className={'login_section'}>
          <div className={'section_title'}>
            <span className={'loginTxt'}>大艾科技足底压力分析系统</span>
          </div>
          <ul>
            {showTips ? (
              <li>
                <div className={'input_div'}>
                  <i className={'tip_info'} />
                  <span>账号或密码错误,请重新输入</span>
                </div>
              </li>
            ) : (
                ''
              )}
            <li>
              <div className={'input_div'}>
                <i className={'user_name'} />
                <input type="text" placeholder={'请输入用户名'} onChange={e => this.setState({ username: e.target.value })} value={username} />
              </div>
            </li>
            <li>
              <div className={'input_div'}>
                <i className={'password'} />
                <input type="password" placeholder={'请输入密码'} onChange={e => this.setState({ password: e.target.value })} value={password} />
              </div>
            </li>
            <li className={'forget_psw_li'}>
              <div
                className={'forget_psw'}
                onClick={() => {
                  history.push('/login/changePwd');
                }}
              >
                修改密码?
              </div>
            </li>
            <li className={'btn_li'}>
              <div>
                <button className="loginBtn" onClick={() => this.userLogin()}>
                  登录
                </button>
              </div>
            </li>
          </ul>
        </section>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    user: state.user.user,
    loginState: state.user.loginState
  };
}

export default connect(
  mapStateToProps,
  { 
    login, 
    setHeaderState 
  }
)(Login);
