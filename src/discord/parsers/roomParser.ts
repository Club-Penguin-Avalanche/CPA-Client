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

    // Smoothie smash game name was incomplete.
    if (name.toLowerCase() === 'smoothie') {
      name = 'Smoothie Smash';
    }

    // Fire, water and snow dojos has bugged names.
    if (name.toLowerCase() === "dojo fire") {
      name = 'Fire Dojo';
    }

    if (room.room_key.toLowerCase() === "dojowater") {
      name = 'Water Dojo';
    }

    if (name.toLowerCase() === "cj snow dojo") {
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

    // Igloo don't have 'room_key'.
    if (name.toLowerCase() === 'igloo') {
      type = CPLocationType.Room;
    }

    let match: string;

    if (key) {
      match = key;
    } else {
      match = String(room.name.toLowerCase().replace(' ', ''));
    }

    // If the game is a EPF quest we need to replace the 'mission' word to 'q' (quest) in match.
    if (name.toLowerCase().includes('mission')) {
      match = room.name.toLowerCase().replace('mission', 'q');
    }

    // The match of the 'sled race' minigame is 'sled'.
    if (name.toLowerCase() === 'sled race') {
      match = 'sled';
    }

    // The match of the 'system defender' minigame is 'sled'.
    if (name.toLowerCase() === 'system defender') {
      match = 'tower';
    }

    // The match of the 'bits and bolts' minigame is 'robots'.
    if (name.toLowerCase() === 'bits and bolts') {
      match = 'robots';
    }

    // The match of the "Catchin' Waves" minigame is 'waves'.
    if (name.toLowerCase() === "catchin' waves") {
      match = 'waves';
    }

    // The match of the 'Hydro Hopper' minigame is 'hydro'.
    if (name.toLowerCase() === 'hydro hopper') {
      match = 'hydro';
    }

    // The match of the 'Puffle Roundup' minigame is 'roundup'.
    if (name.toLowerCase() === 'puffle roundup') {
      match = 'roundup';
    }

    // The match of the 'Puffle Rescue' minigame is 'rescue'.
    if (name.toLowerCase() === 'puffle rescue') {
      match = 'rescue';
    }

    // The match of the 'Aqua Grabber' minigame is 'sub'.
    if (name.toLowerCase() === 'aqua grabber') {
      match = 'sub';
    }

    // The match of the 'card jitsu' minigame is 'card'.
    if (name.toLowerCase() === 'card jitsu') {
      match = 'card';
    }

    // The match of the 'fire sensei' room is 'card'.
    if (name.toLowerCase() === 'fire sensei') {
      match = 'senseifire';
    }

    // The match of the 'igloo' room is 'igloo'.
    if (name.toLowerCase() === 'igloo') {
      match = 'igloo';
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