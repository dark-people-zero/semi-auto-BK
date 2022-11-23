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

function loginProses(data) {
    var res = {
        status: false,
        user: data
    }
    if (data.email != "" && data.password != "" && data.situs != "") {
        res.status = false;
        return res;
    }else{
        return res;
    }
}

$("#formLogin").submit(function(e) {
    e.preventDefault();
    var form = {};
    $(this).serializeArray().forEach(e => form[e.name] = e.value);
    var login = loginProses(form);
    if (login.status) {
        // login berhasil
        $('[role="alert"]').addClass('d-none');
    }else{
        // login gagal
        $('[role="alert"]').removeClass('d-none');
    }
})