import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Container, CarouselComponent } from '../components';
import { Carousel } from 'antd';

class HelpScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  componentDidMount() {
  }

  render() {
    return (
      <Container {...this.props}>
        <div className={'help_content'}>
        <Carousel className={'help_carousel'} dots={false} arrows infinite={false}>
          <div className={'help_item'}><img src={`${__dirname}/../public/icons/help.png`} /></div>
          <div className={'help_item'}>
            <div>
              <ul>
                <li>
                  <span><i/><label>步行周期</label></span>
                  <p>左腿步行周期：从左脚跟着地到左脚跟再次着地所用的时间。</p>
                  <p>右腿步行周期：从右脚跟着地到右脚跟再次着地所用的时间。</p>
                </li>
                <li>
                  <span><i/><label>单腿支撑时间</label></span>
                  <p>单腿支撑时间比：指左、右腿单支撑时间的差异性，其值在0~1之间，越接近1，表示左、右腿单支撑时间越相近，越平衡。</p>
                </li>
                <li>
                  <span><i/><label>双腿支撑时间</label></span>
                  <p>离地前/L：指在左腿步行周期中，右脚着地到左脚离地前的时间。</p>
                  <p>触地开始/L：指在左腿步行周期中，左脚刚开始着地到右脚离地前的时间。</p>
                  <p>离地前/R：指在右腿步行周期中，左脚着地到右脚离地前的时间。</p>
                  <p>触地开始/R：指在右腿步行周期中，右脚刚开始着地到左脚离地前的时间。</p>
                  <p>离地前/L与触地开始/R的时间相等，离地前/R与触地开始/L的时间相等。</p>
                </li>
                <li>
                  <span><i/><label>评估指标</label></span>
                  <p>双腿对称性：表示双腿步态的综合差异性，其值越小越好，一般情况下，认为在10%以下就可以表示步态对称性很好了。</p>
                  <p>单腿步态稳定性/L：指左腿支撑相在左腿步行周期中所占比重，其值在0-1之间，正常人一般约为0.6左右。</p>
                  <p>单腿步态稳定性/R：指右腿支撑相在右腿步行周期中所占比重，其值在0-1之间，正常人一般约为0.6左右。</p>
                  <p>下肢负重：指左、右脚单腿支撑时间内传感器所检测到的压力均值。</p>
                </li>
              </ul>
            </div>
          </div>          
        </Carousel>
        </div>
      </Container>
    );
  }
}
function mapStateToProps(state) {
  return {};
}

export default connect(
  mapStateToProps,
  {}
)(HelpScreen);
