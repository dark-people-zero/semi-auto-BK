const { contextBridge, ipcRenderer } = require('electron');
const ipc = ipcRenderer;
const ListSitus = ipc.sendSync("config:situs:get");

document.addEventListener("DOMContentLoaded", () => {
    window.$ = window.jQuery = require("jquery");
    window.ipcRenderer = ipcRenderer;
    minimizeBtn.addEventListener('click', () => ipc.send('minimizeApp', "auth"));
    closeBtn.addEventListener('click', () => ipc.send("closeAllApp", "auth"));
    
    ListSitus.forEach(e => {
        $("#situs").append($(`
            <option value="${e.code}">${e.name}</option>
        `));
    });
    
    $("#formLogin").submit(function(e) {
        e.preventDefault();
        $(".loading").addClass("show");
        var form = {};
        $(this).serializeArray().forEach(e => form[e.name] = e.value);
        prosesLogin(form);
    })
});

contextBridge.exposeInMainWorld("loginFirebase", (data) => prosesLogin(data));

function prosesLogin(data) {
    var login = ipc.sendSync("auth:authentication", data);
    var template = $(`
        <div class="alert alert-warning alert-dismissible fade show" role="alert">
            <strong>Error!</strong> Email atau password anda salah.
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    `);
    var tmp = $("#formLogin").parent().find(".alert");
    if (login.status) {
        // login berhasil
        if (tmp.length > 0) $('[role="alert"]').remove();
        $(".loading").removeClass("show");
        ipc.send("auth:procces", login);
    }else{
        // login gagal
        $(".loading").removeClass("show");
        if (tmp.length == 0) $("#formLogin").parent().prepend(template);   
    }
}
