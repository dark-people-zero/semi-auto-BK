const {
	app,
	BrowserWindow,
	screen,
	BrowserView,
	ipcMain,
} = require("electron");
const path = require("path");
const fs = require("fs");
const ipc = ipcMain;

var mainWindows, homeWindows, adminWindows;

var statusWindowsAdmin = false;

const createWindow = (params) => {
	var conf = {
		minWidth: 940,
		minHeight: 560,
		frame: false,
		webPreferences: {
			nodeIntegration: true,
			contextIsolation: false,
		},
	};

	if (params.preload)
		conf.webPreferences.preload = path.join(__dirname, params.preload);

	const win = new BrowserWindow(conf);

	if (params.type == "file") win.loadFile(params.target);
	if (params.type == "url") win.loadURL(params.target);
	return win;
};

const createNewWindows = {
	main: () => {
		closeWindows.home();
		mainWindows = createWindow({
			type: "file",
			target: "./app/pages/main.html",
		});
	},
	home: () => {
		homeWindows = createWindow({
			type: "file",
			target: "./app/pages/home.html",
		});
	},
	admin: () => {
		
	},
}

const closeWindows = {
	main: () => {
		mainWindows.close();
		mainWindows = null;

		createNewWindows.home();
	},
	home: () => {
		homeWindows.close();
		homeWindows = null;
	},
	admin: () => {
		
	},
}

ipc.on("closeAllApp", (event, target) => {
	if (target == "home" && homeWindows) closeWindows.home();
	if (target == "main" && mainWindows) closeWindows.main();
	if (target == "admin" && adminWindows) closeWindows.admin();
});

ipc.on("minimizeApp", (event, target) => {
	if (target == "home" && homeWindows) homeWindows.minimize();
	if (target == "main" && mainWindows) mainWindows.minimize();
	if (target == "admin" && adminWindows) adminWindows.minimize();
});
ipc.on("maximizeRestoreApp", (event, target) =>{
	if (target == "home" && homeWindows) homeWindows.isMaximized() ? homeWindows.restore() : homeWindows.maximize();
	if (target == "main" && mainWindows) mainWindows.isMaximized() ? mainWindows.restore() : mainWindows.maximize();
	if (target == "admin" && adminWindows) adminWindows.isMaximized() ? adminWindows.restore() : adminWindows.maximize();
});

ipc.on("admin:createWindows", () => {
	adminWindows = createWindow({
		preload: "preload/admin.js",
		type: "url",
		target: "https://agwl4.suksesbogil.com",
	});

	adminWindows.on("close", () => {
		adminWindows = null;
		statusWindowsAdmin = false;
	});
});

ipc.on("admin:status", () => (statusWindowsAdmin = true));

ipc.on("admin:startRobot", () => adminWindows.send("start"));

ipc.on("show:mainWindows", (event, opt) => {
	var type = opt.type;
	createNewWindows.main();
})

ipc.on("getConfig", (event) => {
	let data = JSON.parse(fs.readFileSync(path.join(__dirname, "config.json")));
	data.statusLogin = statusWindowsAdmin;
	event.returnValue = data;
});

app.whenReady().then(() => {
	createNewWindows.home();
});

app.on("window-all-closed", () => {
	if (process.platform !== "darwin") app.quit();
});
