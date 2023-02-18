import { Client, register } from "discord-rpc";
import { BrowserWindow } from "electron";
import { Store } from "./store";
import { CPLocation, CPLocationType, DiscordState } from "./store/DiscordState";
import { getUrlFromStore } from "./urlchanger";

const ROOMS_PATH = 'rooms.jsonp';
const ROOMS_JSONP_NAME = 'cp_rooms';
const SWF_MIME_FILE = '.swf';
const SWF_ROOMS_PATH = '/rooms/';
const SWF_GAMES_PATH = '/games/';
const DISCORD_RPC_CLIENT_APP_ID = '1076298709073145907';
const LARGE_IMAGE_KEY = 'main-logo';
const UNLOGGED = 'Unlogged';
const WADDLING = 'Waddling';
const CPPS_MAP = new Map([
  ['newcp.net', 'New Club Penguin'],
  ['cpbrasil.pw', 'Club Penguin Brasil'],
  ['supercpps.com', 'Super Club Penguin'],
  ['aventurepingouin.com', 'Aventure Pingouin'],
]);

const isNumeric = (value: string) => {
  return ((value != null) &&
    (value !== '') &&
    !isNaN(Number(value.toString())));
};

const getDiscordRPCEnabledFromStore = (store: Store) => {
  return store.public.get('enableDiscord');
};

const getDiscordRPCTrackingEnabledFromStore = (store: Store) => {
  return store.public.get('enableDiscordTracker');
};


const getDiscordStateFromStore = (store: Store) => {
  return store.private.get('discordState') ?? { };
};

const setDiscordStateInStore = (store: Store, state: DiscordState) => {
  store.private.set('discordState', state);
};

const setLocationsInStore = (store: Store, locations: CPLocation[]) => {
  const state = getDiscordStateFromStore(store);

  state.trackedLocations = locations;

  setDiscordStateInStore(store, state);
};

const setUnloggedStatus = (state: DiscordState) => {
  return state.client.setActivity({
    details: state.gameName,
    state: UNLOGGED,
    startTimestamp: state.startTimestamp,
    largeImageKey: LARGE_IMAGE_KEY,
  });
};

const setLocationStatus = (state: DiscordState, location: CPLocation) => {
  return state.client.setActivity({
    details: state.gameName,
    state: location.name,
    startTimestamp: state.startTimestamp,
    largeImageKey: LARGE_IMAGE_KEY,
  });
};

