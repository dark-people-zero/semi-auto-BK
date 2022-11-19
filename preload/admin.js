const ipc = require("electron").ipcRenderer;

document.addEventListener("DOMContentLoaded", () => {
  	var halamanLogin = document.querySelectorAll('input[name="entered_login"]');
	var halamanInputPin = document.querySelectorAll('input[name="input_pin"]');
	var halamanUtama = document.querySelectorAll("frame");

	if (halamanUtama.length > 0) ipc.send("admin:status");

	var config = ipc.sendSync("getConfig");
	console.log(config);

	var div = document.createElement("div");
	div.innerHTML = `
		<div style="background: #2c313c; display: flex; justify-content: space-between; align-items: center; color: #c3ccdf; padding: 0 20px; -webkit-app-region: drag;">
		<div style=" font-weight: 900; -webkit-app-region: no-drag;">Admin</div>
		<svg xmlns="http://www.w3.org/2000/svg" height="48" width="48" style="fill: #c3ccdf; -webkit-app-region: no-drag; cursor: pointer;"><path d="M10 25.5v-3h28v3Z"></path></svg>
		</div>
	`;
	var target = document.querySelector("body");
	if (target) {
		target.prepend(div);
	} else {
		target = document.querySelector("frameset");
		var parentNode = target.parentNode;
		parentNode.insertBefore(div, target);
	}

	div.querySelector("svg").addEventListener("click", () => ipc.send("admin:minimize"));

	if (halamanLogin.length > 0) {
		var usrname = document.querySelector('input[name="entered_login"]');
		var pass = document.querySelector('input[name="entered_password"]');
		if (config.admin.autoLogin) {
			usrname.value = config.admin.username;
			pass.value = config.admin.password;
			document.querySelector('input[type="submit"]').click();
		}
	}

	if (halamanInputPin.length > 0) {
		document.querySelector('input[name="pin"]').value = config.admin.key;
		halamanInputPin[0].click();
	}
});
console.log("ada masuk di preload guys");

ipc.on("start", () => {
	
});

function cpDataWD() {
	var frameMenu = document.querySelector('frame[name="menu"]');
	var frameMaster = document.querySelector('frame[name="master"]');
	var btn = frameMenu.contentWindow.document.querySelector('#side-menu td.menus a[onclick="disabledbutton()"]');
	btn.click();
	setTimeout(() => {
		var checkError = frameMaster.contentWindow.document.querySelector("body").textContent.split("\n  ")[0]
		if (checkError == "error 404 not found") {
			window.location.reload();
		}else{
			var subMenu = frameMaster.contentWindow.document.querySelectorAll("#sub-menu tr a");
			var filter = [...subMenu].filter(e => e.getAttribute('href').indexOf("agen_playermoneyx.php?action=2") >= 0);
			if (filter.length > 0) {
				filter = filter[0];
				
			}
		}
	}, 1000);
}

// setTimeout(() => {
//   var frameMenu = document.querySelector('frame[name="menu"]');
//   var btn = frameMenu.contentWindow.document.querySelector('#side-menu td.menus a[onclick="disabledbutton()"]');
//   console.log(btn);
// }, 1000);

// ipc.on("reciveConfig", (data) => {
//   console.log("dari config",data);
// });

// window.ipcRenderer.on("historyCoin", (e, m) => {
//   console.log("datahistori coin", m);
//   // window.location.href="https://agwl4.suksesbogil.com/his_coin.php?page=1&info=Withdraw&datex=2022-11-11&datex2=2022-11-11&cekparam=2";
//   // var x = document.querySelectorAll("table tbody tr")
//   // x[x.length - 3].querySelector("td:first-child").textContent
// })
