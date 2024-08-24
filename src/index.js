const { app, BrowserWindow, ipcMain, globalShortcut } = require('electron');
const path = require('node:path');
const child_process = require("node:child_process")

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
      nodeIntegrationInWorker: true
    },
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // Open the DevTools.
  mainWindow.webContents.openDevTools();

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
});

let child = null

// Executes a file passed by the render process. Used on button click.
ipcMain.on('exec', (event, file) => {
  mainWindow.minimize()
  child = child_process.execFile(file, () => {
    mainWindow.restore()
  })
})

// Terminates child process
ipcMain.on("killChild", () => {
  if (child != null && !child.killed) {
    console.log(child.kill())
    mainWindow.restore()
  }
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
/*
globalShortcut.registerAll(
  ['a','b','c','d','e','f','g','h','i','j',
   'k','l','m','n','o','p','q','r','s','t',
   'u','v','w','x','y','z',
   '0','1','2','3','4','5','6','7','8','9',
   '`','~','!','@','#','$','%','^','&','*',
   '(',')','-','_','=','+',';','[',']','\\',':',
   '{','}','|','i','\'','I','\"',',','.','/','<','>','?',
  'Space', 'Tab', 'Backspace','Delete','Enter',
  'Up','Down','Left','Right',
  'num0','num1','num2','num3','num4','num5','num6','num7','num8','num9'],
  () => ipcMain.send("hotkey"))*/