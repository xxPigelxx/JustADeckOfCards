import { cleanPlayerName } from "@/shared/protocol";
import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY_NAME = "player_name";

// Optional player name, remembered for the next game
export const loadPlayerName = async () => {
  try {
    return cleanPlayerName(await AsyncStorage.getItem(KEY_NAME));
  } catch {
    return null;
  }
};

export const savePlayerName = async (name: string | null) => {
  try {
    if (name) await AsyncStorage.setItem(KEY_NAME, name);
    else await AsyncStorage.removeItem(KEY_NAME);
  } catch (e) {
    console.error("Fehler beim Speichern des Namens", e);
  }
};
