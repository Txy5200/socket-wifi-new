import { enableLiveReload } from 'electron-compile'

// 定义全局变量，供页面使用
global.variables = require('./electron_part/global_variables').variables

const { app, BrowserWindow, ipcMain } = require('electron')
const { synchronousMessageCon, asynchronousMessageCon } = require('./electron_part/icpMessage')

if (require('electron-squirrel-startup')) {
  app.quit()
}

// 接收异步消息
ipcMain.on('asynchronous-message', asynchronousMessageCon)
// 接收同步消息
ipcMain.on('synchronous-message', synchronousMessageCon)

// 保持window对象的全局引用,避免JavaScript对象被垃圾回收时,窗口被自动关闭.
let mainWindow
const isDevMode = process.execPath.match(/[\\/]electron/)

if (isDevMode) enableLiveReload({ strategy: 'react-hmr' })

function createWindow() {
  /**
   * 开发中出现了react 与 electron 的 icp 通信问题，解决方法：
   * 在创建浏览器窗口时增加preload属性，让该js有能力在node环境下运行，并将数据绑定到window上，给其他地方的数据使用
   * 参考地址：http://www.zhuyuntao.cn/2018/08/28/%E7%AC%94%E8%AE%B0electron%E5%92%8Ccreate-react-app%E6%9E%84%E5%BB%BA%E5%BA%94%E7%94%A8%E7%9A%84%E9%80%9A%E4%BF%A1%E9%97%AE%E9%A2%98/
   */

  //创建浏览器窗口,宽高自定义具体大小你开心就好
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 855,
    webPreferences: {
      contextIsolation: false,
      javascript: true,
      nodeIntegration: true
    }
  })

  // 加载应用-----  electron-quick-start中默认的加载入口
  // mainWindow.loadFile('index.html')
  mainWindow.loadURL(`file://${__dirname}/index.html`)

  // 加载打包后的react项目
  // mainWindow.loadURL(
  //   url.format({
  //     pathname: path.join(__dirname, './build/index.html'),
  //     protocol: 'file:',
  //     slashes: true
  //   })
  // )

  // // 打开开发者工具，默认不打开
  if (isDevMode) mainWindow.webContents.openDevTools()

  // 关闭window时触发下列事件.
  mainWindow.on('closed', function() {
    mainWindow = null
  })

}

// 当 Electron 完成初始化并准备创建浏览器窗口时调用此方法
app.on('ready', createWindow)

// 所有窗口关闭时退出应用.
app.on('window-all-closed', function() {
  // macOS中除非用户按下 `Cmd + Q` 显式退出,否则应用与菜单栏始终处于活动状态.
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function() {
  // macOS中点击Dock图标时没有已打开的其余应用窗口时,则通常在应用中重建一个窗口
  if (mainWindow === null) {
    createWindow()
  }
})
