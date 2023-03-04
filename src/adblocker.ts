import { ElectronBlocker } from '@cliqz/adblocker-electron';
import fetch from 'cross-fetch'; // required 'fetch'
import { BrowserWindow, dialog } from 'electron';
import { Store } from './store';

const setBlockerInStore = (store: Store, blocker: ElectronBlocker) => {
  store.private.set('blocker', blocker);
};

const getBlockerFromStore = (store: Store) => {
  return store.private.get('blocker');
};

const checkIfAdblockerIsEnabled = (store: Store) => {
  return store.public.get('disableAds');
};

const updateAdblockerIsEnabled = (store: Store) => {
  store.public.set('disableAds', !checkIfAdblockerIsEnabled(store));
};

const startAdblocker = (mainWindow: BrowserWindow, blocker: ElectronBlocker) => {
  blocker.enableBlockingInSession(mainWindow.webContents.session);
};

const stopAdblocker = (mainWindow: BrowserWindow, blocker: ElectronBlocker) => {
  blocker.disableBlockingInSession(mainWindow.webContents.session);
};

export const createAdblocker = async (store: Store, mainWindow: BrowserWindow) => {
  const blocker = await ElectronBlocker.fromPrebuiltAdsAndTracking(fetch);

  setBlockerInStore(store, blocker);

  // Start Adblocker if is enabled.
  if (checkIfAdblockerIsEnabled(store)) {
    startAdblocker(mainWindow, blocker);
  }
};

export const enableOrDisableAdblocker = async (store: Store, mainWindow: BrowserWindow) => {
  const blocker = getBlockerFromStore(store);

  if (!checkIfAdblockerIsEnabled(store)) {
    const confirmationResult = await dialog.showMessageBox(mainWindow, {
      buttons: ['Sim', 'Não', 'Cancelar'],
      title: 'Você realmente deseja desativar os ads?',
      message: 'Os desenvolvedores do jogo dependem de dinheiro para o manter vivo.',
    });
    
    if (confirmationResult.response !== 0) {
      return;
    }

    startAdblocker(mainWindow, blocker);
  } else { 
    stopAdblocker(mainWindow, blocker);
  }

  updateAdblockerIsEnabled(store);

  const reloadResult = await dialog.showMessageBox(mainWindow, {
    buttons: ['Sim', 'Não', 'Cancelar'],
    title: 'Recarregar a página?',
    message: 'Essa alteração precisa que a página recarregue para ser efetiva.',
  });

  if (reloadResult.response === 0) {
    mainWindow.reload();
  }
};

