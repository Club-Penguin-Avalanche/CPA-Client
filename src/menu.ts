import { BrowserWindow, Menu, MenuItem, MenuItemConstructorOptions } from "electron";
import clearCache from "./cache";
import openDevTools from "./dev-tools";

const createMenuTemplate = (mainWindow: BrowserWindow): MenuItemConstructorOptions[] => {
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

  return [
    options,
  ];
};

const startMenu = (mainWindow: BrowserWindow) => {
  const menuTemplate = createMenuTemplate(mainWindow);

  buildMenu(menuTemplate);
};

const buildMenu = (menuTemplate: MenuItemConstructorOptions[] | MenuItem[]) => {
  const menu = Menu.buildFromTemplate(menuTemplate);

  Menu.setApplicationMenu(menu);
};

export default startMenu;