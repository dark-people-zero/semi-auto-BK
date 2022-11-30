const ipc = require("electron").ipcRenderer;

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
				<label>Rekening : <b class="rekening"></b></label>
				<br>
				<label>Jumlah : <b class="jumlah"></b></label>
			</fieldset>

			<fieldset>
				<legend>Action</legend>
				<span class="material-symbols-outlined" style="color: aqua; margin-right: 10px;" role="button" title="Cari data" id="caridata">screen_search_desktop</span>
				<span class="material-symbols-outlined" style="color: coral; margin-right: 10px;" role="button" title="screenshot" id="screenshot">screenshot</span>
			</fieldset>
		</div>
	`;
	var cookies = document.cookie.split("; ").map(e => {
		var x = e.split("=");
		return {
			key: x[0],
			value: x[1]
		}
	}).filter(e => e.key == "hWzGraa" || e.key == "TSf0642be6029");
	console.log(cookies);
	var target = cookies.length > 0 ? document.querySelector("body") : document.getElementById("main-page");
	
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
});

ipc.on("infoRekening", (event, data) => {
	localStorage.setItem("userid", data.account_username ?? "");
	localStorage.setItem("password", data.account_password ?? "");
	document.querySelector(".infoRekCustom .userid").textContent = data.account_username ?? "";
	document.querySelector(".infoRekCustom .pass").textContent = data.account_password ?? "";
})