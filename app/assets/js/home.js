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

const ListBank = ipc.sendSync("config:listBank");

ListBank.forEach(e => {
    if (e.type == 'inet') {
        $("#inetBanking .bank-container").append($(`
            <li>
                <div class="bank-item ${e.code}" data-type="${e.code}">
                    <img src="${e.logo}" class="rounded">
                </div>
            </li>
        `));
    }
    if (e.type == 'mobile') {
        $("#mobileBanking .bank-container").append($(`
            <li>
                <div class="bank-item ${e.code}" data-type="${e.code}">
                    <img src="${e.logo}" class="rounded">
                </div>
            </li>
        `));
    }
    if (e.type == 'e-wallet') {
        $("#ewallet .bank-container").append($(`
            <li>
                <div class="bank-item ${e.code}" data-type="${e.code}">
                    <img src="${e.logo}" class="rounded">
                </div>
            </li>
        `));
    }
});

$(".bank-container .bank-item").click(function() {
    var type = $(this).data("type");
    ipc.send("show:mainWindows", {type})
})
