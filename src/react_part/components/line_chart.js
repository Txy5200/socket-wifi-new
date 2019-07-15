/* eslint-disable no-useless-constructor */
import React, { Component } from 'react'
import echarts from 'echarts'

export default class ChartCopLine extends Component {
  constructor(props) {
    super(props)
    this.state = {
      initxAxisData: []
    }
  }

  componentDidMount() {
    let { initxAxisData } = this.state
    for (let i = 0; i < 3000; i++) {
      initxAxisData.push(i)
    }
    this.setState({ initxAxisData }, () => {
      this.initLineChart()
    })
  }

  componentDidUpdate() {
    this.initLineChart()
  }

  initLineChart() {
    const { yAxisName, xAxisName, data, type, seriesName, unit, xAxisData } = this.props
    const { initxAxisData } = this.state
    let myChart = echarts.init(this.refs.lineChart)
    let options = this.setLineOption({ yAxisName, xAxisName, data, type, seriesName, unit, xAxisData: initxAxisData })
    myChart.setOption(options)
  }

  render() {
    return (
      <div className={'line-react'}>
        <div ref={'lineChart'}
          className={'common_line_chart'}
          style={{ width: '420px', height: '80px' }}
        />
      </div>
    )
  }

  setLineOption({ yAxisName, xAxisName, data, type, seriesName, unit, xAxisData }) {
    return {
      title: {
        text: seriesName,
        textStyle: {
          fontSize: 11
        }
      },
      tooltip: {
        // formatter: function (params) {
        //   return params[0].name + '：' + params[0].value
        // },
        // trigger: 'axis',
        // axisPointer: {
        //   type: 'cross',
        //   label: {
        //     backgroundColor: '#6a7985'
        //   }
        // }
        show: false
      },
      grid: {
        left: '2%',
        right: '2%',
        bottom: '5%',
        top: '30%',
        containLabel: true
      },
      xAxis: {
        name: '',
        type: 'category',
        axisTick: {
          show: false
        },
        data: xAxisData
      },
      yAxis: {
        // type: 'value',
        // axisTick: {
        //   inside: true
        // },
        // splitLine: {
        //   show: false
        // },
        show: false
      },
      animation: false,
      series: [{
        type: 'line',
        symbolSize: 0,
        lineStyle: {
          color: '#399eff',
          width: 1
        },
        data
      }
      ]
    }
  }
}
