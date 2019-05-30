
const HEADER_STATE = 'HEADER_STATE'
const SETRECORDID = 'SETRECORDID'
const SETGAITINFO = 'SETGAITINFO'
const SETCOPINFO = 'SETCOPINFO'
const SETCOPDRAW = 'SETCOPDRAW'
const SETFILENAME = 'SETFILENAME'
const SETEXPORTSTATE = 'SETEXPORTSTATE'
const SETDATACOMPARESTATE = 'SETDATACOMPARESTATE'
const SETHISTORYSTATE = 'SETHISTORYSTATE'

const initState = {
  //全局点击状态 报告回放中点击状态为false
  clickState: true,
  // 是否导出成功
  exportState: undefined,
  //导出文件名
  exportFileName: '',
  //当前recordId
  currentRecordId: '',
  // 当前步态信息
  currentGaitInfo: {},
  // 当前COP信息
  currentCopInfo: [],
  // 当前COP分解曲线图信息
  currentCopDraw: {
    x: [], // Cop-x轴坐标值
    y: [], // Cop-Y轴坐标值
    modulus_value: [], // Cop模值
    modulus_angle: [], // Cop模值角度
    speed: [], // Cop 速度
    speed_angle: [] // Cop 速度角度
  },
  // 数据对比界面参数
  dataCompareState: {
    patient_certificate_no: undefined,
    patient_name: undefined,
    search_times: 10000
  },
  // 历史记录界面参数
  historyState: {
    keyword: undefined,
    page: 1
  }
}

export const globalSource = (state = initState, action = {}) => {
  switch (action.type) {
    case HEADER_STATE:
      return { ...state, clickState: action.clickState }
    case SETEXPORTSTATE:
      return { ...state, exportState: action.exportState }
    case SETFILENAME:
      return { ...state, exportFileName: action.exportFileName }
    case SETRECORDID:
      return { ...state, currentRecordId: action.currentRecordId }
    case SETGAITINFO:
      return { ...state, currentGaitInfo: action.currentGaitInfo }
    case SETCOPINFO:
      return { ...state, currentCopInfo: action.currentCopInfo }
    case SETCOPDRAW:
      return { ...state, currentCopDraw: action.currentCopDraw }
    case SETDATACOMPARESTATE:
      return { ...state, dataCompareState: action.dataCompareState }
    case SETHISTORYSTATE:
      return { ...state, historyState: action.historyState }
    default:
      return state
  }
}

export const setHeaderState = ({clickState}) => dispatch => {
  dispatch({
    type: HEADER_STATE,
    clickState
  })
}

export const setCurrentRecordID = ({currentRecordId}) => dispatch => {
  dispatch({
    type: SETRECORDID,
    currentRecordId
  })
}

export const setGaitInfo = ({currentGaitInfo}) => dispatch => {
  dispatch({
    type: SETGAITINFO,
    currentGaitInfo
  })
}

export const setCopInfo = ({currentCopInfo}) => dispatch => {
  dispatch({
    type: SETCOPINFO,
    currentCopInfo
  })
}

export const setCopDraw = ({currentCopDraw}) => dispatch => {
  dispatch({
    type: SETCOPDRAW,
    currentCopDraw
  })
}

export const setExportFileName = (exportFileName) => dispatch => {
  dispatch({
    type: SETFILENAME,
    exportFileName
  })
}

export const setExportState = (exportState) => dispatch => {
  dispatch({
    type: SETEXPORTSTATE,
    exportState
  })
}

export const setDataCompareState = (dataCompareState) => dispatch => {
  dispatch({
    type: SETDATACOMPARESTATE,
    dataCompareState
  })
}

export const setHistoryState = (historyState) => dispatch => {
  dispatch({
    type: SETHISTORYSTATE,
    historyState
  })
}

