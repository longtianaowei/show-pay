import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'

let widgetWindow: BrowserWindow | null = null

function createWidgetWindow(): void {
  if (widgetWindow) {
    widgetWindow.focus()
    return
  }
  widgetWindow = new BrowserWindow({
    width: 280,
    height: 120,
    frame: false,
    transparent: true,
    alwaysOnTop: false,
    skipTaskbar: false,
    resizable: false,
    maximizable: false,
    fullscreenable: false,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    widgetWindow.loadURL(process.env['ELECTRON_RENDERER_URL'] + '/#/widget')
  } else {
    widgetWindow.loadFile(join(__dirname, '../renderer/index.html'), { hash: '/widget' })
  }
  widgetWindow.on('closed', () => {
    widgetWindow = null
  })
}

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900, // 窗口宽度为900像素
    height: 700, // 窗口高度为670像素
    show: false, // 初始时不显示窗口，等渲染完成后再显示
    autoHideMenuBar: true, // 自动隐藏菜单栏
    ...(process.platform === 'linux' ? { icon } : {}), // 如果是Linux平台，设置窗口图标
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'), // 预加载脚本路径
      sandbox: false // 关闭沙盒模式，允许Node.js API
    },
    frame: false, // 无边框窗口（自定义窗口样式）
    transparent: true, // 窗口背景透明
    alwaysOnTop: false, // 窗口始终置顶
    skipTaskbar: false, // 不在任务栏显示
    fullscreenable: false, // 禁止全屏
    resizable: false,
    maximizable: true, // 禁止最大化
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  // 监听窗口控制事件
  ipcMain.on('window-minimize', () => {
    mainWindow.minimize()
  })

  ipcMain.on('window-close', () => {
    mainWindow.close()
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

ipcMain.on('open-widget-window', () => {
  createWidgetWindow()
})

ipcMain.on('salary-data-update', (_event, data) => {
  if (widgetWindow) {
    widgetWindow.webContents.send('salary-data', data)
  }
})
