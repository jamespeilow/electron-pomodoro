import { EventEmitter } from 'events'
class Pomodoro extends EventEmitter {
  constructor() {
    super()
    this.defaultTime = 25 * 60
    this.remainingTime = this.defaultTime
    this.interval = null
    this.updateUI()
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
    this.remainingTime = this.defaultTime
    this.updateUI()
  }

  remainingTimeObject() {
    const minutes = Math.floor(this.remainingTime / 60)
    const seconds = this.remainingTime % 60

    return {
      minutes,
      seconds
    }
  }

  updateUI() {
    const payload = {
      data: this.remainingTimeObject(),
      formatted: this.formatTime()
    }
    this.emit('update', payload)
  }

  formatTime() {
    const { minutes, seconds } = this.remainingTimeObject()

    return `${minutes.toString().padStart(2, 0)}:${seconds.toString().padStart(2, 0)}`
  }
}

function createPomodoro(mainWindow) {
  return new Pomodoro(mainWindow)
}

export default createPomodoro
