const {
	app,
	BrowserWindow,
	screen,
	ipcMain,
	session,
	desktopCapturer
} = require("electron");
const path = require("path");
const fs = require("fs");
const ipc = ipcMain;
const moment = require("moment");
const { fork } = require('child_process');
const ps = fork(`${__dirname}/app/pages/login/server.js`);
const randomUseragent = require('random-useragent');
const axios = require('axios');

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

	if (params.nodeIntegration) conf.webPreferences.nodeIntegration = params.nodeIntegration;
	if (params.nativeWindowOpen) conf.webPreferences.nativeWindowOpen = params.nativeWindowOpen;
	if (params.contextIsolation) conf.webPreferences.contextIsolation = params.contextIsolation;
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
	if (params.type == "url") {
		if (params.userAgent) {
			win.loadURL(params.target, {userAgent: params.userAgent});
		}else{
			win.loadURL(params.target);
		}
	}
	return win;
};

const createNewWindows = {
	auth: () => {

		authWindows = createWindow({
			type: "url",
			target: "http://localhost:9990",
			width: 600,
			height: 400,
			resizable: false,
			preload: "app/assets/js/auth.js",
			nativeWindowOpen: true,
			contextIsolation: true,
		});

		authWindows.webContents.setWindowOpenHandler(() => {
			return {
				action: 'allow',
				overrideBrowserWindowOptions: {
					frame: false,
				}
			}
		});

		authWindows.webContents.session.clearCache();
		authWindows.webContents.session.clearStorageData();
		authWindows.webContents.openDevTools();
	},
	main: () => {
		// closeWindows.home();
		mainWindows = createWindow({
			type: "file",
			target: "./app/pages/main.html",
		});

		// mainWindows.webContents.openDevTools();
	},
	home: () => {
		homeWindows = createWindow({
			type: "file",
			target: "./app/pages/home.html",
		});

		// homeWindows.webContents.openDevTools();
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
		var listUrlRek = config.listUrlBank();
		const userAgent = randomUseragent.getRandom(e => !['Android Browser', 'IEMobile', 'Mobile Safari', 'Opera Mobi'].includes(e.browserName))
		if (cnf.userLogin.bank_type == "inet") {
			var url = listUrlRek.filter(e => e.bank_code == cnf.userLogin.bank_code)
			if (url.length > 0) {
				url = url[0].url;
				bankWindows = createWindow({
					type: "url",
					target: url,
					preload: "./preload/bank.js",
					resizable: true,
					x: 0,
					y: 0,
					userAgent: userAgent
				});

				bankWindows.webContents.session.clearCache();
				bankWindows.webContents.session.clearStorageData();
			}
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
	init: () => {
		var cnf = config.get();
		var configSitus = {
			method: 'get',
			url: cnf.utlSitus,
		};
		
		axios(configSitus).then(function (response) {
			var data = response.data;
			if (data.status) config.situs.put(data.data);
		}).catch(function (error) {
			log.sistem({
				message: error.message
			});
		});
		  
	},
	win: {
		display: () => {
			const displays = screen.getAllDisplays();
			return displays;
		},
		screenCapture: () => {
			var display = config.win.display();
			if (display.length > 0) {
				display = display[0].workAreaSize
				desktopCapturer.getSources({
					types: ['screen'],
					thumbnailSize: {
						width: display.width,
						height: display.height
					}
				}).then(source => {
					let image = source[0].thumbnail.toPNG();
					const dir = path.join(__dirname, "history/tanggal/user/screenCapture");
					// jika folder gak ada maka create folder
					if (!fs.existsSync(dir)) fs.mkdirSync(dir, {recursive: true});
					var dirFile = path.join(dir, "tes.png");
					fs.createWriteStream(dirFile).write(image);
				})
			}
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
		},
		put: (data) => {
			var dirFile = path.join(__dirname, "config/data/situs.json");
			fs.writeFileSync(dirFile, JSON.stringify(data));
		}
	},
	listBank: () => {
		var dirFile = path.join(__dirname, "config/data/bank.json");
		return JSON.parse(fs.readFileSync(dirFile));
	},
	listUrlBank: () => {
		var dirFile = path.join(__dirname, "config/data/urlBank.json");
		return JSON.parse(fs.readFileSync(dirFile));
	},
	listRekening: () => {
		var dirFile = path.join(__dirname, "config/data/rekening.json");
		return JSON.parse(fs.readFileSync(dirFile));
	},
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
	},
	sistem: (data) => {
		try {
			var time = moment().format('Y-M-D');
			var name = time+".json";
			var dir = path.join(__dirname, 'log/sistem');
			data.time = moment().format('Y-M-D H:i:s');

			// jika folder gak ada maka create folder
			if (!fs.existsSync(dir)) fs.mkdirSync(dir, {recursive: true});

			var dirFile = path.join(dir, name);
			if (fs.existsSync(dirFile)) {
				var oldData = JSON.parse(fs.readFileSync(dirFile));
				oldData.push(data);
				fs.writeFileSync(dirFile, JSON.stringify(oldData));
			}else{
				data = [data];
				fs.writeFileSync(dirFile, JSON.stringify(data));
			}
		} catch(err) {
			console.error(err)
		}
	}
}

const auth = {
	procces: (data) => {
		var cnf = config.get();
		cnf.userLogin = data;
		config.put(cnf);

		var url = cnf.urlListBank.replace("{site_code}",data.site_data)

		var configListBank = {
			method: 'get',
			url: url,
			headers: { 
			  'authorization': data.authorization
			}
		};
		
		axios(configListBank).then(function (response) {
  			var dataRes = response.data;
			if (dataRes.status) {
				var dataBank = dataRes.data.map(e => {
					var type = "e-wallet";
					if (e.bank_instance_type == "bank" || e.bank_instance_type == "mbank") {
						type = e.bank_name.includes("Mobile") ? "mobile" : "inet";

						if (e.bank_name == "Mandiri Lama") type = "mobile";
					}
					return {
						bank_code: e.bank_code,
						bank_codename: e.bank_codename,
						bank_name: e.bank_name,
						bank_instance_type: e.bank_instance_type,
						type: type
					}
				})
				var dirFile = path.join(__dirname, "config/data/bank.json");
				fs.writeFileSync(dirFile, JSON.stringify(dataBank));
				closeWindows.auth();
				createNewWindows.home();
			}else{
				log.sistem({
					message: "error ketika ambil data list bank"
				});
			}
		}).catch(function (error) {
			log.sistem({
				message: error.message
			});
		});
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
	var cnf = config.get();
	cnf.userLogin.bank_code = opt.bank_code;
	cnf.userLogin.bank_type = opt.bank_type;
	cnf.halamanActive = "deposit";
	config.put(cnf);

	var url = cnf.urlListRekening.replace("{site_code}", cnf.userLogin.site_data).replace("{bank_code}", cnf.userLogin.bank_code);

	var configListRek = {
		method: 'get',
		url: url,
		headers: { 
		  'authorization': cnf.userLogin.authorization
		}
	};
	  
	axios(configListRek).then(function (response) {
		var dataRes = response.data;
		if (dataRes.status) {
			var dataRek = dataRes.data.data.map(e => {
				return {
					account_title: e.account_title,
					account_title_alias: e.account_title_alias,
					account_username: e.account_username,
					account_password: e.account_password,
					rekening_number: e.rekening_data[0].rekening_number
				}
			})

			var dirFile = path.join(__dirname, "config/data/rekening.json");
			fs.writeFileSync(dirFile, JSON.stringify(dataRek));

			createNewWindows.main();
			createNewWindows.bank();
		}else{
			log.sistem({
				message: "error ketika ambil data list rekening"
			});
		}
	}).catch(function (error) {
		log.sistem({
			message: error.message
		});
	});
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
ipc.on("config:listRekening", (event) => event.returnValue = config.listRekening())

ipc.on("auth:procces", (event, data) => auth.procces(data));

ipc.on("reload:bank", (event) => {
	closeWindows.bank();
	createNewWindows.bank();
})

ipc.on("bank:send:infoRekening", (event, data) => bankWindows.webContents.send("infoRekening", data));
ipc.on("screen:capture", (event) => config.win.screenCapture());

app.whenReady().then(() => {
	// createNewWindows.home();
	// config.init();
	createNewWindows.auth();
	// createNewWindows.main();
	// createNewWindows.bank();
});

app.on("window-all-closed", () => {
	if (process.platform !== "darwin") app.quit();
});