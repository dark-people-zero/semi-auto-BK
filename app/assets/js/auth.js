window.$ = window.jQuery = require("jquery");
const { ipcRenderer } = require('electron');
const ipc = ipcRenderer;

minimizeBtn.addEventListener('click', () => ipc.send('minimizeApp', "auth"));
closeBtn.addEventListener('click', () => ipc.send("closeAllApp", "auth"));

const ListSitus = ipc.sendSync("config:situs:get");

ListSitus.forEach(e => {
    $("#situs").append($(`
        <option value="${e.code}">${e.name}</option>
    `));
});

$("#formLogin").submit(function(e) {
    e.preventDefault();
    var form = {};
    $(this).serializeArray().forEach(e => form[e.name] = e.value);
    var login = ipc.sendSync("auth:authentication", form);
    var template = $(`
        <div class="alert alert-warning alert-dismissible fade show" role="alert">
            <strong>Error!</strong> Email atau password anda salah.
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    `);
    var tmp = $(this).parent().find(".alert");
    if (login.status) {
        // login berhasil
        if (tmp.length > 0) $('[role="alert"]').remove();
        ipc.send("auth:procces", login);
    }else{
        // login gagal
        if (tmp.length == 0) $(this).parent().prepend(template);   
    }

    console.log(login);
})