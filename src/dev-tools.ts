import { BrowserWindow } from "electron";

const openDevTools = (mainWindow: BrowserWindow) => {
  mainWindow.webContents.openDevTools();
};

export default openDevTools;