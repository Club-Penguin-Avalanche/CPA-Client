import { BrowserWindow } from "electron";
import { setLocationsInStore } from "../../discord";
import { Store } from "../../store";
import { CPLocation, CPLocationType } from "../../store/DiscordState";
import { ROOMS_JSONP_NAME } from "../constants";
import { getJsonFromParams } from "../requestHandler";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const parseAndUpdateRooms = async (store: Store, mainWindow: BrowserWindow, params: any) => {
  const json = await getJsonFromParams(mainWindow, params, ROOMS_JSONP_NAME);

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