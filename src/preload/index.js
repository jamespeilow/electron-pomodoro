import { contextBridge, ipcRenderer } from 'electron'

// Custom APIs for renderer
const api = {
  pomodoro: {
    start: () => ipcRenderer.send('pomodoro:start'),
    pause: () => ipcRenderer.send('pomodoro:pause'),
    reset: () => ipcRenderer.send('pomodoro:reset'),
    onTimerUpdate: (callback) => {
      ipcRenderer.on('pomodoro:update', (_event, payload) => {
        callback(payload)
      })
    },
    onStateChange: (callback) => {
      ipcRenderer.on('pomodoro:stateChange', (_event, payload) => {
        callback(payload)
      })
    },
    onSessionEnd: (callback) => {
      ipcRenderer.on('pomodoro:end', (_event, payload) => {
        callback(payload)
      })
    },
    getLatestUI: () => ipcRenderer.send('pomodoro:getLatestUI')
  },
  settings: {
    update: (settings) => ipcRenderer.send('settings:update', settings),
    onSettingsUpdated: (callback) => {
      ipcRenderer.on('settings:updated', (_event, settings) => {
        callback(settings)
      })
    }
  }
}
// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('versions', {
      node: () => process.versions.node,
      chrome: () => process.versions.chrome,
      electron: () => process.versions.electron
    })
    contextBridge.exposeInMainWorld('ipcTest', {
      ping: () => ipcRenderer.send('ping')
    })
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.versions = {
    node: () => process.versions.node,
    chrome: () => process.versions.chrome,
    electron: () => process.versions.electron
  }
  // @ts-ignore (define in dts)
  window.api = api
}
