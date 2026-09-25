import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY_SECRET = "player_secret";
const CHARS = "abcdefghijklmnopqrstuvwxyz0123456789";

let cached: string | null = null;

// Random id of this device, kept between app starts. The server uses it to
// give a player their seat back after reconnecting; it is never shown to
// other players.
export const loadPlayerSecret = async () => {
  if (cached) return cached;
  try {
    cached = await AsyncStorage.getItem(KEY_SECRET);
  } catch {
    cached = null;
  }
  if (!cached) {
    cached = Array.from(
      { length: 24 },
      () => CHARS[Math.floor(Math.random() * CHARS.length)],
    ).join("");
    try {
      await AsyncStorage.setItem(KEY_SECRET, cached);
    } catch (e) {
      console.error("Fehler beim Speichern der Spieler-ID", e);
    }
  }
  return cached;
};
