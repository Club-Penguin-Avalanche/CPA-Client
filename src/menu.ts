import { BrowserWindow, Menu, MenuItem, MenuItemConstructorOptions } from "electron";
import { enableOrDisableAdblocker } from "./adblocker";
import clearCache from "./cache";
import openDevTools from "./dev-tools";
import { Store } from "./store";

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
        click: () => { openDevTools(mainWindow); }
      },
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

  return [
    options,
    adblock
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