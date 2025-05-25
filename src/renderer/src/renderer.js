function init() {
  window.addEventListener('DOMContentLoaded', () => {
    initPomodoro()
    initSettings()
  })
}

function initPomodoro() {
  const app = document.querySelector('#app')
  const pauseButton = document.querySelector('button[data-action=pause]')
  const startButton = document.querySelector('button[data-action=start]')
  const resetButton = document.querySelector('button[data-action=reset]')

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
    updateUI(payload)
  })

  window.api.pomodoro.onStateChange((payload) => {
    app.dataset.state = payload
  })

  window.api.pomodoro.onSessionEnd((payload) => {
    console.log('onSessionEnd')

    const nextModeType = payload.nextMode.type
    app.dataset.mode = nextModeType
  })

  window.api.pomodoro.getLatestUI()
}

function updateUI(timeData) {
  const app = document.querySelector('#app')
  app.dataset.state = timeData.state
  const percentageNumber =
    (timeData.data.totalTime - timeData.data.remainingTime) / timeData.data.totalTime
  const timerOutput = document.querySelector('.timer')
  timerOutput.innerHTML = timeData.formatted

  const timerCircle = document.querySelector('.clock__progress-value')
  const timerCircleCircumference = timerCircle.getTotalLength()
  timerCircle.style.strokeDasharray = timerCircleCircumference
  timerCircle.style.strokeDashoffset =
    timerCircleCircumference - percentageNumber * timerCircleCircumference

  const timerDot = document.querySelector('.clock__progress-circle')
  timerDot.style.transform = `rotate(${percentageNumber}turn)`
}

function initSettings() {
  // Settings Panel Logic
  const settingsToggle = document.querySelector('.settings-toggle')
  const settingsPanel = document.querySelector('.settings-panel')
  const settingsForm = document.querySelector('.settings-form')

  settingsToggle.addEventListener('click', () => {
    settingsPanel.classList.toggle('active')
  })

  settingsForm.addEventListener('submit', (event) => {
    event.preventDefault()
    const settings = {
      focusDuration: parseInt(settingsForm.querySelector('[name="focusDuration"]').value, 10),
      shortBreakDuration: parseInt(
        settingsForm.querySelector('[name="shortBreakDuration"]').value,
        10
      ),
      longBreakDuration: parseInt(
        settingsForm.querySelector('[name="longBreakDuration"]').value,
        10
      )
    }

    console.log('Updating settings:', settings)

    window.api.settings.update(settings)
    settingsPanel.classList.remove('active')
  })

  // Listen for settings updates
  window.api.settings.onSettingsUpdated((settings) => {
    Object.entries(settings).forEach(([key, value]) => {
      const input = settingsForm.querySelector(`[name="${key}"]`)
      if (input) {
        input.value = value
      }
    })
  })
}

init()
