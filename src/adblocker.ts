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
      buttons: ['Yes', 'No', 'Cancel'],
      title: 'Do you really want to disable ads?',
      message: 'The game devs needs money to keep the game alive.',
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
    buttons: ['Yes', 'No', 'Cancel'],
    title: 'Reload the page?',
    message: 'This change needs to reload the page to be effective.',
  });

  if (reloadResult.response === 0) {
    mainWindow.reload();
  }
};

