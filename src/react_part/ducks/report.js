import { sendSyncMessage, sendAsyncMessage } from '../helper/icp'

const BASIC_REPORT = 'BASIC_REPORT'
const COP_REPORT = 'COP_REPORT'
const PRESS_VIDEO = 'PRESS_VIDEO'
const GAIT_CYCLE = 'GAIT_CYCLE'
const SINGLE_LEG_TIME = 'SINGLE_LEG_TIME'
const DOUBLE_LEG_TIME = 'DOUBLE_LEG_TIME'
const CRURA_WEIGHT = 'CRURA_WEIGHT'

const initState = {
  basic_report_data: [],
  cop_report_data: [],
  press_video_data: [],
  gait_cycle: [],
  single_leg_time_data: [],
  double_leg_time_data: [],
  crura_weight: [],
}

export const report = (state = initState, action = {}) => {
  switch (action.type) {
    case BASIC_REPORT:
      return { ...state, basic_report_data: action.basic_report_data }
    case COP_REPORT:
      return { ...state, cop_report_data: action.cop_report_data }
    case PRESS_VIDEO:
      return { ...state, press_video_data: action.press_video_data }
    case GAIT_CYCLE:
      return { ...state, gait_cycle: action.gait_cycle }
    case SINGLE_LEG_TIME:
      return { ...state, single_leg_time_data: action.single_leg_time_data }
    case DOUBLE_LEG_TIME:
      return { ...state, double_leg_time_data: action.double_leg_time_data }
    case CRURA_WEIGHT:
      return { ...state, crura_weight: action.crura_weight }
    default:
      return state
  }
}

export const getBasicReport = ({certificateNo, name}) => dispatch => {
  try{
    let result = sendSyncMessage('getBasicReport', { name, certificateNo })
    let docs = result.data || []
    if (result && result.code === 200)
      dispatch({
        type: BASIC_REPORT,
        basic_report_data: docs
      })
    return docs
  }catch(e){
    console.log('getBasicReport error', e)
    return e.message
  }
}

export const getCopReport = ({ name, certificateNo }) => dispatch => {
  try{
    let result = sendSyncMessage('getCopReport', { name, certificateNo })
    let docs = result.data || []
    if (result && result.code === 200)
      dispatch({
        type: BASIC_REPORT,
        cop_report_data:docs
      })
    return docs
  }catch(e){
    console.log('getCopReport error', e)
    return e.message
  }
}

export const getPressVideoData = ({ name, certificateNo }) => dispatch => {
  try{
    let result = sendSyncMessage('getPressVideoData', { name, certificateNo })
    let docs = result.data || []
    if (result && result.code === 200)
      dispatch({
        type: PRESS_VIDEO,
        press_video_data:docs
      })
    return docs
  }catch(e){
    console.log('getPressVideoData error', e)
    return e.message
  }
}

// 获取步态周期数据
export const getGaitCycle = ({certificateNo, name}) => dispatch => {
  try{
    let result = sendSyncMessage('getGaitCycle', { name, certificateNo })
    let docs = result.data || []
    if (result && result.code === 200)
      dispatch({
        type: GAIT_CYCLE,
        gait_cycle: docs
      })
    return docs
  }catch(e){
    console.log('getGaitCycle error', e)
    return e.message
  }
}

// 获取单腿支撑时间
export const getSingleLegTime = ({ name, certificateNo }) => dispatch => {
  try{
    let result = sendSyncMessage('getSingleLegTime', { name, certificateNo })
    let docs = result.data || []
    if (result && result.code === 200)
      dispatch({
        type: SINGLE_LEG_TIME,
        single_leg_time_data:docs
      })
    return docs
  }catch(e){
    console.log('getSingleLegTime error', e)
    return e.message
  }
}

// 获取双腿支撑时间
export const getDoubleLegTime = ({ name, certificateNo }) => dispatch => {
  try{
    let result = sendSyncMessage('getDoubleLegTime', { name, certificateNo })
    let docs = result.data || []
    if (result && result.code === 200)
      dispatch({
        type: DOUBLE_LEG_TIME,
        double_leg_time_data:docs
      })
    return docs
  }catch(e){
    console.log('getDoubleLegTime error', e)
    return e.message
  }
}

// 获取下肢负重
export const getCruraWeight = ({ name, certificateNo }) => dispatch => {
  try{
    let result = sendSyncMessage('getCruraWeight', { name, certificateNo })
    let docs = result.data || []
    if (result && result.code === 200)
      dispatch({
        type: CRURA_WEIGHT,
        crura_weight:docs
      })
    return docs
  }catch(e){
    console.log('getCruraWeight error', e)
    return e.message
  }
}

// 导出PDF
export const exportPDF = (pdfPath) => async dispatch => {
  sendAsyncMessage('exportToPDF',{pdfPath})
  // try{
  //   let result = await sendSyncMessage('exportToPDF',{pdfPath})
  //   console.log('exportPDF======>', result)
  // }catch(e){
  //   console.log('exportPDF error', e)
  //   return e.message
  // }
}
