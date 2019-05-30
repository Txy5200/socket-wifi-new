import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Container, ResizableTable } from '../components';
import { Input, Pagination, message, Modal } from 'antd';
import { history } from '../helper/history';
import { getAgeByIdCard } from '../helper/util'
import moment from 'moment'
import { getHistoryRecord, deleteHistoryRecord, clearHistoryRecord, setPatientInfo, setCurrentRecordID, setGaitInfo, setCopInfo, setHistoryState } from '../ducks'
const Search = Input.Search;

class HistoryRecord extends Component {
  constructor(props) {
    super(props);
    const { historyState } = this.props
    const { keyword, page } = historyState
    this.state = {
      keyword,
      page,
      limit: 14,
      selectedRowKeys: []
    };
  }

  componentDidMount() {
    this.getDatas({keyword: this.state.keyword, page: this.state.page})
  }

  getColumns() {
    const columns = [
      {
        title: '患者姓名',
        dataIndex: 'name',
        key: 'name',
        width: 150
      },
      {
        title: '身份证号',
        dataIndex: 'certificate_no',
        key: 'certificate_no',
        width: 70
      },
      {
        title: '开始时间',
        dataIndex: 'start_time',
        key: 'start_time',
        render: (value, record) => {
          return moment(value).format('YYYY-MM-DD HH:mm:ss')
        }
      },
      {
        title: '查看报告',
        dataIndex: '_id',
        key: '_id',
        render: (value, record) => {
          return (
            <a 
              onClick={() => {
                this.props.setGaitInfo({ currentGaitInfo: record.gaitInfo || {} })
                this.props.setCopInfo({ currentCopInfo: record.copInfo || [] })
                this.props.setCurrentRecordID({ currentRecordId: value })
                const age = getAgeByIdCard(record.certificate_no)
                this.props.setPatientInfo({name: record.name, age: age, shoeSize: record.shoe_size, certificateNo: record.certificate_no, inspectionTime: record.start_time})
                history.push('/inspection/report')
              }}
            >{'查看报告'}</a>
          )
        }
      }
    ];
    return columns;
  }

  getDatas({ page = 1, limit = 14, keyword }) {
    const { getHistoryRecord } = this.props
    getHistoryRecord({ page, limit, keyword })
  }

  deleteHistory() {
    const { selectedRowKeys, page, limit, keyword } = this.state
    const { deleteHistoryRecord } = this.props
    let result = deleteHistoryRecord(selectedRowKeys);
    if (result) {
      message.error(result)
    } else {
      message.success('删除成功')
      this.setState({selectedRowKeys: []})
      this.getDatas({page, limit, keyword})
    }
  }

  clearHistory() {
    const { page, limit, keyword } = this.state
    const { clearHistoryRecord } = this.props
    let result = clearHistoryRecord();
    if (result) {
      message.error(result)
    } else {
      message.success('清除成功')
      this.getDatas({page, limit, keyword})
    }
  }

  itemRender(current, type, originalElement) {
    if (type === 'prev') {
      return <a>上一页</a>;
    }
    if (type === 'next') {
      return <a>下一页</a>;
    }
    return originalElement;
  }

  pageOnChange(page, limit) {
    const { keyword } = this.state
    this.setState({ page, limit })
    this.getDatas({ page, limit, keyword })
    this.props.setHistoryState({keyword, page})
  }

  tableOnChange(selectedRowKeys, selectedRows) {
    this.setState({ selectedRowKeys })
  }

  render() {
    const { selectedRowKeys, keyword } = this.state
    let { pageInfo, history_record_data } = this.props
    const hasSelected = selectedRowKeys.length > 0;

    return (
      <Container {...this.props}>
        <div className={'history_record'}>
          <div className={'history_btn_content'}>
            <button className={'history_del_btn'}
              disabled={!hasSelected}
              onClick={() => {
                this.deleteHistory()
              }}
            >删除所选项</button>
            <button className={'history_cle_btn'}
              disabled={!pageInfo.count}
              onClick={() => {
                Modal.confirm({
                  content: '确认是否清空',
                  cancelText: '否',
                  okText: '是',
                  onOk: () => {
                    this.clearHistory()
                  }
                })
              }}
            >清空记录</button>
            <div className={'search_box'}>
              <Search
                placeholder="搜索患者记录"
                value={keyword}
                onChange={(e) => {
                  this.setState({keyword: e.target.value})
                }}
                onSearch={(keyword) => {
                  this.setState({ keyword })
                  this.getDatas({ page: 1, limit: 14, keyword })
                  this.props.setHistoryState({keyword, page: 1})
                }}
              />
            </div>
          </div>
          <div className={'page_card'}>
            <div className={'common_table'} style={{ height: '72.59vh', marginTop: '2.037vh' }}>
              <ResizableTable
                rowKey={record => record._id}
                columns={this.getColumns()}
                dataSource={history_record_data}
                rowSelection={{
                  onChange: (selectedRowKeys, selectedRows) => this.tableOnChange(selectedRowKeys, selectedRows),
                  selectedRowKeys
                }}
              />
            </div>
            <div className={'content_bottom'}>
              <Pagination
                total={pageInfo.count}
                pageSize={pageInfo.limit || 14}
                current={this.state.page}
                onChange={(page, pageSize) => this.pageOnChange(page, pageSize)}
                itemRender={(page, type, originalElement) => this.itemRender(page, type, originalElement)}
              />
            </div>
          </div>
        </div>
      </Container>
    );
  }
}
function mapStateToProps(state) {
  return {
    history_record_data: state.history.history_record_data,
    pageInfo: state.history.pageInfo,
    historyState: state.globalSource.historyState
  };
}

export default connect(
  mapStateToProps,
  {
    getHistoryRecord,
    deleteHistoryRecord,
    clearHistoryRecord,
    setPatientInfo,
    setCurrentRecordID,
    setGaitInfo,
    setCopInfo,
    setHistoryState
  }
)(HistoryRecord);
