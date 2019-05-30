import React from 'react'
import { connect } from 'react-redux'
import { logout, openSerialport, closeSerialport } from '../ducks'
import { history } from '../helper/history'
class Home extends React.Component {
  constructor(props) {
    super(props)
    this.state = {}
  }

  userlogout() {
    this.props.logout()
    history.push('/login')
  }

  render() {
    return (
      <div>
        <p>登录成功了dd</p>
        <button onClick={() => this.props.openSerialport()}>打开串口</button>
        <button onClick={() => this.props.closeSerialport()}>关闭串口</button>
        <button onClick={() => this.userlogout()}>注销</button>
      </div>
    )
  }
}
function mapStateToProps(state) {
  return {}
}

export default connect(
  mapStateToProps,
  { logout, openSerialport, closeSerialport }
)(Home)
