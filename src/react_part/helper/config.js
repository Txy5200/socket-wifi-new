// 主题颜色
const MAINCOLOR = '#2A4680'

const MENUS = [
  {
    name: '检测',
    id: 1,
    parentID: 0,
    icon: 'icon-inspection',
    icon_click: 'icon-inspection-blue',
    url: '/inspection'
  },
  {
    name: '数据对比',
    id: 2,
    parentID: 0,
    icon: 'icon-data',
    icon_click: 'icon-data-blue',
    url: '/dataComparison'
  },
  {
    name: '历史记录',
    id: 3,
    parentID: 0,
    icon: 'icon-history',
    icon_click: 'icon-history-blue',
    url: '/history'
  },
  {
    name: '设置',
    id: 4,
    parentID: 0,
    icon: 'icon-setting',
    icon_click: 'icon-setting-blue',
    url: '/setting'
  },
  {
    name: '帮助',
    id: 5,
    parentID: 0,
    icon: 'icon-help',
    icon_click: 'icon-help-blue',
    url: '/help'
  }
]

export { MAINCOLOR, MENUS }