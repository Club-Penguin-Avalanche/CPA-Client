import { app, BrowserWindow } from "electron";
import log from "electron-log";
import { autoUpdater } from "electron-updater";
import { startDiscordRPC } from "./discord";
import loadFlashPlugin from "./flash-loader";
import startMenu from "./menu";
import { getUrlFromCommandLine } from "./protocol";
import createStore from "./store";
import createWindow from "./window";

log.initialize();

console.log = log.log;

if (!app.requestSingleInstanceLock()) {
  app.quit();
  process.exit(0);
}

const store = createStore();

if (process.platform === 'linux') {
  app.commandLine.appendSwitch('no-sandbox');
}


loadFlashPlugin(app);

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
autoUpdater.checkForUpdatesAndNotify();

let mainWindow: BrowserWindow;

// Someone tried to run a second instance, we should focus our window.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.on("second-instance", (_, commandLine, ___) => {
  if (!mainWindow) {
    return;
  }

  if (mainWindow.isMinimized()) {
    mainWindow.restore();
  }

  mainWindow.focus();

  const url = getUrlFromCommandLine(commandLine);

  mainWindow.loadURL(url);
});

app.on('ready', async () => {
  mainWindow = await createWindow(store);

  // Some users was reporting problems with cache.
  await mainWindow.webContents.session.clearHostResolverCache();

  startMenu(store, mainWindow);

  startDiscordRPC(store, mainWindow);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
});

// Handle the protocol on MacOS.
app.on('open-url', (event, url) => {
  event.preventDefault();
  
  mainWindow.loadURL(url.replace('cpavalanche://', 'https://play.cpavalanche.net/'));
});


app.setAsDefaultProtocolClient("cpavalanche");

app.on('window-all-closed', async () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    const discordClient = store.private.get('discordState')?.client;

    if (discordClient) {
      await discordClient.destroy();
    }

    app.quit();

    process.exit(0);
  }
});

app.on('activate', async () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    mainWindow = await createWindow(store);
  }
});