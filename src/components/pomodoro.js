class Pomodoro {
  constructor() {
    this.defaultTime = 25 * 60
    this.remainingTime = this.defaultTime
    this.interval = null
  }

  start() {
    if (this.interval) {
      return
    }

    this.interval = setInterval(() => {
      if (this.remainingTime > 0) {
        this.remainingTime--
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
  }

  remainingTimeToObject() {
    const minutes = Math.floor(this.remainingTime / 60)
    const seconds = this.remainingTime % 60

    return {
      minutes,
      seconds
    }
  }

  formatTime() {
    const { minutes, seconds } = this.remainingTimeToObject()

    return `${minutes.toString().padStart(2, 0)}:${seconds.toString().padStart(2, 0)}`
  }
}

function createPomodoro() {
  return new Pomodoro()
}

export default createPomodoro
