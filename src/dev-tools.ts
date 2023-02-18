import { BrowserWindow, dialog } from "electron";

const openDevTools = async (mainWindow: BrowserWindow) => {
  const confirmationResult = await dialog.showMessageBox(mainWindow, {
    buttons: ['Yes', 'No', 'Cancel'],
    title: 'Do you really want to open the Dev Tools?',
    message: `The Dev Tools can contains sensitive information about your game session.`,
  });

  if (confirmationResult.response !== 0) {
    return;
  }
  
  mainWindow.webContents.openDevTools();
};

export default openDevTools;