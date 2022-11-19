window.ipcRenderer = require('electron').ipcRenderer;
console.log("ada masuk di preload guys bca bos q");

window.ipcRenderer.on("change-bg", (e, m) => {
  console.log(m);
})