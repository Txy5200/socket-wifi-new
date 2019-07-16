import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
  GaitCycleItem,
  EllipseChart,
  GaitCycleDivTitle,
  GaitCycleItemTop,
  GaitCycleItemBottom
} from '../components';
import {Button} from 'antd';
import { getUrlByPress } from '../helper/util';

class PressAnalysis extends Component {
  constructor(props) {
    super(props);
    const { gaitInfo = {} } = this.props;
    let {
      gaitCycle_L = 0,
      gaitCycle_R = 0,
      singleStance_L = 0,
      singleStance_R = 0,
      doubleStance_land_L = 0,
      doubleStance_land_R = 0,
      doubleStance_leave_L = 0,
      doubleStance_leave_R = 0,
      singleASI = 0,
      swing_L = null,
      swing_R = null,
      singleStability_L = 0,
      singleStability_R = 0,
      pressure_L = [],
      pressure_R = []
    } = gaitInfo;

    gaitCycle_L = gaitCycle_L.toFixed(0);
    gaitCycle_R = gaitCycle_R.toFixed(0);
    singleStance_L = singleStance_L.toFixed(0);
    singleStance_R = singleStance_R.toFixed(0);
    doubleStance_land_L = doubleStance_land_L.toFixed(0) * 1;
    doubleStance_land_R = doubleStance_land_R.toFixed(0) * 1;
    doubleStance_leave_L = doubleStance_leave_L.toFixed(0) * 1;
    doubleStance_leave_R = doubleStance_leave_R.toFixed(0) * 1;
    singleASI = (singleASI * 100).toFixed(2);
    singleStability_L = (singleStability_L * 100).toFixed(2);
    singleStability_R = (singleStability_R * 100).toFixed(2);
    swing_L = swing_L != null ? swing_L.toFixed(0) : singleStance_R;
    swing_R = swing_R != null ? swing_R.toFixed(0) : singleStance_L;

    const leftPressArray = getUrlByPress(pressure_L, 'left');
    const rightPressArray = getUrlByPress(pressure_R, 'right');
    const { footPercent: leftPressPercentArray, total: leftPressTotal } = this.getFootPercent(pressure_L);
    const { footPercent: rightPressPercentArray, total: rightPressTotal } = this.getFootPercent(pressure_R);

    let pressTotal = leftPressTotal * 1 + rightPressTotal * 1;
    let leftPressTotalPercent = pressTotal ? (leftPressTotal / pressTotal) * 100 : 0;
    let rightPressTotalPercent = 100 - leftPressTotalPercent;
    leftPressTotalPercent = leftPressTotalPercent.toFixed(2);
    rightPressTotalPercent = rightPressTotalPercent.toFixed(2);

    let doubleStance_land_L_width = gaitCycle_L != 0 ? Math.round((doubleStance_land_L / gaitCycle_L) * 100) : 0;
    let singleStance_L_width = gaitCycle_L != 0 ? Math.round((singleStance_L / gaitCycle_L) * 100) : 0;
    let doubleStance_leave_L_width = gaitCycle_L != 0 ? Math.round((doubleStance_leave_L / gaitCycle_L) * 100) : 0;
    let swing_phase_L_width = gaitCycle_L != 0 ? 100 - doubleStance_land_L_width - singleStance_L_width - doubleStance_leave_L_width : 0;

    let doubleStance_land_R_width = gaitCycle_R != 0 ? Math.round((doubleStance_land_R / gaitCycle_R) * 100) : 0;
    let singleStance_R_width = gaitCycle_R != 0 ? Math.round((singleStance_R / gaitCycle_R) * 100) : 0;
    let doubleStance_leave_R_width = gaitCycle_R != 0 ? Math.round((doubleStance_leave_R / gaitCycle_R) * 100) : 0;
    let swing_phase_R_width = gaitCycle_R != 0 ? 100 - doubleStance_land_R_width - singleStance_R_width - doubleStance_leave_R_width : 0;

    let singleProportion = singleStance_R != 0 ? (singleStance_L / singleStance_R).toFixed(4) : '0.0000';
    let doubleProportion = doubleStance_leave_R + doubleStance_land_R != 0 ? ((doubleStance_leave_L + doubleStance_land_L) / (doubleStance_leave_R + doubleStance_land_R)).toFixed(4) : '0.0000';

    this.state = {
      leftPressArray, // 下肢负重左脚图数值
      rightPressArray, // 下肢负重右脚图数值
      leftPressPercentArray, // 下肢负重左脚图百分比
      rightPressPercentArray, // 下肢负重右脚图百分比
      leftPressTotalPercent, // 下肢负重左脚图总百分比
      rightPressTotalPercent, // 下肢负重右脚图总百分比
      leftPressTotal, // 下肢负重左脚总数值
      rightPressTotal, // 下肢负重右脚总百分比

      doubleStance_land_L_width, // 双腿支撑触地开始L div宽度
      singleStance_L_width, // 单腿支撑L div宽度
      doubleStance_leave_L_width, // 双腿支撑离地L div宽度
      swing_phase_L_width, // 摆动相L div宽度
      swing_L, // 摆动相值

      doubleStance_land_R_width, // 双腿支撑触地开始R div宽度
      singleStance_R_width, // 单腿支撑R div宽度
      doubleStance_leave_R_width, // 双腿支撑离地R div宽度
      swing_phase_R_width, // 摆动相R div宽度
      swing_R, // 摆动相值

      singleProportion, // 单腿支撑时间比
      doubleProportion, // 双腿支撑时间比

      singleStance_L, // 左脚单独着地的时间(右脚不着地),右掌离地到右跟着地
      singleStance_R, // 右脚单独着地的时间(左脚不着地),左掌离地到左跟着地
      gaitCycle_L, // 左腿步态周期
      gaitCycle_R, // 右腿步态周期
      // gaitCycle_L: Math.round(doubleStance_land_L) + Math.round(singleStance_L) + Math.round(doubleStance_leave_L) + Math.round(singleStance_R), // 左腿步态周期
      // gaitCycle_R: Math.round(doubleStance_land_R) + Math.round(singleStance_R) + Math.round(doubleStance_leave_R) + Math.round(singleStance_L), // 右腿步态周期
      doubleStance_land_L, // 双腿支撑触地开始 /L：左跟着地到右掌离地
      doubleStance_land_R, // 双腿支撑触地开始 /R：右跟着地到左掌离地
      doubleStance_leave_L, // 双腿支撑时间(离地前)/L：右跟着地到左掌离地
      doubleStance_leave_R, // 双腿支撑时间(离地前)/R：左跟着地到右掌离地
      singleStability_L, // 单腿步态稳定性/L
      singleStability_R, // 单腿步态稳定性/R
      // singleStability_L: gaitCycle_L ? (((gaitCycle_L - singleStance_R) / gaitCycle_L) * 100).toFixed(2) : '0.00', // 单腿步态稳定性/L
      // singleStability_R: gaitCycle_R ? (((gaitCycle_R - singleStance_L) / gaitCycle_R) * 100).toFixed(2) : '0.00', // 单腿步态稳定性/R
      singleASI // 双腿绝对对称性ASI
    };
  }

