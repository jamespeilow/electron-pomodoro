function init() {
  window.addEventListener('DOMContentLoaded', () => {
    initPomodoro()
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
    console.log('onTimerUpdate')

    updateUI(payload)
  })

  window.api.pomodoro.onSessionEnd((payload) => {
    console.log('onSessionEnd')

    const nextModeType = payload.nextMode.type
    app.dataset.mode = nextModeType
  })
}

function updateUI(timeData) {
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

init()
