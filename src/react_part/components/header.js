import React from 'react';
import { Popover, message, Modal } from 'antd'
import { connect } from 'react-redux';
import { history } from '../helper/history';
import { MENUS } from '../helper/config';
import { logout, exportPDF, setExportState } from '../ducks'
const { dialog } = require('electron').remote
const { ipcRenderer } = require('electron')

class TopPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      showLogout: true
    };
  }

  componentDidMount() {
    // 监听异步消息
    // 进入到查看报告界面后开始监听导出状态
    const path = this.props.location.pathname || '/'
    
    if(~path.indexOf('/inspection/report')){
      ipcRenderer.on('asynchronous-reply', (event, arg) => {
        if(arg.arg.type === 'exportToPDF'){
          if(arg.code === 200){
            this.props.setExportState(true)
          }else{
            this.props.setExportState(false)
          }
        }
      })
    }
  }

  componentWillReceiveProps(nextProps) {
    const { exportState } = nextProps
    if(exportState !== undefined && exportState){
      Modal.success({
        title: '导出成功',
        onOk: () => {
          this.props.setExportState(undefined)
        }
      })
    }
    if(exportState !== undefined && !exportState){
      Modal.error({
        title: '导出失败',
        onOk: () => {
          this.props.setExportState(undefined)
        }
      })
    }
  }

  componentWillUnmount() {
    // 移除所有与asynchronous-reply相关的监听器
    ipcRenderer.removeAllListeners('asynchronous-reply')
  }

  async exportPdf(fileName) {
    dialog.showSaveDialog(null, {
      title: '导出报告',
      buttonLabel: '导出',
      defaultPath: fileName,
    }, (filePath) => {
      if(filePath){
        this.props.exportPDF(filePath)
      }
    })
  }

  render() {
    const historyLen = history.length
    const historyLenCurrent = history.index
    let backBtnState = historyLenCurrent > 1 ? false : true
    let forwardBtnState = historyLenCurrent === historyLen - 1 ? true : false

    const { user, clickState, exportFileName } = this.props
    const { username = 'admin' } = user
    const path = this.props.location.pathname || '/'
    let exportSrc = `${__dirname}/../public/icons/undownload.png`
    if(~path.indexOf('/inspection/report') && exportFileName) {
      exportSrc = `${__dirname}/../public/icons/download.png`
    }
    let imgClassName = ~path.indexOf('/inspection/report') && exportFileName ? 'export_pdf_img' : 'export_pdf_img_sel'
    const content = (
      <div className={'logout_content'}>
        <img src={`${__dirname}/../public/icons/icon-user.png`} />
        <div className={'logout_info'}>
          <span>{username}</span>
          <div className={'logout_btn'}
            onClick={() => {
              if (clickState) {
                this.props.logout()
                history.push('/login')
              }
            }}>退出</div>
        </div>
      </div>
    );

    return (
      <div className={'top_menus'}>
        <img src={`${__dirname}/../public/icons/logo.png`} />
        <div className={'content_menu'}>
          {MENUS.map((item, index) => {
            const { icon, icon_click, url } = item
            let img = icon
            let selLabel = ''
            if (path.indexOf(url) !== -1) {
              img = icon_click
              selLabel = 'selLabel'
            }
            return (
              <div key={index}
                onClick={() => {
                  clickState ? history.push(url) : ''
                }}
              >
                <img src={`${__dirname}/../public/icons/${img}.png`} />
                <label className={selLabel}>{item.name}</label>
              </div>
            )
          })}
        </div>
        <div className={'export_pdf_btn'}
          onClick={() => {
            if(~path.indexOf('/inspection/report') && exportFileName){
              this.exportPdf(exportFileName)
            }
          }}
        >
          <img className={imgClassName} src={exportSrc} />  
        </div>
        <div className={'history_btn'}>
          <button disabled={backBtnState} className={'back_btn'} onClick={() => {
            history.goBack()
          }}/>
          <button disabled={forwardBtnState} className={'forward_btn'} onClick={() => {
            history.goForward()
          }}/>
        </div>
        <Popover placement="bottom" content={content} trigger="hover">
          <div className={'rightUserInfo'}>
            <img src={`${__dirname}/../public/icons/icon-user.png`} />
          </div>
        </Popover>
      </div>
    )
  }
}

function mapStateToPros(state) {
  return {
    user: state.user.user,
    clickState: state.globalSource.clickState,
    exportFileName: state.globalSource.exportFileName,
    exportState: state.globalSource.exportState
  };
}

export default connect(
  mapStateToPros,
  {
    logout,
    exportPDF,
    setExportState
  }
)(TopPage);