const parseJSONP = (jsonp: string, name: string) => {
  const nameLength = name.length;

  return JSON.parse(jsonp.slice(nameLength + 1, jsonp.length - 2));
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getJsonFromParams = async (mainWindow: BrowserWindow, params: any) => {
  const response = await mainWindow.webContents.debugger.sendCommand('Network.getResponseBody', { requestId: params.requestId });

  let plainResponseBody;

  if (response.base64Encoded) {
    plainResponseBody = Buffer.from(response.body, 'base64').toString('utf8');
  } else {
    plainResponseBody = response.body;
  }

  return parseJSONP(plainResponseBody, ROOMS_JSONP_NAME);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const parseAndUpdateRooms = async (store: Store, mainWindow: BrowserWindow, params: any) => {
  const json = await getJsonFromParams(mainWindow, params);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rooms = Object.values(json) as any[];

  const cpLocations: CPLocation[] = [];

  for (const room of rooms) {
    const id = Number(room.room_id);
    let name = String(room.display_name);

    // When in an igloo the display name is 'igloo_card'.
    if (name.toLowerCase() === 'igloo_card') {
      name = 'Igloo';
    }

    // Fire, water and snow dojos has bugged names.
    if (name.toLowerCase() === "Dojo Fire") {
      name = 'Fire Dojo';
    }

    if (name.toLowerCase() === "Dojo Water") {
      name = 'Water Dojo';
    }

    if (name.toLowerCase() === "CJ Snow Dojo") {
      name = 'Snow Dojo';
    }

    // Snow Card Jitsu has empty display name.
    if (room.name.toLowerCase() === 'snow') {
      name = "Card'jitsu Snow";
    }

    let key = room.room_key ? String(room.room_key) : undefined;

    let type = key ? CPLocationType.Room : CPLocationType.Game;

    // For any reason sled race comes with the key 'party19'.
    if (name.toLowerCase() === 'sled race') {
      key = '';
      type = CPLocationType.Game;
    }

    let match: string;

    if (key) {
      match = key;
    } else {
      match = String(room.name.toLowerCase().replace(' ', ''));
    }

    // The match of the 'sled race' minigame is 'sled'.
    if (name.toLowerCase() === 'sled race') {
      match = 'sled';
    }

    // The match of the 'bits and bolts' minigame is 'robots'.
    if (name.toLowerCase() === 'bits and bolts') {
      match = 'robots';
    }
    
    // The match of the 'card jitsu' minigame is 'card'.
    if (name.toLowerCase() === 'card jitsu') {
      match = 'card';
    }

    const cpLocation: CPLocation = {
      id: id,
      name: name,
      key: key,
      type: type,
      match: match,
    };

    cpLocations.push(cpLocation);
  }

  setLocationsInStore(store, cpLocations);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const parseAndUpdateLocation = async (store: Store, params: any) => {
  const url = params.response.url as string;

  if (!url.includes(SWF_ROOMS_PATH) && !url.includes(SWF_GAMES_PATH)) {
    return;
  }

  const swfMimeIndex = url.indexOf(SWF_MIME_FILE);
  const lastBarIndex = url.lastIndexOf('/');

  const fileName = url.substring(lastBarIndex + 1, swfMimeIndex);

  // If file name is numeric we won't update the location because games like card jitsu
  // can share the same swf as other games.
  if (isNumeric(fileName)) {
    return;
  }

  const swfPathType = url.includes(SWF_ROOMS_PATH)
    ? SWF_ROOMS_PATH
    : SWF_GAMES_PATH;

  const swfPathIndex = url.lastIndexOf(swfPathType) + swfPathType.length;

  const match = swfPathType === SWF_GAMES_PATH
    ? url.substring(swfPathIndex, url.indexOf(fileName + SWF_MIME_FILE) - 1)
    : url.substring(swfPathIndex, swfMimeIndex);

  // if the match contains any '/' it is a subpath resource, just ignore it.
  if (match.includes('/')) {
    return;
  }

  const state = getDiscordStateFromStore(store);

  // The location don't changed.
  if (state.currentLocation && state.currentLocation.match === match) {
    return;
  }

  const location = state.trackedLocations.filter(location => {
    return location.match === match;
  })[0];

  state.currentLocation = location;

  if (!location) {
    await setUnloggedStatus(state);
  } else {
    await setLocationStatus(state, location);
  }

  setDiscordStateInStore(store, state);
};

const startRequestListener = (store: Store, mainWindow: BrowserWindow) => {
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

export const startDiscordRPC = (store: Store, mainWindow: BrowserWindow) => {
  if (!getDiscordRPCEnabledFromStore(store)) {
    return;
  }

  const url = new URL(getUrlFromStore(store));

  const hostName = url.hostname.indexOf('.') === url.hostname.lastIndexOf('.')
    ? url.hostname
    : url.hostname.split('.').slice(-2).join('.');

  const gameName = CPPS_MAP.get(hostName) ?? 'Club Penguin';
  const startTimestamp = new Date();

  register(DISCORD_RPC_CLIENT_APP_ID);

  const client = new Client({
    transport: 'ipc',
  });

  setDiscordStateInStore(store, {
    client: client,
    gameName: gameName,
    startTimestamp: startTimestamp,
  });

  const rpcTrackingEnabled = getDiscordRPCTrackingEnabledFromStore(store);

  client.on('ready', () => { 
    client.setActivity({
      details: gameName,
      state: rpcTrackingEnabled ? UNLOGGED : WADDLING,
      startTimestamp: startTimestamp,
      largeImageKey: LARGE_IMAGE_KEY,
    });
  });

  client.login({
    clientId: DISCORD_RPC_CLIENT_APP_ID
  }).catch(console.error);

  if (!rpcTrackingEnabled) {
    return;
  }

  startRequestListener(store, mainWindow);
};