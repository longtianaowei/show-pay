import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// 自定义API对象，供渲染进程调用窗口控制相关功能
const api = {
  // 最小化窗口
  minimizeWindow: () => {
    ipcRenderer.send('window-minimize')
  },
  // 关闭窗口
  closeWindow: () => {
    ipcRenderer.send('window-close')
  }
}

// 判断是否启用了上下文隔离（contextIsolation）
// 如果启用，则通过contextBridge安全地暴露API到渲染进程
if (process.contextIsolated) {
  try {
    // 暴露Electron官方API
    contextBridge.exposeInMainWorld('electron', electronAPI)
    // 暴露自定义窗口控制API
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    // 捕获并打印暴露API时的异常
    console.error(error)
  }
} else {
  // 如果未启用上下文隔离，直接挂载到window全局对象
  // @ts-ignore (已在dts中声明)
  window.electron = electronAPI
  // @ts-ignore (已在dts中声明)
  window.api = api
}
