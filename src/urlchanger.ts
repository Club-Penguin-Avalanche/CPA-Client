import { BrowserWindow, dialog } from "electron";
import { Store } from "./store";
import prompt from 'electron-prompt';

export const getUrlFromStore = (store: Store) => {
  return store.public.get('url');
};

const setUrlFromStore = (store: Store, url: string) => {
  store.public.set('url', url);
};

const changeClubPenguinUrl = async (store: Store, mainWindow: BrowserWindow) => {
  const url = getUrlFromStore(store);

  const confirmationResult = await dialog.showMessageBox(mainWindow, {
    buttons: ['Yes', 'No', 'Cancel'],
    title: 'Do you really want to change the game URL?',
    message: `The current URL is: '${url}', after setting the url the page will reload.`,
  });

  if (confirmationResult.response !== 0) {
    return;
  }

  const result = await prompt({
    title: 'Set the Club Penguin URL',
    label: 'URL:',
    value: url,
    inputAttrs: {
      type: 'url'
    },
    type: 'input',

  }, mainWindow);

  if (result === null) {
    return;
  }

  setUrlFromStore(store, result);

  mainWindow.loadURL(result);
};

export default changeClubPenguinUrl;