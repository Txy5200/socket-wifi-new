import React, { Component } from 'react';
import echarts from 'echarts';

export default class ChartCopLine extends Component {
  constructor(props) {
    super(props);
  }

  initLineChart() {
    const { data, yAxisName, xAxisName, xAxisNameLocation, smooth = false, width } = this.props;
    let myChart = echarts.init(this.refs.lineChart);
    let options = this.setLineOption({ data, yAxisName, xAxisName, xAxisNameLocation, smooth, width });
    myChart.setOption(options);
  }

  componentDidMount() {
    this.initLineChart();
  }

  componentDidUpdate() {
    this.initLineChart();
  }

  render() {
    return (
      <div className="line-react">
        <div ref="lineChart" className={'dynamic_pressure_content_img'} />
        <div className={'copLine-bottom-span'}>
          <span>L</span>
          <span>R</span>
        </div>
      </div>
    );
  }

  setLineOption({ data, yAxisName, xAxisName, xAxisNameLocation, smooth, width }) {
    let redData = data.splice(-100, 100)
    return {
      xAxis: {
        name: xAxisName,
        nameLocation: xAxisNameLocation,
        type: 'value',
        max: 452,
        min: 0,
        show: false
      },
      yAxis: {
        name: yAxisName,
        type: 'value',
        max: 538,
        min: 0,
        show: false
      },
      grid: {
        left: '0',
        bottom: '0',
        top: '0',
        right: '0',
        containLabel: true
      },
      series: [{
        type: 'line',
        symbolSize: 0,
        animation: false,
        itemStyle: {
          color: {
            type: 'radial',
            x: 0.5,
            y: 0.5,
            r: 0.5,
            colorStops: [{
              offset: 0, color: 'red' // 0% 处的颜色
            }, {
              offset: 1, color: 'blue' // 100% 处的颜色
            }],
            global: false // 缺省为 false
          }
        },
        smooth: true,
        lineStyle: {
          color: '#0080ff',
          width: 2
        },
        data
      },
      {
        type: 'line',
        symbolSize: 0,
        animation: false,
        itemStyle: {
          color: {
            type: 'radial',
            x: 0.5,
            y: 0.5,
            r: 0.5,
            colorStops: [{
              offset: 0, color: 'red' // 0% 处的颜色
            }, {
              offset: 1, color: 'red' // 100% 处的颜色
            }],
            global: false // 缺省为 false
          }
        },
        smooth: true,
        lineStyle: {
          color: 'red',
          width: 2
        },
        data: redData
      }
    ]
    };
  }
}
