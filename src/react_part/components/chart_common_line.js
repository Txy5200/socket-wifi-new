import React, { Component } from 'react';
import echarts from 'echarts';

export default class ChartCommonLine extends Component {
  constructor(props) {
    super(props);
  }

  initLineChart() {
    const { yAxisName, xAxisName, data, type, seriesName, unit, xAxisData } = this.props;
    let myChart = echarts.init(this.refs.lineChart);
    let options = this.setLineOption({yAxisName, xAxisName, data, type, seriesName, unit, xAxisData});
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
      <div className="common-line-react">
        <div ref="lineChart" />
      </div>
    );
  }

  setLineOption({yAxisName, xAxisName, data, type, seriesName, unit, xAxisData}) {
    //type 1:cop报告中的折线图、2:数据对比中的折线图、3:cop报告中的椭圆图
    if (type == 1) {
      let len = data.length ? data.length : 20
      xAxisData = xAxisData.slice(0,len)
      return {
        grid: {
          left: '7%',
          right: '2%',
          bottom: '5%',
          top: '15%',
          containLabel: true
        },
        dataZoom:[{
          type: 'inside',
          start: 0,
          end: 100
        }],
        xAxis: {
          name: xAxisName,
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
          name: yAxisName,
          type: 'value',
          axisTick: {
            inside: true
          },
          nameTextStyle: {
            fontStyle: 'normal',
            fontSize: 8,
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
    } else if (type == 2) {
      return {
        tooltip: {
          // formatter: function (params) {
          //   return params.data[1] + 'ms<br>' + params.data[0];
          // }
          trigger: 'axis',
          axisPointer: {
              type: 'cross',
              label: {
                  backgroundColor: '#6a7985'
              }
          }
        },
        color: ['#dfbaff', '#399eff'],
        legend: {
          bottom: 0,
          icon: 'roundRect',
          selectedMode: false,
          data: seriesName
        },
        grid: {
          left: '4%',
          right: '4%',
          top: '10%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          splitLine: {
            show: true
          },
          axisTick: {
            inside: true
          },
          axisLine: { onZero: false }
        },
        yAxis: {
          name: unit,
          type: 'value',
          axisTick: {
            inside: true
          },
          axisLine: { onZero: false },
          min: function(value) {
            let gap = parseInt((value.max - value.min)/data.length)
            return value.min - gap
          },
          max: function(value) {
            let gap = parseInt((value.max - value.min)/data.length)
            return value.max + gap
          }
        },
        animation: false,
        series: [{
          name: seriesName[0],
          type: 'line',
          symbolSize: 9,
          animation: false,
          smooth: true,
          lineStyle: {
            color: '#dfbaff',
            width: 4
          },
          data: data[0]
        },
        {
          name: seriesName[1],
          type: 'line',
          symbolSize: 9,
          smooth: true,
          animation: false,
          lineStyle: {
            color: '#399eff',
            width: 4
          },
          data: data[1]
        }
        ]
      }
    } else if (type == 3){
      return {
        grid: {
          left: '7%',
          right: '2%',
          bottom: '5%',
          top: '15%',
          containLabel: true
        },
        xAxis: {
          name: xAxisName,
          type: 'value',
          nameLocation: 'center',
          nameGap: 20,
          nameTextStyle: {
            fontStyle: 'normal',
            fontSize: 8
          },
          axisTick: {
            show: false
          }
        },
        yAxis: {
          name: yAxisName,
          type: 'value',
          axisTick: {
            show: false
          },
          nameTextStyle: {
            fontStyle: 'normal',
            fontSize: 8,
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
          data: data[0]
        },
        {
          type: 'line',
          symbolSize: 0,
          lineStyle: {
            color: '#399eff',
            width: 1
          },
          data: data[1]
        }
        ]
      }
    }
  }
}
