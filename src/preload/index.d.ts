interface ElectronAPI {
  ipcRenderer: Electron.IpcRenderer
  readonly versions: Readonly<NodeJS.ProcessVersions>
}

interface WindowControlAPI {
  minimizeWindow: () => void
  closeWindow: () => void
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: WindowControlAPI
  }
}

export { }
