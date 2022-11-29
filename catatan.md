#API
- login
- list rekening difilter sesuai id bank


#socket terima
- recive:data
  data yang dibutuhkan: {
    userid: "",
    nomor: "",
    nama: "",
    jumlah: 0,
    type: "", //deposit atau withdraw
  },
- send:data:callback
  data yang dibutuhkan: {
    status: true, // true or false
    data: {} //di ambil dari socket send:data
  },

#socket kirim
- recive:data:callback
  data yang akan di kirim: {
    status: true, // true or false
    data: {} //di ambil dari socket recive:data
  }

- send:data
  data yang akan di kirim: {
    status: '', // approve or hold
    alasan: '', // alasan kenapa harus di hold
    data: {} //di ambil dari socket recive:data
  }