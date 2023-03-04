import { BrowserWindow, Menu, MenuItem, MenuItemConstructorOptions } from "electron";
import { enableOrDisableAdblocker } from "./adblocker";
import clearCache from "./cache";
import openDevTools from "./dev-tools";
import { enableOrDisableDiscordRPC, enableOrDisableDiscordRPCLocationTracking } from "./discord";
import { Store } from "./store";
import changeClubPenguinUrl from "./urlchanger";
import { toggleFullScreen } from "./window";

const createMenuTemplate = (store: Store, mainWindow: BrowserWindow): MenuItemConstructorOptions[] => {
  const options: MenuItemConstructorOptions = {
    id: '1',
    label: 'Opções',
    submenu: [
      {
        label: 'Limpar cache',
        click: () => { clearCache(mainWindow); }
      },
      {
        label: 'Abrir dev tools',
        accelerator: 'CommandOrControl+Shift+I',
        click: () => { openDevTools(mainWindow); }
      },
      {
        label: 'Mudar a URL do Club Penguin',
        click: () => { changeClubPenguinUrl(store, mainWindow); }
      },
      {
        label: 'Recarregar',
        accelerator: 'F5',
        role: 'reload',
      },
      {
        label: 'Recarregar sem Cache',
        accelerator: 'CommandOrControl+R',
        click: () => { mainWindow.webContents.reloadIgnoringCache(); }
      },
      {
        label: 'Alternar Tela Cheia',
        accelerator: 'F11',
        click: () => { toggleFullScreen(store, mainWindow); }
      },
      { 
        label: 'Aumentar o Zoom',
        role: 'zoomIn',
        accelerator: 'CommandOrControl+=',
      },
      {
        label: 'Diminuir o Zoom',
        role: 'zoomOut',
        accelerator: 'CommandOrControl+-',
      },

      {
        label: 'Resetar o Zoom',
        role: 'resetZoom',
        accelerator: 'CommandOrControl+0',
      },
    ]
  };

  const adblock: MenuItemConstructorOptions = {
    id: '2',
    label: 'Adblock',
    submenu: [
      {
        label: 'Ativar/Desativar Adblock',
        click: () => { enableOrDisableAdblocker(store, mainWindow); }
      }
    ]
  };

  const discord: MenuItemConstructorOptions = {
    id: '3',
    label: 'Discord',
    submenu: [
      {
        label: 'Ativar/Desativar Discord Rich Presence',
        click: () => { enableOrDisableDiscordRPC(store, mainWindow); }
      },
      {
        label: 'Ativar/Desativar rastreamente de sala no Discord Rich Presence',
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