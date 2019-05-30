import React, { Component } from 'react';
import echarts from 'echarts';
import { pressColor } from '../helper/util'

export default class ChartScatter extends Component {
  constructor(props) {
    super(props);
  }

  initScatterChart() {
    const { data } = this.props;
    let myChart = echarts.init(this.refs.scatterChart);
    let options = this.setScatterOption(data);
    myChart.setOption(options);
  }

  componentDidMount() {
    this.initScatterChart();
  }

  componentDidUpdate() {
    this.initScatterChart();
  }

  render() {
    return (
      <div className="scatter-react">
        <div ref="scatterChart" className={'dynamic_pressure_content_img'} />
        <div className={'scatter-bottom-span'}>
          <span>L</span>
          <span>R</span>
        </div>
      </div>
    );
  }

  setScatterOption(data) {
    const option = {
      xAxis: {
        show: false,
        max: 452,
        min: 0
      },
      yAxis: {
        show: false,
        max: 538,
        min: 0
      },
      grid: {
        left: '0',
        bottom: '0',
        top: '0',
        right: '0',
        containLabel: true
      },
      series: [{
        data: data,
        type: 'scatter',
        animation: false,
        symbolSize: 25,
        itemStyle: {
          normal: {
            color: function (param) {
              if (param.data[2] === 0) {
                return 'rgba(0,0,0,0)'
              }
              return new echarts.graphic.RadialGradient(0.5, 0.5, 1, [{
                offset: 0,
                color: pressColor[param.data[2]]
              },
              {
                offset: 1,
                color: 'rgb(255, 255, 255)'
              }])
            }
          }
        }
      }]
    }
    return option
  }
}
