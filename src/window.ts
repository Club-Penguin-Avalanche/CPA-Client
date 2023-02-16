import { BrowserWindow } from "electron";
import path = require("path");

const createWindow = (url: string) => {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    title: "Starting...",
    icon: path.join(__dirname, 'assets/favicon.ico'),
    webPreferences: {
      plugins: true
    }
  });
  mainWindow.maximize();

  mainWindow.setMenu(null);
  mainWindow.loadURL(url);

  return mainWindow;
};

export default createWindow;