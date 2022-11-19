window.ipcRenderer = require('electron').ipcRenderer;
console.log("ada masuk di preload guys spreedshet");

window.ipcRenderer.on("change-bg", (e, m) => {
  console.log(m);
})