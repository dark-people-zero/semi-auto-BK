window.$ = window.jQuery = require("jquery");
const { ipcRenderer } = require('electron');
const { select2 } = require("select2")(jQuery);
const { io } = require("socket.io-client");
const ipc = ipcRenderer;

let socket, config, dataBankDepo = [], dataBankWD = [], dataBankActive = null, dataTransaksi = [];

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
            
            socket.on("recive:data", (data) => {
                data.status = 'waiting';
                dataTransaksi.push(data);
                func.setTable(data);
            });
        }
    },
    load: () => {
        config = ipc.sendSync("config:get");
        dataBankDepo = ipc.sendSync("config:bank:get", "deposit");
        dataBankWD = ipc.sendSync("config:bank:get", "deposit");
    },
    resetTable: () => {
        $("#tableTransaksiDepo tbody").children().remove();
    },
    setTable: (data) => {
        var tableTransaksiDepo = $("#tableTransaksiDepo");
        tableTransaksiDepo.find("tbody .nullData").remove();
        var no = dataTransaksi.length + 1;
        let html = $(`
            <tr>
                <td class="text-center align-middle">${no}</td>
                <td class="align-middle">${data.userid}</td>
                <td class="align-middle">${data.nomor}</td>
                <td class="align-middle">${data.nama}</td>
                <td class="align-middle">${data.jumlah}</td>
                <td class="d-flex justify-content-center align-items-center">
                    <span class="material-symbols-outlined">
                        ${data.status == 'done' ? 'check_circle' : data.status == 'proccess' ? 'change_circle' : 'hourglass_top'}
                    </span>
                </td>
            </tr>
        `)
        tableTransaksiDepo.find("tbody").prepend(html);
    },
    tanggal: () => {
        var now = new Intl.DateTimeFormat('id-ID', {
            dateStyle: 'full',
            timeStyle: 'medium',
            timeZone: 'Asia/Jakarta'
        }).format(new Date(Date.now()));

        var tgl = $("#tanggal");
        tgl.text(now.replaceAll('.',':'));
    },
    robot: {
        start: () => {
            // ini untuk deposit
            // if (config.typeActive == 'deposit') {
            //     if (config.bankActive == "bca") {
                    
            //     }
            // }
        },
        stop: () => {

        }
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







