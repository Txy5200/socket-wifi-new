import React from 'react';
import { SelectInput } from '../components';
import { connect } from 'react-redux';
import { getSerialportList, configSerialport } from '../ducks'
import { Container } from '../components';
import { Icon, Select, message } from 'antd'
import fs from 'fs-extra'
const path = require('path')
const Option = Select.Option;

const { dialog, app } = require('electron').remote

class SettingPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      action_type: 1,
      formData: {
        port1: undefined,
        port2: undefined,
        baudrate: 921600,
        dataBit: 8,
        parityBit: 'None',
        stopBit: 1
      }
    };
  }

  componentDidMount() {
    this.props.getSerialportList()
  }

  handleChange(value) {
    console.log(`selected ${value}`);
  }

  setFormData(key, value){
    let { formData } = this.state
    formData[key] = value
    this.setState({formData})
  }

  exportDataBase() {
    // 选择导出的文件夹
    dialog.showOpenDialog(null, {
      title: '导出数据库文件',
      buttonLabel: '导出',
      properties: [
        'openDirectory',
        'promptToCreate',
        'createDirectory'
      ]
    }, (filePath) => {
      if(filePath && filePath.length > 0){
        const isDevMode = process.execPath.match(/[\\/]electron/)
        let userDataPath = app.getPath('userData') + '/db'
        if (isDevMode) userDataPath = path.join(__dirname, '../../electron_part/database/db')
        fs.copy(userDataPath, filePath[0], err => {
          if(err) {
            console.log('导出数据库错误=====>', err)
            message.error('导出失败')
          }else{
            message.success('导出完成')
          }
        })
      }
    })
  }

  submit() {
    const { formData } = this.state
    if(!formData.port1 || !formData.port2){
      message.error('请选择串口')
      return
    }
    const { configSerialport } = this.props
    let data = configSerialport(formData.port1, formData.port2)
    if(data){
      message.error(`保存失败：${data}`)
    }else{
      message.success('保存成功')
    }
  }

  render() {
    const portData = this.props.serialportList
    const baudrateData = [921600]
    const dataBitData = [5, 6, 7, 8]
    const parityBitData = ['None', 'Odd', 'Even']
    const stopBitData = [1, 2]
    const { action_type, formData } = this.state;
    const { port1, port2, baudrate, dataBit, parityBit, stopBit } = formData

    const portOptions = portData.map((item, index) => <Option key={index}>{item}</Option>);
    const baudrateOptions = baudrateData.map((item, index) => <Option key={index}>{item}</Option>);
    const dataBitOptions = dataBitData.map((item, index) => <Option key={index}>{item}</Option>);
    const parityBitOptions = parityBitData.map((item, index) => <Option key={index}>{item}</Option>);
    const stopBitOptions = stopBitData.map((item, index) => <Option key={index}>{item}</Option>);

    return (
      <Container {...this.props}>
        <div className={'action_type_box'}>
          <button
            className={'action_type_btn ' + (action_type === 1 ? 'sel' : '')}
            onClick={() => {
              this.setState({ action_type: 1 });
            }}
          >
            配置串口
          </button>
          <button
            className={'action_type_btn ' + (action_type === 2 ? 'sel' : '')}
            onClick={() => {
              // this.setState({ action_type: 2 });
              this.exportDataBase()
            }}
          >
            导出数据库
          </button>
        </div>
        <div className={'setting_content'}>
          <SelectInput
            title={'端口1'}
            placeholder={'选择端口'}
            value={port1}
            selectOption={portOptions}
            handleChange={value => {
              this.setFormData('port1', value);
            }}
          />
          <SelectInput
            title={'端口2'}
            placeholder={'选择端口'}
            value={port2}
            selectOption={portOptions}
            handleChange={value => {
              this.setFormData('port2', value);
            }}
          />
          <SelectInput
            title={'波特率'}
            placeholder={'设置波特率'}
            value={baudrate}
            selectOption={baudrateOptions}
            handleChange={value => {
              this.setFormData('baudrate', value);
            }}
          />
          <SelectInput
            title={'数据位'}
            placeholder={'设置数据位'}
            value={dataBit}
            selectOption={dataBitOptions}
            handleChange={value => {
              this.setFormData('dataBit', value);
            }}
          />
          <SelectInput
            title={'校验位'}
            placeholder={'设置校验位'}
            value={parityBit}
            selectOption={parityBitOptions}
            handleChange={value => {
              this.setFormData('parityBit', value);
            }}
          />
          <SelectInput
            title={'停止位'}
            placeholder={'设置停止位'}
            value={stopBit}
            selectOption={stopBitOptions}
            handleChange={value => {
              this.setFormData('stopBit', value);
            }}
          />
          <div className={'refreshBtn_div'}>
            <button
              className="refreshBtn"
              onClick={() => {
                console.log('刷新端口');
                this.props.getSerialportList()
              }}
            >
              <Icon type={'reload'} />
              <span>刷新端口</span>
            </button>
          </div>
          <div className={'bottom_div'}>
            <button
              className="cancelBtn"
              onClick={() => {
                console.log('Cancel');
              }}
            >
              Cancel
            </button>
            <button
              className="saveBtn"
              onClick={() => {
                console.log('Save');
                this.submit()
              }}
            >
              Save
            </button>
          </div>
        </div>
      </Container>
    )
  }
}

function mapStateToProps(state) {
  return {
    serialportList: state.serialport.serialportList
  };
}

export default connect(
  mapStateToProps,
  {
    getSerialportList,
    configSerialport
  }
)(SettingPage);
