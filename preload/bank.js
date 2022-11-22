const ipc = require("electron").ipcRenderer;

document.addEventListener("DOMContentLoaded", () => {
	var div = document.createElement("div");
	div.innerHTML = `
		<div style="background: #2c313c; display: flex; justify-content: center; align-items: center; color: #c3ccdf; padding: 10px; -webkit-app-region: drag;">
		    <div style=" font-weight: 900; -webkit-app-region: no-drag;">Halaman Bank</div>
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
});