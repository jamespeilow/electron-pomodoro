function init() {
  window.addEventListener('DOMContentLoaded', () => {
    doAThing()

    initPomodoro()
  })
}

function initPomodoro() {
  const app = document.querySelector('#app')
  const pauseButton = document.querySelector('button[data-action=pause]')
  const startButton = document.querySelector('button[data-action=start]')
  const resetButton = document.querySelector('button[data-action=reset]')
  const timerOutput = document.querySelector('.timer')

  pauseButton.addEventListener('click', () => {
    window.api.pomodoro.pause()
  })
  startButton.addEventListener('click', () => {
    window.api.pomodoro.start()
  })
  resetButton.addEventListener('click', () => {
    window.api.pomodoro.reset()
  })

  window.api.pomodoro.onTimerUpdate((payload) => {
    console.log('onTimerUpdate')

    timerOutput.innerHTML = payload.formatted
  })

  window.api.pomodoro.onSessionEnd((payload) => {
    console.log('onSessionEnd')

    const nextModeType = payload.nextMode.type
    app.dataset.mode = nextModeType
  })
}

function doAThing() {
  const versions = window.versions
  replaceText('.electron-version', `Electron v${versions.electron()}`)
  replaceText('.chrome-version', `Chromium v${versions.chrome()}`)
  replaceText('.node-version', `Node v${versions.node()}`)

  const ipcHandlerBtn = document.getElementById('ipcHandler')
  ipcHandlerBtn?.addEventListener('click', () => {
    window.ipcTest.ping()
  })
}

function replaceText(selector, text) {
  const element = document.querySelector(selector)
  if (element) {
    element.innerText = text
  }
}

init()
