/* eslint-disable no-useless-constructor */
import React, { Component } from 'react'
import echarts from 'echarts'

export default class ChartCopLine extends Component {
  constructor(props) {
    super(props)
  }

  componentDidMount() {
    this.initLineChart()
  }

  componentDidUpdate() {
    this.initLineChart()
  }

  initLineChart() {
    const { yAxisName, xAxisName, data, type, seriesName, unit, xAxisData } = this.props
    let myChart = echarts.init(this.refs.lineChart)
    let options = this.setLineOption({ yAxisName, xAxisName, data, type, seriesName, unit, xAxisData })
    myChart.setOption(options)
  }

  render() {
    return (
      <div className={'line-react'}>
        <div ref={'lineChart'}
          className={'common_line_chart'}
          style={{ width: '100%', height: '150px' }}
        />
      </div>
    )
  }

  setLineOption({ yAxisName, xAxisName, data, type, seriesName, unit, xAxisData }) {
    return {
      title: {
        text: seriesName
      },
      tooltip: {
        formatter: function (params) {
          return params[0].name + '：' + params[0].value
        },
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          label: {
            backgroundColor: '#6a7985'
          }
        }
      },
      grid: {
        left: '7%',
        right: '2%',
        bottom: '5%',
        top: '30%',
        containLabel: true
      },
      dataZoom: [{
        type: 'inside',
        start: 0,
        end: 100
      }],
      xAxis: {
        name: '',
        type: 'category',
        interval: 5,
        nameLocation: 'center',
        nameGap: 20,
        nameTextStyle: {
          fontStyle: 'normal',
          fontSize: 8
        },
        axisTick: {
          inside: true
        },
        data: xAxisData
      },
      yAxis: {
        type: 'value',
        axisTick: {
          inside: true
        },
        nameTextStyle: {
          fontStyle: 'normal',
          fontSize: 8
        },
        splitLine: {
          show: false
        },
        min: function(value) {
          return value.min - 0.5
        },
        max: function(value) {
          return value.max + 0.5
        }
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
