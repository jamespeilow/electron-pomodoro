import { EventEmitter } from 'events'
class Pomodoro extends EventEmitter {
  constructor() {
    super()
    this.settings = {
      focusDuration: 25,
      shortBreakDuration: 5,
      longBreakDuration: 15
    }
    this.timerConfig = {
      focus: {
        type: 'focus',
        name: 'Focus',
        count: 0,
        duration: this.settings.focusDuration,
        roundProgress: [0, 0, 0, 0]
      },
      shortBreak: {
        type: 'break',
        name: 'Short Break',
        duration: this.settings.shortBreakDuration,
        count: 0
      },
      longBreak: {
        type: 'break',
        name: 'Long Break',
        duration: this.settings.longBreakDuration,
        count: 0
      }
    }

    this.updateTimerConfig()

    this.currentMode = this.timerConfig.focus
    this.nextMode = this.timerConfig.shortBreak
    this.defaultTime = 25 * 60
    this.remainingTime = this.currentMode.duration * 60
    this.interval = null
    this.state = 'paused'
    this.updateUI()
  }

  updateTimerConfig() {
    this.timerConfig.focus.duration = this.settings.focusDuration
    this.timerConfig.shortBreak.duration = this.settings.shortBreakDuration
    this.timerConfig.longBreak.duration = this.settings.longBreakDuration
  }

  setNextTimer() {
    this.currentMode.count++
    this.currentMode = this.nextMode
    this.nextMode = this.getNextMode()
  }

  getNextMode() {
    if (this.currentMode !== this.timerConfig.focus) {
      return this.timerConfig.focus
    }

    if ((this.timerConfig.focus.count + 1) % 4 === 0 && this.timerConfig.focus.count !== 0) {
      return this.timerConfig.longBreak
    }

    return this.timerConfig.shortBreak
  }

  start() {
    if (this.interval) {
      return
    }

    this.state = 'running'
    this.emit('stateChange', this.state)

    this.interval = setInterval(() => {
      if (this.remainingTime > 0) {
        this.remainingTime--
        this.updateUI()
      } else {
        this.handleEnd()
        this.reset()
      }
    }, 1000)
  }

  pause() {
    if (this.interval) {
      this.state = 'paused'
      clearInterval(this.interval)
      this.interval = null
      this.emit('stateChange', this.state)
    }
  }

  reset() {
    this.pause()
    this.remainingTime = this.currentMode.duration * 60
    this.updateUI()
  }

  remainingTimeObject() {
    const minutes = Math.floor(this.remainingTime / 60)
    const seconds = this.remainingTime % 60

    return {
      minutes,
      seconds,
      remainingTime: this.remainingTime,
      totalTime: this.currentMode.duration * 60
    }
  }

  updateUI() {
    const payload = {
      data: this.remainingTimeObject(),
      formatted: this.formatTime(),
      modes: this.timerConfig,
      state: this.state
    }
    this.emit('update', payload)
  }

  formatTime() {
    const { minutes, seconds } = this.remainingTimeObject()

    return `${minutes.toString().padStart(2, 0)}:${seconds.toString().padStart(2, 0)}`
  }

  handleEnd() {
    this.emit('end', {
      currentMode: this.currentMode,
      nextMode: this.nextMode
    })
    this.setNextTimer()
  }

  updateSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings }
    this.updateTimerConfig()

    // If timer is paused, update the remaining time for the current mode
    if (this.state === 'paused') {
      this.remainingTime = this.currentMode.duration * 60
    }

    this.updateUI()
  }
}

function createPomodoro(mainWindow) {
  return new Pomodoro(mainWindow)
}

export default createPomodoro
