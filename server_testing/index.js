const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);

const dataclient = [];

app.post('/send-data', function(req, res) {
    // res.sendfile('index.html');
    if (dataclient.length > 0) {
        var data = {
            userid: "dian7899",
            nomor: "9878990077",
            nama: "dian sastri",
            jumlah: 200000,
        }
        var conf = dataclient[0];
        const room = `${conf.situs}:${conf.type}:${conf.bank.type}:${conf.bank.nomor}`;
        io.to(room).emit("recive:data",data);
    }
    res.json({
        status: dataclient,
    })
});

io.on("connection", (socket) => {
    const conf = JSON.parse(socket.handshake.query.params);
    // format room "nama situs:tipe transaksi:tipe bank:nomor rekening"
    // example "ziatogel:deposit:bca:8987898700"
    conf.socketid = socket.id;
    dataclient.push(conf);
    const room = `${conf.situs}:${conf.type}:${conf.bank.type}:${conf.bank.nomor}`;
    socket.join(room);
    
    socket.on("disconnect", () => {
        const index = dataclient.findIndex(e => e.socketid == socket.id);
        dataclient.splice(index, 1)

        console.log("disconnect",socket.id);
    });
});

io.on("recive:data", (data) => {
    console.log("data diterima", data);
})

http.listen(3000, function() {
    console.log('listening on *:3000');
});

data = {
    userid: "dian7899",
    nomor: "9878990077",
    nama: "dian sastri",
    jumlah: 200000,
}