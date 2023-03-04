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
    buttons: ['Sim', 'Não', 'Cancelar'],
    title: 'Você realmente deseja alterar a URL do jogo?',
    message: `A URL atual é: '${url}', após alterar essa URL a página irá reiniciar.`,
  });

  if (confirmationResult.response !== 0) {
    return;
  }

  const result = await prompt({
    title: 'Altere a URL do Club Penguin',
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