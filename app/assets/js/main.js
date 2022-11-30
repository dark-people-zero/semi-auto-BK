window.$ = window.jQuery = require("jquery");
const { ipcRenderer } = require('electron');
const { select2 } = require("select2")(jQuery);
const Swal = require('sweetalert2');
const { io } = require("socket.io-client");
const ipc = ipcRenderer;

let socket, config, dataRekening = [], dataBankActive = null, dataTransaksi = [], dataProses = null;

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
        func.robot.checking();
        setInterval(() => func.tanggal(), 1000);

        ipc.on("proses:selesai", (event, data) => {
            data.created = config.userLogin;
            socket.emit("recive:data:client", (data, (res) => {
                if (res.status) {
                    dataProses = null;
                    dataTransaksi = dataTransaksi.filter(e => e.id = data.id);
                    func.setTable();
                    func.toast.success();
                }
            }));
        })
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
            func.robot.stop();
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
                data.id = func.generateID();
                dataTransaksi.push(data);
                func.setTable();
                socket.emit("recive:data:approve", data)
            });

            func.robot.start();
        }
    },
    load: () => {
        config = ipc.sendSync("config:get");
        dataRekening = ipc.sendSync("config:listRekening");
    },
    resetTable: () => {
        $("#tableTransaksiDepo tbody").children().remove();
    },
    setTable: () => {
        func.resetTable();
        var tableTransaksiDepo = $("#tableTransaksiDepo");
        console.log(dataTransaksi);
        if (dataTransaksi.length > 0) {
            dataTransaksi.forEach((e, i) => {
                let html = $(`
                    <tr>
                        <td class="text-center align-middle">${i+1}</td>
                        <td class="align-middle">${e.userid}</td>
                        <td class="align-middle">${e.nomor}</td>
                        <td class="align-middle">${e.nama}</td>
                        <td class="align-middle">${e.jumlah}</td>
                        <td class="text-center">
                            <span class="material-symbols-outlined ${e.status}">
                                ${e.status == 'done' ? 'check_circle' : e.status == 'proccess' ? 'change_circle' : 'hourglass_top'}
                            </span>
                        </td>
                    </tr>
                `)
                tableTransaksiDepo.find("tbody").append(html);
            });
        }else{
            tableTransaksiDepo.find("tbody").append($(`
                <tr class="nullData">
                    <td colspan="6" class="text-center">Belum ada data bos ku</td>
                </tr>
            `))
        }
    },
    tanggal: () => {
        var now = new Intl.DateTimeFormat('id-ID', {
            dateStyle: 'full',
            timeStyle: 'medium',
            timeZone: 'Asia/Jakarta'
        }).format(new Date(Date.now()));

        var tgl = $(".tanggal");
        tgl.text(now.replaceAll('.',':'));
    },
    robot: {
        start: () => {
            if (dataTransaksi.length > 0) {
                var data = dataTransaksi[0];
                dataProses = data;
                dataTransaksi[0].status = "proccess";
                func.setTable();
                ipc.send("robot:info:show", data);
            }
        },
        stop: () => {
            dataProses = null;
            dataTransaksi = [];
        },
        checking: () => {
            setInterval(() => {
                if (dataProses == null && dataTransaksi.length > 0) func.robot.start();
            }, 1000);
        }
    },
    generateID: () => {
        const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

        let random = "";
        for (let i = 0; i < 10; i++) {
            random += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return random;
    },
    toast: {
        init: () => {
            const Toast = Swal.mixin({
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true,
                didOpen: (toast) => {
                  toast.addEventListener('mouseenter', Swal.stopTimer)
                  toast.addEventListener('mouseleave', Swal.resumeTimer)
                }
            })
            return Toast;
        },
        info: () => {
            func.toast.init().fire({
                icon: 'info',
                title: 'Ini contoh toast info.',
            })
        },
        success: () => {
            func.toast.init().fire({
                icon: 'success',
                title: 'Data berhasil di proses gan.',
            })
        },
        error: () => {
            func.toast.init().fire({
                icon: 'error',
                title: 'Ini contoh toast error.',
            })
        },
        question: () => {
            func.toast.init().fire({
                icon: 'question',
                title: 'Ini contoh toast error.',
            })
        },
        
    }
}

$("#startRobot").click(() => func.socket.conn());
$("#stopRobot").click(() => func.socket.stop());

func.init();

var selectBankDepo = $("#selectBankDepo").select2({
    data: dataRekening.map(e => {
        e.text = e.rekening_number+'-'+e.account_title;
        e.id = e.rekening_number;
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







