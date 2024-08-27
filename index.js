const { app, BrowserWindow, ipcMain, globalShortcut } = require('electron');
const path = require('node:path');
const child_process = require("node:child_process");

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

let mainWindow = null;
const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      // Mandatory for doing node.js work in the render process
      contextIsolation: false,
      nodeIntegration: true,
      nodeIntegrationInWorker: true,
      webPreferences: {
        webSecurity: false
      }
    },
  });

  mainWindow.setMenu(null)

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();
  mainWindow.setFullScreen(true);
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();

  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });

  globalShortcut.register("Ctrl+Esc", killChild)
});

let child = null
let monitor = null

// Executes a file passed by the render process. Used on button click.
ipcMain.on('exec', (event, file, immortal) => {
  mainWindow.minimize()
  child = child_process.execFile(file, () => {
    mainWindow.restore()
  })
  if (!immortal) {
    monitor = child_process.exec("python " + "static/idlemonitor.py",
      (err) => {
        killChild()
      })
  }
})

// Terminates child process
function killChild() {
  child_process.exec('taskkill /F /im Protokrieg_Live.exe')
  child_process.exec('taskkill /F /im taskkill /F /im bigTeamBlue-Win64-Shipping.exe')
  child_process.exec('taskkill /F /im SwordStrikeSpaceVampires.exe')
  if (child != null && !child.killed) {
    console.log(child.kill())
    mainWindow.restore()
  }
  if (monitor != null && !child.killed) {
    monitor.kill()
  }
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
