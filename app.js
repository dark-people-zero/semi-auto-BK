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
const moment = require("moment");

const pathConfig = path.join(__dirname, 'config.json');

var authWindows, mainWindows, homeWindows, adminWindows, infoWindows, bankWindows, dataBankActive;

var dataInfo = null;

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

	if (params.preload) conf.webPreferences.preload = path.join(__dirname, params.preload);
	if (params.width) conf.minWidth = params.width;
	if (params.width) conf.width = params.width;
	if (params.height) conf.minHeight = params.height;
	if (params.height) conf.height = params.height;
	if (params.resizable != null) conf.resizable = params.resizable;
	if (params.x != null) conf.x = params.x;
	if (params.y != null) conf.y = params.y;

	const win = new BrowserWindow(conf);

	if (params.type == "file") win.loadFile(params.target);
	if (params.type == "url") win.loadURL(params.target);
	return win;
};

const createNewWindows = {
	auth: () => {
		authWindows = createWindow({
			type: "file",
			target: "./app/pages/auth.html",
			width: 600,
			height: 400,
			resizable: false,
		});

		authWindows.webContents.openDevTools();
	},
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
	info: () => {
		infoWindows = createWindow({
			type: "file",
			target: "./app/pages/info.html",
			width: 560,
			height: 400,
			resizable: false,
		});

		infoWindows.webContents.openDevTools();
	},
	bank: () => {
		var cnf = config.get();
		var url = cnf.listUrl[cnf.bankActive];
		if (url) {
			bankWindows = createWindow({
				type: "url",
				target: url,
				preload: "./preload/bank.js",
				resizable: false,
				x: 0,
				y: 0
			});
		}
	}

}

const closeWindows = {
	auth: () => {
		authWindows.close();
		authWindows = null;
	},
	main: () => {
		mainWindows.close();
		mainWindows = null;

		closeWindows.info();
		closeWindows.bank();

		createNewWindows.home();
	},
	home: () => {
		homeWindows.close();
		homeWindows = null;
	},
	admin: () => {
		
	},
	info: () => {
		if (infoWindows) {
			infoWindows.close();
			infoWindows = null;
		}
	},
	bank: () => {
		if (bankWindows) {
			bankWindows.close();
			bankWindows = null;
		}
	},
}

const config = {
	win: {
		display: () => {
			const displays = screen.getAllDisplays();
			return displays;
		}
	},
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
		},
		active: (data) => dataBankActive = data
	},
	situs: {
		get: () => {
			var dirFile = path.join(__dirname, "config/data/situs.json");
			return JSON.parse(fs.readFileSync(dirFile));
		}
	},
	listBank: () => {
		var dirFile = path.join(__dirname, "config/data/bank.json");
		return JSON.parse(fs.readFileSync(dirFile));
	}
}

const log = {
	save: (data) => {
		try {
			var cnf = config.get();
			var time = moment().format('Y-M-D');
			var name = dataBankActive.norek+".json";
			var dir = path.join(__dirname, `log/${cnf.situs}/${cnf.typeActive}/${cnf.bankActive}/${time}`);
			data.created = cnf.userLogin;

			// jika folder gak ada maka create folder
			if (!fs.existsSync(dir)) fs.mkdirSync(dir, {recursive: true});

			var dirFile = path.join(dir, name);
			if (fs.existsSync(dirFile)) {
				var oldData = JSON.parse(fs.readFileSync(dirFile));
				oldData.push(data);
				fs.writeFileSync(dirFile, JSON.stringify(oldData));
			}else{
				fs.writeFileSync(dirFile, JSON.stringify(data));
			}
		  } catch(err) {
			console.error(err)
		  }
	}
}

const auth = {
	authentication: (data) => {
		var res = {
			status: false,
			user: data
		}
		
		if (data.email != "" && data.password != "" && data.situs != "") {
			res.status = true;
			return res;
		}else{
			return res;
		}
	},
	procces: (data) => {
		var cnf = config.get();
		cnf.userLogin = data.user;
		config.put(cnf);

		closeWindows.auth();
		createNewWindows.home();
	}
}

ipc.on("closeAllApp", (event, target) => {
	if (target == "auth" && authWindows) closeWindows.auth();
	if (target == "home" && homeWindows) closeWindows.home();
	if (target == "main" && mainWindows) closeWindows.main();
	if (target == "admin" && adminWindows) closeWindows.admin();
	if (target == "info" && infoWindows) closeWindows.info();
	if (target == "bank" && bankWindows) closeWindows.bank();
});

ipc.on("minimizeApp", (event, target) => {
	if (target == "auth" && authWindows) authWindows.minimize();
	if (target == "home" && homeWindows) homeWindows.minimize();
	if (target == "main" && mainWindows) mainWindows.minimize();
	if (target == "admin" && adminWindows) adminWindows.minimize();
});

ipc.on("maximizeRestoreApp", (event, target) =>{
	if (target == "auth" && authWindows) authWindows.isMaximized() ? authWindows.restore() : authWindows.maximize();
	if (target == "home" && homeWindows) homeWindows.isMaximized() ? homeWindows.restore() : homeWindows.maximize();
	if (target == "main" && mainWindows) mainWindows.isMaximized() ? mainWindows.restore() : mainWindows.maximize();
	if (target == "admin" && adminWindows) adminWindows.isMaximized() ? adminWindows.restore() : adminWindows.maximize();
});

ipc.on("show:mainWindows", (event, opt) => {
	var data = config.get();
	data.bankActive = opt.type;
	data.typeActive = "deposit";
	config.put(data);
	createNewWindows.main();
	createNewWindows.bank();
})

ipc.on("robot:info:show", (event, data) => {
	dataInfo = data;
	createNewWindows.info();
});

ipc.on("robot:info:get", (event) => event.returnValue = dataInfo);
ipc.on("robot:proses", (event, data) => {
	ipc.emit("proses:selesai", data);
	log.save(data);
	closeWindows.info();
});


ipc.on("config:get", (event) => event.returnValue = config.get())
ipc.on("config:put", (event, data) => event.returnValue = config.put(data))
ipc.on("config:bank:get", (event, opt) => event.returnValue = config.bank.get(opt))
ipc.on("config:bank:save", (event, data) => event.returnValue = config.bank.save(data))
ipc.on("config:bank:active", (event, data) => config.bank.active(data))
ipc.on("config:situs:get", (event) => event.returnValue = config.situs.get())
ipc.on("config:listBank", (event) => event.returnValue = config.listBank())

ipc.on("auth:authentication", (event, data) => event.returnValue = auth.authentication(data));
ipc.on("auth:procces", (event, data) => auth.procces(data));

app.whenReady().then(() => {
	// createNewWindows.home();
	createNewWindows.auth();
});

app.on("window-all-closed", () => {
	if (process.platform !== "darwin") app.quit();
});