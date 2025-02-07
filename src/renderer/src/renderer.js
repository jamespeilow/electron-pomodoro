function init() {
  window.addEventListener('DOMContentLoaded', () => {
    doAThing()
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
