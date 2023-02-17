import { BrowserWindow } from "electron";
import path = require("path");
import { createAdblocker } from "./adblocker";
import { Store } from "./store";

const createWindow = async (store: Store) => {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    title: "Starting...",
    icon: path.join(__dirname, 'assets/favicon.ico'),
    webPreferences: {
      plugins: true
    }
  });

  mainWindow.setMenu(null);
  mainWindow.maximize();

  await createAdblocker(store, mainWindow);
  
  mainWindow.loadURL(store.public.get('url'));

  return mainWindow;
};

export default createWindow;