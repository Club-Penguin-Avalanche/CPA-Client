import { BrowserWindow } from "electron";
import path = require("path");
import { createAdblocker } from "./adblocker";
import {
  checkIfLoadedFromProtocol,
  getUrlFromCommandLineProcess,
} from "./protocol";
import { Store } from "./store";
import { getUrlFromStore } from "./urlchanger";

export const toggleFullScreen = (store: Store, mainWindow: BrowserWindow) => {
  const fullScreen = !store.private.get("fullScreen") ?? false;

  store.private.set("fullScreen", fullScreen);

  mainWindow.setFullScreen(fullScreen);
};

interface FiveIconByPlatforms {
  [key: string]: () => void;
}

const createWindow = async (store: Store) => {
  const setFaviconByPlatform: FiveIconByPlatforms = {
    win32: () => {
      mainWindow.setIcon(path.join(__dirname, "assets/favicon.ico"));
    },
    darwin: () => {
      mainWindow.setIcon(path.join(__dirname, "assets/icon.png"));
    },
    linux: () => {
      mainWindow.setIcon(path.join(__dirname, "assets/icon.png"));
    },
  };

  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    title: "Iniciando...",
    webPreferences: {
      plugins: true,
    },
  });

  setFaviconByPlatform[process.platform]();

  mainWindow.setMenu(null);
  mainWindow.maximize();

  await createAdblocker(store, mainWindow);

  let url = "";

  if (checkIfLoadedFromProtocol()) {
    url = getUrlFromCommandLineProcess();
  } else {
    url = getUrlFromStore(store);
  }

  mainWindow.loadURL(url);

  return mainWindow;
};

export default createWindow;
