class Pomodoro {
  constructor(mainWindow) {
    this.mainWindow = mainWindow
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
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.mainWindow.webContents.send('pomodoro:update', this.remainingTimeObject())
    }
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
