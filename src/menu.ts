import { BrowserWindow, Menu, MenuItem, MenuItemConstructorOptions } from "electron";
import { enableOrDisableAdblocker } from "./adblocker";
import clearCache from "./cache";
import openDevTools from "./dev-tools";
import { enableOrDisableDiscordRPC, enableOrDisableDiscordRPCLocationTracking } from "./discord";
import { Store } from "./store";
import changeClubPenguinUrl from "./urlchanger";

const createMenuTemplate = (store: Store, mainWindow: BrowserWindow): MenuItemConstructorOptions[] => {
  const options = {
    id: '1',
    label: 'Options',
    submenu: [
      {
        label: 'Clear cache',
        click: () => { clearCache(mainWindow); }
      },
      {
        label: 'Open dev tools',
        accelerator: 'CommandOrControl+Shift+I',
        click: () => { openDevTools(mainWindow); }
      },
      {
        label: 'Change Club Penguin URL',
        click: () => { changeClubPenguinUrl(store, mainWindow); }
      },
      {
        label: 'Reload',
        accelerator: 'F5',
        click: () => { mainWindow.reload(); }
      },
      {
        label: 'Reload without cache',
        accelerator: 'CommandOrControl+R',
        click: () => { mainWindow.webContents.reloadIgnoringCache(); }
      }
    ]
  };

  const adblock = {
    id: '2',
    label: 'Adblock',
    submenu: [
      {
        label: 'Enable/Disable Adblock',
        click: () => { enableOrDisableAdblocker(store, mainWindow); }
      }
    ]
  };

  const discord = {
    id: '3',
    label: 'Discord',
    submenu: [
      {
        label: 'Enable/Disable Discord Rich Presence',
        click: () => { enableOrDisableDiscordRPC(store, mainWindow); }
      },
      {
        label: 'Enable/Disable Discord Rich Presence location tracking',
        click: () => { enableOrDisableDiscordRPCLocationTracking(store, mainWindow); }
      }
    ]
  };

  return [
    options,
    adblock,
    discord
  ];
};

const startMenu = (store: Store, mainWindow: BrowserWindow) => {
  const menuTemplate = createMenuTemplate(store, mainWindow);

  buildMenu(menuTemplate);
};

const buildMenu = (menuTemplate: MenuItemConstructorOptions[] | MenuItem[]) => {
  const menu = Menu.buildFromTemplate(menuTemplate);

  Menu.setApplicationMenu(menu);
};

export default startMenu;