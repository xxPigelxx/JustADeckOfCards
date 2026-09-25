import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY_ROOM = "current_room";

// Code of the room this device is in, so the game can be resumed after the
// app was closed or the page reloaded
export const loadCurrentRoom = async () => {
  try {
    return await AsyncStorage.getItem(KEY_ROOM);
  } catch {
    return null;
  }
};

export const saveCurrentRoom = async (code: string | null) => {
  try {
    if (code) await AsyncStorage.setItem(KEY_ROOM, code);
    else await AsyncStorage.removeItem(KEY_ROOM);
  } catch (e) {
    console.error("Fehler beim Speichern des Spiels", e);
  }
};
