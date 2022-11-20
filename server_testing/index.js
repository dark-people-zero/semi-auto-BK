const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);


app.get('/', function(req, res) {
    res.sendfile('index.html');
});

io.on("connection", (socket) => {
    const conf = socket.handshake.query.params;

    console.log(JSON.parse(conf));
    // console.log(socket.id);
    // console.log(socket.rooms);
    // socket.join("room1");
    // console.log(socket.rooms);
    socket.on("disconnect", () => {
        console.log("disconnect",socket.id);
    });
});


http.listen(3000, function() {
    console.log('listening on *:3000');
});

let data = {
    "typeBank": "BCA",
    "jumlah": 200000,
    "noRek": "25475456474",
    "namaPenerima": "andini",
    "userid": "dia9877",
}