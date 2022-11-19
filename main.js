const {
  app,
  BrowserWindow,
  screen,
  BrowserView,
  ipcMain,
} = require("electron");
const path = require("path");

const createWindow = () => {
    const displays = screen.getAllDisplays();
    const externalDisplay = displays.find((display) => display.size.width > 0);

    const win = new BrowserWindow({
        webPreferences: {
            // preload: 'preload.js',
            nodeIntegration: true,
            contextIsolation: false,
        },
    });

    win.maximize();

    // untuk halaman suksesbogil
    const view1 = new BrowserView({
        webPreferences: {
            preload: path.join(__dirname, "preload/suksesbogil.js"),
            nodeIntegration: true,
            contextIsolation: false,
        },
    });
    win.addBrowserView(view1);
    view1.setBounds({
        x: 0,
        y: 0,
        width: externalDisplay.size.width / 2,
        height: externalDisplay.size.height / 2,
    });
    view1.webContents.loadURL("https://agwl4.suksesbogil.com/");

    setTimeout(() => {
        view1.webContents.send("change-bg", "wohoooo amsuk bosku");
        view1.webContents.send("historyCoin", {
            
        });
    }, 2000);

    view1.webContents.openDevTools()
    

    // untuk halaman spreadsheets
    const view2 = new BrowserView({
        webPreferences: {
            preload: path.join(__dirname, "preload/bca.js"),
            nodeIntegration: true,
            contextIsolation: false,
        },
    });
    win.addBrowserView(view2);
    view2.setBounds({
        x: externalDisplay.size.width / 2,
        y: 0,
        width: externalDisplay.size.width / 2,
        height: externalDisplay.size.height / 2,
    });
    view2.webContents.loadURL(
        "https://ibank.klikbca.com/"
    );

    setTimeout(() => {
        view2.webContents.send("change-bg", "wohoooo amsuk bosku");
    }, 2000);

    view2.webContents.openDevTools()


    // untuk halaman bank BCA
    const view3 = new BrowserView({
        webPreferences: {
            preload: path.join(__dirname, "preload/spreadsheets.js"),
            nodeIntegration: true,
            contextIsolation: false,
        },
    });
    win.addBrowserView(view3);
    view3.setBounds({
        x: 0,
        y: externalDisplay.size.height / 2,
        width: externalDisplay.size.width,
        height: externalDisplay.size.height,
    });

    view3.webContents.loadURL("https://docs.google.com/spreadsheets/d/1SvtLnga1zhGDtK0mMVemdQP6EhSJkW0YOkzFcFtly_Y/edit#gid=19512665");

    setTimeout(() => {
        view3.webContents.send("change-bg", "wohoooo amsuk bosku");
    }, 2000);

    view3.webContents.openDevTools()
    

  // Open the DevTools.
  win.webContents.openDevTools()
};

app.whenReady().then(() => {
    createWindow();
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
});
