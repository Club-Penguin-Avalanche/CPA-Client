import { Client, register } from "discord-rpc";
import { BrowserWindow, dialog } from "electron";
import { EOL } from "os";
import { CPPS_MAP, DISCORD_RPC_CLIENT_APP_ID, LARGE_IMAGE_KEY, UNLOGGED, WADDLING } from "./discord/constants";
import { startRequestListener } from "./discord/requestHandler";
import { Store } from "./store";
import { CPLocation, CPLocationType, DiscordState } from "./store/DiscordState";
import { getUrlFromStore } from "./urlchanger";

const getDiscordRPCEnabledFromStore = (store: Store) => {
  return store.public.get('enableDiscord');
};

const getDiscordRPCTrackingEnabledFromStore = (store: Store) => {
  return store.public.get('enableDiscordTracker');
};

const updateDiscordRPCEnabledInStore = (store: Store) => {
  store.public.set('enableDiscord', !getDiscordRPCEnabledFromStore(store));
};

const updateDiscordRPCTrackingEnabledInStore = (store: Store) => {
  store.public.set('enableDiscordTracker', !getDiscordRPCTrackingEnabledFromStore(store));
};

export const getDiscordStateFromStore = (store: Store) => {
  return store.private.get('discordState') ?? { };
};

export const setDiscordStateInStore = (store: Store, state: DiscordState) => {
  store.private.set('discordState', state);
};

export const setLocationsInStore = (store: Store, locations: CPLocation[]) => {
  const state = getDiscordStateFromStore(store);

  state.trackedLocations = locations;

  setDiscordStateInStore(store, state);
};

export const setUnloggedStatus = (state: DiscordState) => {
  return state.client.setActivity({
    details: state.gameName,
    state: UNLOGGED,
    startTimestamp: state.startTimestamp,
    largeImageKey: LARGE_IMAGE_KEY,
  });
};

const setWaddlingStatus = (state: DiscordState) => {
  return state.client.setActivity({
    details: state.gameName,
    state: WADDLING,
    startTimestamp: state.startTimestamp,
    largeImageKey: LARGE_IMAGE_KEY,
  });
};

export const setUnknownLocationStatus = (state: DiscordState, match: string) => {
  const result = match.replace(/([A-Z])/g, " $1");
  const finalResult = result.charAt(0).toUpperCase() + result.slice(1);

  return state.client.setActivity({
    details: state.gameName,
    state: `Waddling at ${finalResult}`,
    startTimestamp: state.startTimestamp,
    largeImageKey: LARGE_IMAGE_KEY,
  });
};

export const setLocationStatus = (state: DiscordState, location: CPLocation) => {
  let msgPrefix: string;

  if (location.name.toLowerCase().includes('sensei')) {
    msgPrefix = 'Talking with ';
  } else if (location.type === CPLocationType.Game) {
    msgPrefix = 'Playing ';
  } else if (location.name.toLowerCase().includes('igloo')) {
    msgPrefix = 'Visiting an ';
  } else {
    msgPrefix = 'Waddling at ';
  }

  const locationMsg = msgPrefix + location.name;

  return state.client.setActivity({
    details: state.gameName,
    state: locationMsg,
    startTimestamp: state.startTimestamp,
    largeImageKey: LARGE_IMAGE_KEY,
  });
};

const getGameName = (store: Store) =>  {
  const url = new URL(getUrlFromStore(store));

  const hostName = url.hostname.indexOf('.') === url.hostname.lastIndexOf('.')
    ? url.hostname
    : url.hostname.split('.').slice(-2).join('.');

  return CPPS_MAP.get(hostName) ?? 'Club Penguin';
};

const registerWindowReload = (store: Store, mainWindow: BrowserWindow) => {
  const tempState = getDiscordStateFromStore(store);

  if (tempState.windowReloadRegistered) {
    return;
  }

  tempState.windowReloadRegistered = true;

  setDiscordStateInStore(store, tempState);

  mainWindow.webContents.on('did-start-loading', () => {
    if (!getDiscordRPCEnabledFromStore(store)) { 
      return;
    }

    const state = getDiscordStateFromStore(store);

    // In case URL changed
    state.gameName = getGameName(store);

    setUnloggedStatus(state);

    setDiscordStateInStore(store, state);
  });
};

export const startDiscordRPC = (store: Store, mainWindow: BrowserWindow) => {
  if (!getDiscordRPCEnabledFromStore(store)) {
    return;
  }

  const gameName = getGameName(store);
  const startTimestamp = new Date();

  register(DISCORD_RPC_CLIENT_APP_ID);

  const client = new Client({
    transport: 'ipc',
  });

  setDiscordStateInStore(store, {
    client: client,
    gameName: gameName,
    startTimestamp: startTimestamp,
    windowReloadRegistered: false,
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

  registerWindowReload(store, mainWindow);

  startRequestListener(store, mainWindow);
};

export const stopDiscordRPC = (store: Store) => {
  const state = getDiscordStateFromStore(store);

  if (!state || !state.client) {
    return;
  }

  state.client.destroy();

  setDiscordStateInStore(store, {});
};

export const enableOrDisableDiscordRPC = async (store: Store, mainWindow: BrowserWindow) => {

  if (!getDiscordRPCEnabledFromStore(store)) {
    const confirmationEnableResult = await dialog.showMessageBox(mainWindow, {
      buttons: ['Yes', 'No', 'Cancel'],
      title: 'Do you really want to enable Discord Reach Presence?',
      message: `This change needs to reload the page to be effective (only if location tracking enabled).`,
    });

    if (confirmationEnableResult.response !== 0) {
      return;
    }
  }

  updateDiscordRPCEnabledInStore(store);

  if (getDiscordRPCEnabledFromStore(store) && getDiscordRPCTrackingEnabledFromStore(store)) {
    startDiscordRPC(store, mainWindow);

    mainWindow.reload();

    return;
  } else if (!getDiscordRPCEnabledFromStore(store)) {
    stopDiscordRPC(store);

    return;
  }

  const confirmationTrackingEnableResult = await dialog.showMessageBox(mainWindow, {
    buttons: ['Yes', 'No', 'Cancel'],
    title: 'Do you want to enable Discord Reach Presence location tracking?',
    message: `Your peguin location will be exposed on discord.`,
  });

  if (confirmationTrackingEnableResult.response !== 0) {
    return;
  }

  updateDiscordRPCTrackingEnabledInStore(store);

  startDiscordRPC(store, mainWindow);

  mainWindow.reload();
};

export const enableOrDisableDiscordRPCLocationTracking = async (store: Store, mainWindow: BrowserWindow) => {
  if (!getDiscordRPCTrackingEnabledFromStore(store)) {
    const confirmationTrackingEnableResult = await dialog.showMessageBox(mainWindow, {
      buttons: ['Yes', 'No', 'Cancel'],
      title: 'Do you want to enable Discord Reach Presence location tracking?',
      message: `Your peguin location will be exposed on discord.${EOL}`,
    });

    if (confirmationTrackingEnableResult.response !== 0) {
      return;
    }
  }

  updateDiscordRPCTrackingEnabledInStore(store);

  if (!getDiscordRPCTrackingEnabledFromStore(store)) {
    setWaddlingStatus(getDiscordStateFromStore(store));

    return;
  }

  setUnloggedStatus(getDiscordStateFromStore(store));

  mainWindow.reload();
};