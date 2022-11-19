window.$ = window.jQuery = require("jquery");
const { ipcRenderer } = require('electron');
const { io } = require("socket.io-client");
const socket = io("http://localhost:3000");
const ipc = ipcRenderer;

minimizeBtn.addEventListener('click', () => ipc.send('minimizeApp', "main"));
closeBtn.addEventListener('click', () => ipc.send("closeAllApp", "main"));

maxResBtnFull.addEventListener('click', () => {
    document.getElementById("maxResBtnFull").style.display = 'none';
    document.getElementById("minResBtnFull_exit").style.display = 'inline-block';

    ipc.send("maximizeRestoreApp", "main");
})

minResBtnFull_exit.addEventListener('click', () => {
    document.getElementById("maxResBtnFull").style.display = 'inline-block';
    document.getElementById("minResBtnFull_exit").style.display = 'none';
    ipc.send("maximizeRestoreApp", "main");
})

// btnTesting.addEventListener("click", () => ipc.send("admin:createWindows"))
// startRobot.addEventListener("click", () => ipc.send("admin:startRobot"));

// untuk pengaturan content
$(".menu-item").click(function(e) {
    var target = $(this).attr("data-bs-target");
    if (target && !$(this).hasClass("active")) {
        $(".menu-item.active").removeClass("active");
        $(".collapse.show").removeClass("show");
        $(this).addClass("active");
        $(target).addClass("show");
    }
})





socket.on("connect", () => {
    console.log(socket.id);
});

