import { app, BrowserWindow } from "electron";
import { autoUpdater } from "electron-updater";
import loadFlashPlugin from "./flash-loader";
import startMenu from "./menu";
import createWindow from "./window";

const url = 'https://play.newcp.net/';

if (process.platform === 'linux') {
  app.commandLine.appendSwitch('no-sandbox');
}

loadFlashPlugin(app);

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
autoUpdater.checkForUpdatesAndNotify();

let mainWindow: BrowserWindow;

app.on('ready', () => {
  mainWindow = createWindow(url);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  startMenu(mainWindow);
});

app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) createWindow(url);
});