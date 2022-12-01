const ipc = require("electron").ipcRenderer;

const config = ipc.sendSync("config:get");

document.addEventListener("DOMContentLoaded", () => {
	var div = document.createElement("div");
	div.innerHTML = `
		<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
		<div style="background: #2c313c; display: flex; justify-content: center; align-items: center; color: #c3ccdf; padding: 10px; -webkit-app-region: drag;">
		    <div style=" font-weight: 900; -webkit-app-region: no-drag;">Halaman Bank</div>
		</div>
		<style>
			fieldset {
				padding-block-start: 0.35em;
				padding-inline-start: 0.75em;
				padding-inline-end: 0.75em;
				padding-block-end: 0.625em;
				margin-inline-start: 2px;
				margin-inline-end: 2px;
				border-width: 2px;
				border-style: groove;
				border-color: #c3ccdf;
				border-image: initial;
				border-radius: 10px;
				width: 100%;
				color: #c3ccdf;
			}

			legend {
				padding-inline-start: 2px;
				padding-inline-end: 2px;
				width: auto !important;
				float: none;
				font-size: 16px;
				color: #c3ccdf !important;
			}

			.infoRekCustom {
				display: flex;
				column-gap: 15px;
				background: #2c313c;
				color: #c3ccdf;
				border-top: 1px solid #c3ccdf;
				padding-bottom: 1rem;
				padding-left: 20px;
				padding-right: 20px;
			}

			[role="button"] {
				cursor: pointer;
			}
		</style>
		<div class="infoRekCustom">
			<fieldset>
				<legend>Data Rekening</legend>
				<label>Userid : <b class="userid"></b></label>
				<br>
				<label>Password : <b class="pass"></b></label>
			</fieldset>

			<fieldset>
				<legend>Data Masuk</legend>
				<label>Nama Pengirim : <b class="pengirim">ISRODIN</b></label>
				<br>
				<label>Jumlah : <b class="jumlah">25.000,00</b></label>
			</fieldset>

			<fieldset>
				<legend>Action</legend>
				<span class="material-symbols-outlined" style="color: aqua; margin-right: 10px;" role="button" title="Cari data" id="caridata">screen_search_desktop</span>
				<span class="material-symbols-outlined" style="color: coral; margin-right: 10px;" role="button" title="screenshot" id="screenshot">screenshot</span>
			</fieldset>
		</div>
	`;

	var target = document.getElementById("main-page");

	if (!target) target = document.querySelector("body");
	
	if (target) {
		target.prepend(div);
	} else {
		target = document.querySelector("frameset");
		var parentNode = target.parentNode;
		parentNode.insertBefore(div, target);
	}

	var userid = localStorage.getItem("userid");
	var pass = localStorage.getItem("password");
	document.querySelector(".infoRekCustom .userid").textContent = userid;
	document.querySelector(".infoRekCustom .pass").textContent = pass;

	document.getElementById("caridata").addEventListener("click", function() {
		var jumlah = document.querySelector(".infoRekCustom .jumlah").textContent;
		var pengirim = document.querySelector(".infoRekCustom .pengirim").textContent;
		var bank_code = config.userLogin.bank_code;

		searchFunc[bank_code]({
			jumlah,pengirim
		})
	})

	document.getElementById("screenshot").addEventListener("click", () => ipc.send("screen:capture"))
});

ipc.on("infoRekening", (event, data) => {
	localStorage.setItem("userid", data.account_username ?? "");
	localStorage.setItem("password", data.account_password ?? "");
	document.querySelector(".infoRekCustom .userid").textContent = data.account_username ?? "";
	document.querySelector(".infoRekCustom .pass").textContent = data.account_password ?? "";
})

// screen:capture

const searchFunc = {
	bri: (data) => {
		console.log("masuk ke function", data);
		var iframeContent = document.getElementById("content");
		var trFrmae = iframeContent.contentWindow;
		for (const tr of trFrmae.document.querySelectorAll("#tabel-saldo tbody tr")){
			var tdName = tr.children[1];
			var tdJumlahTarget = tr.children[3];
			var tdJumlah = tdJumlahTarget.textContent.replace(".","").replace(",",".");
			var jumlah = data.jumlah.replace(".","").replace(",",".");
			if (tdName.textContent.toLowerCase().includes(data.pengirim.toLowerCase())) {
				tdName.style.background = "yellow";
				if (tdJumlah.includes(jumlah)) {
					tr.style.background = "yellow";
				}
			}
		}
	}
}