import { EventEmitter } from 'events'
class Pomodoro extends EventEmitter {
  constructor() {
    super()
    this.timerDurations = {
      focus: 0.25,
      shortBreak: 0.5,
      longBreak: 0.15
    }
    this.timerModes = {
      focus: {
        type: 'focus',
        name: 'Focus',
        count: 0,
        duration: this.timerDurations.focus,
        roundProgress: [0, 0, 0, 0]
      },
      shortBreak: {
        type: 'break',
        name: 'Short Break',
        duration: this.timerDurations.shortBreak,
        count: 0
      },
      longBreak: {
        type: 'break',
        name: 'Long Break',
        duration: this.timerDurations.longBreak,
        count: 0
      }
    }
    this.currentMode = this.timerModes.focus
    this.nextMode = this.timerModes.shortBreak
    this.defaultTime = 25 * 60
    this.remainingTime = this.currentMode.duration * 60
    this.interval = null
    this.updateUI()
  }

  setNextTimer() {
    this.currentMode.count++
    this.currentMode = this.nextMode
    this.nextMode = this.getNextMode()
  }

  getNextMode() {
    if (this.currentMode !== this.timerModes.focus) {
      return this.timerModes.focus
    }

    if ((this.timerModes.focus.count + 1) % 4 === 0 && this.timerModes.focus.count !== 0) {
      return this.timerModes.longBreak
    }

    return this.timerModes.shortBreak
  }

  start() {
    if (this.interval) {
      return
    }

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
      clearInterval(this.interval)
      this.interval = null
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
      modes: this.timerModes
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
}

function createPomodoro(mainWindow) {
  return new Pomodoro(mainWindow)
}

export default createPomodoro
