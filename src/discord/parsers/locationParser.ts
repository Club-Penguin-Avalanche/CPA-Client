import { getDiscordStateFromStore, setDiscordStateInStore, setLocationStatus, setUnloggedStatus } from "../../discord";
import { Store } from "../../store";
import { SWF_GAMES_PATH, SWF_MIME_FILE, SWF_ROOMS_PATH } from "../constants";

const isNumeric = (value: string) => {
  return ((value != null) &&
    (value !== '') &&
    !isNaN(Number(value.toString())));
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const parseAndUpdateLocation = async (store: Store, params: any) => {
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