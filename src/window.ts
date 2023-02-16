import { BrowserWindow } from "electron";

const createWindow = (url: string) => {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    title: "Connecting...",
    icon: __dirname + '/assets/favicon.ico',
    webPreferences: {
      //preload: path.join(__dirname, 'preload.js'),
      plugins: true
    }
  });
  mainWindow.maximize();

  mainWindow.setMenu(null);
  mainWindow.loadURL(url);

  return mainWindow;
};

export default createWindow;