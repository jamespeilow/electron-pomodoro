import { app, shell, BrowserWindow, ipcMain, Tray, Menu, nativeImage, Notification } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import createPomodoro from '../components/pomodoro'

let pomodoroTimer
/**
 * @type {Tray | null}
 */
let tray
/**
 * @type {BrowserWindow | null}
 */
let mainWindow

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 400,
    height: 700,
    show: false,
    minWidth: 400,
    minHeight: 700,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
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
}

function createTray() {
  const trayIcon = nativeImage.createEmpty()
  tray = new Tray(trayIcon)

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Start',
      type: 'normal',
      click: () => {
        pomodoroTimer.start()
      }
    },
    {
      label: 'Pause',
      type: 'normal',
      click: () => {
        pomodoroTimer.pause()
      }
    },
    {
      label: 'Reset',
      type: 'normal',
      click: () => {
        pomodoroTimer.reset()
      }
    }
  ])

  tray.setToolTip('Pomodoro')
  tray.setTitle('25:00')
  tray.setContextMenu(contextMenu)
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

  // Initialize pomodoro
  pomodoroTimer = createPomodoro()

  createWindow()
  createTray()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })

  // Handle IPC events
  ipcMain.on('pomodoro:start', () => pomodoroTimer.start())
  ipcMain.on('pomodoro:pause', () => pomodoroTimer.pause())
  ipcMain.on('pomodoro:reset', () => pomodoroTimer.reset())

  // Handle Pomodoro Events
  pomodoroTimer.on('update', (payload) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('pomodoro:update', payload)
    }

    if (tray) {
      tray.setTitle(payload.formatted)
    }
  })

  pomodoroTimer.on('end', (payload) => {
    console.log('pomodoro ended')

    if (Notification.isSupported()) {
      const notification = new Notification({
        title: 'Pomodoro Complete! ✅',
        body: 'Great job! Time for a break.',
        sound: 'Glass.aiff'
      })
      notification.show()
    }

    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('pomodoro:end', payload)
    }
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

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
