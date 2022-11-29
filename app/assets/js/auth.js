const { contextBridge, ipcRenderer } = require('electron');
const ipc = ipcRenderer;
var axios = require('axios');
var qs = require('qs');
const ListSitus = ipc.sendSync("config:situs:get");
const config = ipc.sendSync("config:get");

document.addEventListener("DOMContentLoaded", () => {
    window.$ = window.jQuery = require("jquery");
    window.ipcRenderer = ipcRenderer;
    minimizeBtn.addEventListener('click', () => ipc.send('minimizeApp', "auth"));
    closeBtn.addEventListener('click', () => ipc.send("closeAllApp", "auth"));
    
    ListSitus.forEach(e => {
        $("#situs").append($(`
            <option value="${e.site_code}">${e.site_title}</option>
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
    var tmp = $("#formLogin").parent().find(".alert");
    if (tmp.length > 0) tmp.remove();
    var template = $(`
        <div class="alert alert-warning alert-dismissible fade show" role="alert">
            <strong>Error!</strong> <br>
            <ul></ul>
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    `);
    const params = {
        errorMessage: [],
        endPoint: "local",
        urlLogin: config.urlLogin,
        urlAccount: config.urlAccount,
    }
    
    if (data.method == "input") {
        if (data.email == "") params.errorMessage.push("Email tidak boleh kosong");
        if (data.password == "") params.errorMessage.push("Password tidak boleh kosong");
        if (data.situs == "") params.errorMessage.push("Situs tidak boleh kosong");
    }

    if (data.method == "google") {
        params.endPoint = "google";
        if (data.email == "") params.errorMessage.push("Email tidak boleh kosong");
        if (data.situs == "") params.errorMessage.push("Situs tidak boleh kosong");
        if (data.uid == "") params.errorMessage.push("UID tidak di dapat dari google");
    }

    if (params.errorMessage.length > 0) {
        var err = params.errorMessage.map(e => {
            return `<li>${e}</li>`
        }).join("");
        template.find("ul").append($(err));
        $(".loading").removeClass("show");
        $("#formLogin").parent().prepend(template);  
    }else{
        var dataLogin = qs.stringify({
            'user_email': data.email,
            'user_password': data.password
        });
        var configLogin = {
            method: 'post',
            url: params.urlLogin+params.endPoint,
            data : dataLogin
        };

        axios(configLogin).then(function (response) {
            var res = response.data;
            if (res.status) {
                var authorization = res.data.authorization;
                var configAccount = {
                    method: 'get',
                    url: params.urlAccount,
                    headers: { 
                      'authorization': authorization,
                    }
                };

                axios(configAccount).then(function (resAccount) {
                    var dataRes = resAccount.data;
                    if (dataRes.status) {
                        var siteData = dataRes.data.site_data.map(e => e.site_code);
                        if (siteData.includes(data.situs)) {
                            $(".loading").removeClass("show");
                            ipc.send("auth:procces", {
                                authorization: dataRes.data.session,
                                site_date: data.situs,
                                email: dataRes.data.userdata.email
                            });
                        }else{
                            template.find("ul").append($(`
                                <li>
                                    Anda tidak di ijinkan di situs <strong>${data.situs}</strong>. Anda hanya bisa mengakses situs <b>${siteData.join()}</b>
                                </li>
                            `));
                            $(".loading").removeClass("show");
                            $("#formLogin").parent().prepend(template);
                        }
                    }else{
                        dataRes.error.forEach(e => {
                            if (typeof e == "string") template.find("ul").append($(`<li>${e}</li>`));
                            if (typeof e == "object") e.forEach(val => template.find("ul").append($(`<li>${val}</li>`)));
                        });
        
                        $(".loading").removeClass("show");
                        $("#formLogin").parent().prepend(template);
                    }
                    
                }).catch(function (error) {
                    template.find("ul").append($(`<li>${error.message}</li>`));
                    $(".loading").removeClass("show");
                    $("#formLogin").parent().prepend(template);  
                });
            }else{
                res.errors.forEach(e => {
                    if (typeof e == "string") template.find("ul").append($(`<li>${e}</li>`));
                    if (typeof e == "object") e.forEach(val => template.find("ul").append($(`<li>${val}</li>`)));
                });

                $(".loading").removeClass("show");
                $("#formLogin").parent().prepend(template);
            }
        }).catch(function (error) {
            template.find("ul").append($(`<li>${error.message}</li>`));
            $(".loading").removeClass("show");
            $("#formLogin").parent().prepend(template);  
        });
    }


    // var login = ipc.sendSync("auth:authentication", data);
    
    // var tmp = $("#formLogin").parent().find(".alert");
    // if (login.status) {
    //     // login berhasil
    //     if (tmp.length > 0) $('[role="alert"]').remove();
    //     $(".loading").removeClass("show");
    //     ipc.send("auth:procces", login);
    // }else{
    //     // login gagal
    //     $(".loading").removeClass("show");
    //     if (tmp.length == 0) $("#formLogin").parent().prepend(template);   
    // }
}
