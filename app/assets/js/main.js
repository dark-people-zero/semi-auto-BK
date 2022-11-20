window.$ = window.jQuery = require("jquery");
const { ipcRenderer } = require('electron');
const { select2 } = require("select2")(jQuery);
const { io } = require("socket.io-client");
const ipc = ipcRenderer;

let socket, config, dataBankDepo = [], dataBankWD = [], dataBankActive = null;

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

/** start event yang dari html */

const func = {
    init: () => {
        func.load();
        func.setTable();
        func.tanggal();

        setInterval(() => func.tanggal(), 1000);
    },
    socket: {
        conn: () => {
            if (dataBankActive != null) {
                var params = {
                    type: config.typeActive,
                    bank: {
                        type: dataBankActive.typebank,
                        nomor: dataBankActive.norek,
                        nama: dataBankActive.namarek,
                        userid: dataBankActive.userid
                    },
                    situs: config.situs
                }
                console.log(params);
                socket = io("http://localhost:3000", {
                    query: {
                        params: JSON.stringify(params)
                    }
                })

                func.socket.runEvent();
            }
        },
        stop: () => {
            socket.disconnect();
        },
        runEvent: () => {
            socket.on("connect", () => {
                console.log("socket connect id => ", socket.id);
                $("#startRobot").hide();
                $("#stopRobot").show();
                $("#hiddenSelect").show();
            });
            socket.on("disconnect", () => {
                console.log("socket disconnect id => ", socket.id);
                $("#startRobot").show();
                $("#stopRobot").hide();
                $("#hiddenSelect").hide();
            })
        }
    },
    load: () => {
        config = ipc.sendSync("config:get");
        dataBankDepo = ipc.sendSync("config:bank:get", "deposit");
        dataBankWD = ipc.sendSync("config:bank:get", "deposit");
    },
    resetTable: () => {
        $("#tableBankDepo tbody").children().remove();
    },
    setTable: () => {
        var tableDepo = $("#tableBankDepo");
        func.resetTable();
        if (dataBankDepo.length == 0) {
            tableDepo.find("tbody").append(`
                <tr>
                    <td colspan="7" class="text-center">Belum ada data bos ku.</td>
                </tr>
            `);
        }else{
            dataBankDepo.forEach((e,i) => {
                let html = $(`
                    <tr>
                        <td class="text-center align-middle">${i+1}</td>
                        <td class="align-middle">${e.typebank}</td>
                        <td class="align-middle">${e.namarek}</td>
                        <td class="align-middle">${e.norek}</td>
                        <td class="align-middle">${e.userid}</td>
                        <td class="d-flex justify-content-center align-items-center">
                            <div class="button r m-0 button-sweet button-sweet-sm">
                                <input type="checkbox" class="checkbox btn-status" ${e.status ? 'checked' : ''}>
                                <div class="knobs" data-on="ON" data-off="OFF"></div>
                                <div class="layer"></div>
                            </div>
                        </td>
                        <td class="text-center align-middle">
                            <span class="material-symbols-outlined me-3 btn-action btn-edit" role="button">edit</span>
                            <span role="button" class="material-symbols-outlined btn-action btn-delete">delete</span>
                        </td>
                    </tr>
                `)

                html.find('.btn-status').change(function() {
                    var prop = $(this).prop("checked");
                    console.log("status-id", e.id);
                    console.log("stattus", prop);
                })

                html.find('.btn-edit').click(function() {
                    console.log("edit", e.id);
                })

                html.find('.btn-delete').click(function() {
                    console.log("delete", e.id);
                })
                tableDepo.find("tbody").append(html);
            });
        }
    },
    tanggal: () => {
        var now = new Intl.DateTimeFormat('id-ID', {
            dateStyle: 'full',
            timeStyle: 'medium',
            timeZone: 'Asia/Jakarta'
        }).format(new Date(Date.now()));

        var tgl = $("#tanggal");
        tgl.text(now.replaceAll('.',':'));
    }
}

$("#startRobot").click(() => func.socket.conn());
$("#stopRobot").click(() => func.socket.stop());

func.init();


var selectBankDepo = $("#selectBankDepo").select2({
    data: dataBankDepo.map(e => {
        e.text = e.norek+'-'+e.namarek;

        return e;
    }),
    placeholder: "Silahkan Pilih Bank",
    allowClear: true
})

selectBankDepo.on('select2:open', function(e) {
    $('input.select2-search__field').prop('placeholder', 'Cari..');
});

selectBankDepo.on('change', function (e) {
    var val = $(this).val();
    if (val != "") {
        var data = $("#selectBankDepo").select2("data")[0];
        dataBankActive = data;
    }else{
        dataBankActive = null;
    }
});


// untuk pengaturan content
$(".menu-item").click(function(e) {
    var target = $(this).attr("data-bs-target");
    var type = $(this).attr("title").toLowerCase();
    if (target && !$(this).hasClass("active")) {
        $(".menu-item.active").removeClass("active");
        $(".collapse.show").removeClass("show");
        $(this).addClass("active");
        $(target).addClass("show");

        config.typeActive = type;
        ipc.sendSync("config:put", config);

        func.load();
    }
})

// untuk btn simpan
$("#btnSimpan").click(function() {
    var newForm = {};
    var form = $("#formGlobal").serializeArray();
    form.forEach(e => newForm[e.name] = e.value);
    ipc.sendSync("config:bank:save", newForm);
    func.load();
})







