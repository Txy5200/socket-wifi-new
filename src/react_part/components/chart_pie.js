import React, { Component } from 'react';
import echarts from 'echarts';

export default class ChartPie extends Component {
  constructor(props) {
    super(props);
  }

  initPieChart() {
    const { name, title, data, radius = null, position } = this.props;
    let myChart = echarts.init(this.refs.pieChart);
    let initOptions = { title, name, data, position }
    if (radius) initOptions.radius = radius
    let options = this.setPieOption(initOptions);
    myChart.setOption(options);
  }

  componentDidMount() {
    this.initPieChart();
  }

  render() {
    return (
      <div className="pie-react">
        <div ref="pieChart" />
      </div>
    );
  }

  setPieOption({ title, name, data, radius, position }) {
    if (radius) {
      let formatterData = 0
      if (data[0].value !== 0 && data[1].value !== 0)
        formatterData = data[0].value - data[1].value > 0 ? data[1].value / data[0].value : data[0].value / data[1].value
      return {
        tooltip: {
          trigger: 'item',
          formatter: '{b} : {c}ms',
          confine: true
        },
        title: {
          text: title,
          bottom: 70,
          left: 'center',
          textStyle: {
            fontSize: 14,
            fontWeight: 'normal'
          }
        },
        legend: {
          left: 'center',
          left: 'center',
          orient: 'vertical',
          bottom: 20,
          selectedMode: false,
          formatter: function (name) {
            for(let item of data){
              if(item.name == name){
                return `${name} ${item.value}ms`
              }
            }
        }
        },
        series: [
          {
            hoverOffset: 0,
            radius,
            center: ['50%', '35%'],
            name,
            type: 'pie',
            data,
            itemStyle: {
              color: ({ dataIndex }) => {
                if (dataIndex === 0) return '#399eff'
                if (dataIndex === 1) return '#dfbaff'
              }
            },
            label: {
              position,
              formatter: function () {
                return `${Math.round(formatterData * 100)}%`
              }
            }
          }
        ]
      };
    }
    return {
      legend: {
        left: 'center',
        left: 'center',
        orient: 'vertical',
        bottom: 0,
        selectedMode: false,
        formatter: function (name) {
          for(let item of data){
            if(item.name == name){
              return `${name} ${item.value}ms`
            }
          }
      }
      },
      tooltip: {
        trigger: 'item',
        confine: true
      },
      series: [
        {
          center: ['50%', '35%'],
          name,
          type: 'pie',
          data,
          radius: '50%',
          hoverOffset: 0,
          itemStyle: {
            color: ({ dataIndex }) => {
              if (dataIndex === 0) return '#399eff'
              if (dataIndex === 1) return '#dfbaff'
            }
          },
          label: {
            position,
            formatter: (data) => {
              return `${data.percent.toFixed(0)}%`
            }
          }
        }
      ]
    };
  }
}
