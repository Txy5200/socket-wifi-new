import React, { Component } from 'react'
import { Table } from 'antd'

export default class ResizableTable extends Component {
  constructor(props) {
    super(props)
    this.state = {
    }
  }

  render() {
    const { columns, dataSource, showHeader = false, rowSelection = {}, height = 'auto' } = this.props
    return (
      <div>
        <Table
          size={'middle'}
          columns={columns}
          dataSource={dataSource}
          rowSelection={rowSelection}
          showHeader={showHeader}
          pagination={false}
          height
          locale={{
            emptyText: '暂无数据'
          }}
          {...this.props}
        />
      </div>
    )
  }
}
