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
const config = ipc.sendSync("config:get");

ListBank.forEach(e => {
    if (e.type == 'inet') {
        $("#inetBanking .bank-container").append($(`
            <li>
                <div class="bank-item ${e.bank_code}" data-bank-code="${e.bank_code}" data-bank-type="${e.type}">
                    <b>${e.bank_codename}</b>
                </div>
            </li>
        `));
    }
    if (e.type == 'mobile') {
        $("#mobileBanking .bank-container").append($(`
            <li>
                <div class="bank-item ${e.bank_code}" data-bank-code="${e.bank_code}" data-bank-type="${e.type}">
                    <b>${e.bank_codename}</b>
                </div>
            </li>
        `));
    }
    if (e.type == 'e-wallet') {
        $("#ewallet .bank-container").append($(`
            <li>
                <div class="bank-item ${e.bank_code}" data-bank-code="${e.bank_code}" data-bank-type="${e.type}">
                    <b>${e.bank_codename}</b>
                </div>
            </li>
        `));
    }
});

$('#infouser').text(config.userLogin.email);

$(".bank-container .bank-item").click(function() {
    var bank_code = $(this).attr("data-bank-code");
    var bank_type = $(this).attr("data-bank-type");
    $(".loading").addClass("show");
    ipc.send("show:mainWindows", {
        bank_code: bank_code,
        bank_type: bank_type,
    })
})