  // 计算下肢负重压力比
  getFootPercent(array) {
    if (!array.length) return { footPercent: [0, 0, 0], total: 0 };
    let total = array.reduce((a, b) => {
      return a + b;
    });
    let footPercent = [];

    for (let i = 0; i < array.length; i++) {
      if (total) {
        if (i === array.length - 1) {
          let currentPercent = footPercent.reduce((a, b) => {
            return a + b;
          });
          footPercent.push(100 - currentPercent);
        } else {
          footPercent.push(Math.round((array[i] / total) * 100));
        }
      } else {
        footPercent.push(0);
      }
    }

    return { footPercent, total: total.toFixed(2) };
  }

  renderTop() {
    let {
      gaitCycle_L,
      swing_L,
      swing_phase_L_width,
      doubleStance_land_L_width,
      doubleStance_land_L,
      singleStance_L_width,
      singleStance_L,
      doubleStance_leave_L_width,
      doubleStance_leave_L,
      gaitCycle_R,
      swing_R,
      swing_phase_R_width,
      doubleStance_land_R_width,
      doubleStance_land_R,
      singleStance_R_width,
      singleStance_R,
      doubleStance_leave_R_width,
      doubleStance_leave_R
    } = this.state;
    const { exportState } = this.props;
    return (
      <div className={'press_analysis_top'}>
        <div className={'content_gait_cycle'}>
          <div className={'gait_cycle'}>
            <GaitCycleDivTitle
              title={['左腿步行周期', '(Gait Cycle-Left)']}
              value={gaitCycle_L}
              popoverContent={null}
              popoverTitle={'左腿步行周期'}
              color={'#3aadfd'}
            />
            <div className={'gait_cycle_item'}>
              {/* <GaitCycleItemTop standPhaseValue={gaitCycle_L - singleStance_R} swingPhaseValue={singleStance_R} width={`${swing_phase_L_width}%`} /> */}
              <GaitCycleItemTop
                standPhaseValue={gaitCycle_L - swing_L}
                swingPhaseValue={swing_L}
                width={`${swing_phase_L_width}%`}
              />
              <div className={'gait_cycle_item_middle'}>
                <GaitCycleItem
                  title={'双腿支撑触地开始'}
                  widthValue={`${doubleStance_land_L_width}%`}
                  width={'20%'}
                  color={'#ffcaca'}
                  value={doubleStance_land_L}
                />
                <GaitCycleItem
                  title={'单腿支撑时间'}
                  widthValue={`${singleStance_L_width}%`}
                  width={'20%'}
                  color={'#ffc8f4'}
                  value={singleStance_L}
                />
                <GaitCycleItem
                  title={'双腿支撑离地前'}
                  widthValue={`${doubleStance_leave_L_width}%`}
                  width={'20%'}
                  color={'#bbd4fc'}
                  value={doubleStance_leave_L}
                />
                <GaitCycleItem
                  widthValue={`${swing_phase_L_width}%`}
                  width={'40%'}
                  color={'#7798fc'}
                  showText={false}
                />
              </div>
              <div className={'gait_cycle_item_bottom'}>
                <GaitCycleItemBottom
                  title={'双腿支撑触地开始'}
                  color={'#ffcaca'}
                  width={'20%'}
                  value={doubleStance_land_L}
                />
                <GaitCycleItemBottom
                  title={'单腿支撑时间'}
                  color={'#ffc8f4'}
                  width={'20%'}
                  value={singleStance_L}
                />
                <GaitCycleItemBottom
                  title={'双腿支撑离地前'}
                  color={'#bbd4fc'}
                  width={'20%'}
                  value={doubleStance_leave_L}
                />
                <GaitCycleItemBottom />
              </div>
            </div>
          </div>
          <div className={'gait_cycle'}>
            <GaitCycleDivTitle
              title={['右腿步行周期', '(Gait Cycle-Right)']}
              value={gaitCycle_R}
              popoverContent={null}
              popoverTitle={'右腿步行周期'}
              color={'#3aadfd'}
            />
            <div className={'gait_cycle_item'}>
              {/* <GaitCycleItemTop standPhaseValue={gaitCycle_R - singleStance_L} swingPhaseValue={singleStance_L} width={`${swing_phase_R_width}%`} /> */}
              <GaitCycleItemTop
                standPhaseValue={gaitCycle_R - swing_R} 
                wingPhaseValue={swing_R}
                width={`${swing_phase_R_width}%`}
              />
              <div className={'gait_cycle_item_middle'}>
                <GaitCycleItem
                  title={'双腿支撑触地开始'}
                  widthValue={`${doubleStance_land_R_width}%`}
                  width={'20%'}
                  color={'#ffcaca'}
                  value={doubleStance_land_R}
                />
                <GaitCycleItem
                  title={'单腿支撑时间'}
                  widthValue={`${singleStance_R_width}%`}
                  width={'20%'}
                  color={'#ffc8f4'}
                  value={singleStance_R}
                />
                <GaitCycleItem
                  title={'双腿支撑离地前'}
                  widthValue={`${doubleStance_leave_R_width}%`}
                  width={'20%'}
                  color={'#bbd4fc'}
                  value={doubleStance_leave_R}
                />
                <GaitCycleItem
                  widthValue={`${swing_phase_R_width}%`}
                  width={'40%'}
                  color={'#7798fc'}
                  showText={false}
                />
              </div>
              <div className={'gait_cycle_item_bottom'}>
                <GaitCycleItemBottom
                  title={'双腿支撑触地开始'}
                  color={'#ffcaca'}
                  width={'20%'}
                  value={doubleStance_land_R}
                />
                <GaitCycleItemBottom
                  title={'单腿支撑时间'}
                  color={'#ffc8f4'}
                  width={'20%'}
                  value={singleStance_R}
                />
                <GaitCycleItemBottom
                  title={'双腿支撑离地前'}
                  color={'#bbd4fc'}
                  width={'20%'}
                  value={doubleStance_leave_R}
                />
                <GaitCycleItemBottom />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  renderBottom() {
    const {
      singleASI,
      singleASIContent,
      doubleProportion,
      doubleProportionContent,
      singleProportion,
      singleProportionContent,
      singleStability_L,
      singleStabilityLContent,
      singleStability_R,
      singleStabilityRContent
    } = this.state
    return (
      <div className={'press_analysis_bottom'}>
        <div className={'report_content_bottom'}>
          <EllipseChart
            title={['双腿对称性', '(ASI/%)']}
            value={`${singleASI}%`}
            referenceValue={'参考值0-10%'}
            popoverContent={singleASIContent}
            popoverTitle={'双腿对称性ASI'}
          />
          <EllipseChart
            title={['双腿支撑时间比', '(L/R)']}
            value={doubleProportion}
            referenceValue={'参考值1'}
            popoverContent={doubleProportionContent}
            popoverTitle={'双腿支撑时间比'}
          />
          <EllipseChart
            title={['单腿支撑时间比', '(L/R)']}
            value={singleProportion}
            referenceValue={'参考值1'}
            popoverContent={singleProportionContent}
            popoverTitle={'单腿支撑时间比'}
          />
          <EllipseChart
            title={['左腿步态稳定性', '(Gait Stability-Left)']}
            value={`${singleStability_L}%`}
            referenceValue={'参考值60%'}
            popoverContent={singleStabilityLContent}
            popoverTitle={'单腿步态稳定性-左'}
          />
          <EllipseChart
            title={['右腿步态稳定性', '(Gait  Stability-Right)']}
            value={`${singleStability_R}%`}
            referenceValue={'参考值60%'}
            popoverContent={singleStabilityRContent}
            popoverTitle={'单腿步态稳定性-右'}
          />
        </div>
      </div>
    )
  }

  render() {
    return (
      <div className={'press_analysis_page'}>
        <div>
          <Button
            onClick={() => this.props.back()}
          >返回</Button>
        </div>
        {this.renderTop()}
        {this.renderBottom()}
      </div>
    )
  }

}
function mapStateToProps(state) {
  return {
    currentRecordId: state.globalSource.currentRecordId,
    user: state.user.user,
    gaitInfo: state.globalSource.currentGaitInfo
  };
}

export default connect(
  mapStateToProps,
  {
    // openSerialport,
    // closeSerialport,
    // setCurrentRecordID,
    // deleteHistoryRecord,
    // setUserInfo
  }
)(PressAnalysis);