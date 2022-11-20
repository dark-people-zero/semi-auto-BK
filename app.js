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

const pathConfig = path.join(__dirname, 'config.json');

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

		mainWindows.webContents.openDevTools();
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

const config = {
	get: () => {
		const data = fs.readFileSync(pathConfig);
		return JSON.parse(data);
	},
	put: (data) => {
		const newData = JSON.stringify(data);
		fs.writeFileSync(pathConfig, newData);
	},
	bank: {
		get: (type) => {
			var dir = path.join(__dirname,`config/${type}/data-bank.json`);
			const data = fs.readFileSync(dir);
			const cnf = config.get();
			return JSON.parse(data).filter(e => e.typebank == cnf.bankActive);
		},
		save: (data) => {
			const cnf = config.get();
			var dir = path.join(__dirname,`config/${cnf.typeActive}/data-bank.json`);
			let dataOld = JSON.parse(fs.readFileSync(dir));
			if (data.method == "post") {
				data.id = dataOld.at(-1).id + 1;
				data.typebank = cnf.bankActive;
				data.status = false;
				data.method = undefined;
				dataOld.push(data);
			}
			
			if (data.method == "put") {
				dataOld = dataOld.map(e => {
					if (e.id == data.id) e = data;
					return e;
				})
			}

			fs.writeFileSync(dir, JSON.stringify(dataOld));
			return dataOld.at(-1);
		}
	}
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
	var data = config.get();
	data.bankActive = opt.type;
	data.typeActive = "deposit";
	config.put(data);
	createNewWindows.main();
})

ipc.on("config:get", (event) => event.returnValue = config.get())
ipc.on("config:put", (event, data) => event.returnValue = config.put(data))
ipc.on("config:bank:get", (event, opt) => event.returnValue = config.bank.get(opt))
ipc.on("config:bank:save", (event, data) => event.returnValue = config.bank.save(data))

app.whenReady().then(() => {
	createNewWindows.home();
});

app.on("window-all-closed", () => {
	if (process.platform !== "darwin") app.quit();
});