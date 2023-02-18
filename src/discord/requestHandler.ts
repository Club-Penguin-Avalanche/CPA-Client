import { BrowserWindow } from "electron";
import { Store } from "../store";
import { parseAndUpdateLocation } from "./parsers/locationParser";
import { parseAndUpdateRooms } from "./parsers/roomParser";

const parseJSONP = (jsonp: string, name: string) => {
  const nameLength = name.length;

  return JSON.parse(jsonp.slice(nameLength + 1, jsonp.length - 2));
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getJsonFromParams = async (mainWindow: BrowserWindow, params: any, jsonpName: string) => {
  const response = await mainWindow.webContents.debugger.sendCommand('Network.getResponseBody', { requestId: params.requestId });

  let plainResponseBody;

  if (response.base64Encoded) {
    plainResponseBody = Buffer.from(response.body, 'base64').toString('utf8');
  } else {
    plainResponseBody = response.body;
  }

  return parseJSONP(plainResponseBody, jsonpName);
};

export const startRequestListener = (store: Store, mainWindow: BrowserWindow) => {
  try {
    mainWindow.webContents.debugger.attach('1.3');
  } catch (err) {
    console.log('Debugger attach failed: ', err);
  }

  mainWindow.webContents.debugger.on('detach', (_, reason) => {
    console.log('Debugger detached due to: ', reason);
  });

  mainWindow.webContents.debugger.on('message', async (_, method, params) => {
    if (method === 'Network.responseReceived') {

      if (params.response.url.includes(ROOMS_PATH)) {
        await parseAndUpdateRooms(store, mainWindow, params);
      }

      if (params.response.url.includes(SWF_MIME_FILE)) {
        await parseAndUpdateLocation(store, params);
      }
    }
  });

  mainWindow.webContents.debugger.sendCommand('Network.enable');
};