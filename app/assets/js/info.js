const { ipcRenderer } = require('electron');
const ipc = ipcRenderer;

var data = ipc.sendSync("robot:getInfo");

if (data) {
    if(data.userid) document.getElementById("userid").textContent = data.userid;
    if(data.nomor) document.getElementById("nomor").textContent = data.nomor;
    if(data.nama) document.getElementById("nama").textContent = data.nama;
    if(data.jumlah) document.getElementById("jumlah").textContent = "Rp. "+ new Intl.NumberFormat('id-ID', { maximumSignificantDigits: 3 }).format(data.jumlah);
}

// is-invalid
approve.addEventListener("click", () => {
    console.log("approve");
})
hold.addEventListener("click", () => {
    var alasan = document.getElementById("alasan");
    if (alasan.value == "") {
        alasan.classList.add("is-invalid");
    }
    console.log("hold");
})