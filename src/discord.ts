import { Client, register } from "discord-rpc";
import { BrowserWindow } from "electron";
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

export const setLocationStatus = (state: DiscordState, location: CPLocation) => {
  let msgPrefix: string;

  if (location.name.includes('sensei')) {
    msgPrefix = 'Talking with ';
  } else if (location.type === CPLocationType.Game) {
    msgPrefix = 'Playing ';
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