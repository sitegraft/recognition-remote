const path = require('path');
const url = require('url');
const { app, BrowserWindow } = require('electron');
const robot = require("robotjs");
const posenet = require('@tensorflow-models/posenet');
const iconPath = path.join(__dirname, "build", "icon.png");

function createWindow() {
  // Create the browser window.
  const win = new BrowserWindow({
    icon: iconPath,
    transparent: true,
    alwaysOnTop: true,
    resizable:false,
    width: /*robot.getScreenSize().width*/210,
    height: 210,
    titleBarStyle: "none",
    webPreferences: {
      nodeIntegration: true,
      backgroundThrottling: false
    },
    x:0,
    y:0,
    frame: false
  })
  
  win.loadURL(url.format({
    //pathname: path.join(__dirname, 'index.html'),
    pathname: path.join(__dirname, 'indexnew.html'),
    protocol: 'file:',
    slashes: true
  }));
  win.removeMenu();

  win.setAlwaysOnTop(true, 'screen');
  win.removeMenu();
  //win.webContents.openDevTools()
}
//add parameters to osk to dock

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.allowRendererProcessReuse = false;
app.whenReady().then(createWindow)