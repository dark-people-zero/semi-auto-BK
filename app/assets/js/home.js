window.$ = window.jQuery = require("jquery");
const { ipcRenderer } = require('electron');
const ipc = ipcRenderer;

minimizeBtn.addEventListener('click', () => ipc.send('minimizeApp', "home"));
closeBtn.addEventListener('click', () => ipc.send("closeAllApp", "home"));

maxResBtnFull.addEventListener('click', () => {
    document.getElementById("maxResBtnFull").style.display = 'none';
    document.getElementById("minResBtnFull_exit").style.display = 'inline-block';

    ipc.send("maximizeRestoreApp", "home");
})

minResBtnFull_exit.addEventListener('click', () => {
    document.getElementById("maxResBtnFull").style.display = 'inline-block';
    document.getElementById("minResBtnFull_exit").style.display = 'none';
    ipc.send("maximizeRestoreApp", "home");
})

$(".bank-container .bank-item").click(function() {
    var type = $(this).data("type");
    ipc.send("show:mainWindows", {type})
})
