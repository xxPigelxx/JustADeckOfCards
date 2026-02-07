import AsyncStorage from "@react-native-async-storage/async-storage";

export const DEFAULT_BACK_COLOR = "#3b82f6";
export const DEFAULT_PATTERN = "none";

const KEY_COLOR = "card_back_color";
const KEY_PATTERN = "card_back_pattern";

// Farbe laden
export const loadCardBack = async () => {
  try {
    const color = await AsyncStorage.getItem(KEY_COLOR);
    return color || DEFAULT_BACK_COLOR;
  } catch {
    return DEFAULT_BACK_COLOR;
  }
};

// NEU: Muster laden
export const loadCardPattern = async () => {
  try {
    const pattern = await AsyncStorage.getItem(KEY_PATTERN);
    return pattern || DEFAULT_PATTERN;
  } catch {
    return DEFAULT_PATTERN;
  }
};

// NEU: Beides zusammen speichern (ersetzt saveCardBack im DesignScreen)
export const saveCardDesign = async (color: string, pattern: string) => {
  try {
    await AsyncStorage.setItem(KEY_COLOR, color);
    await AsyncStorage.setItem(KEY_PATTERN, pattern);
  } catch (e) {
    console.error("Fehler beim Speichern des Designs", e);
  }
};

// Legacy Support (falls noch woanders nur Farbe gespeichert wird)
export const saveCardBack = async (color: string) => {
  try {
    await AsyncStorage.setItem(KEY_COLOR, color);
  } catch (e) {
    console.error(e);
  }
};
