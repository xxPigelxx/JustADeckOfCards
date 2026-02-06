import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY_CARD_BACK = "card_back_color";

// Standardfarbe (Blau)
export const DEFAULT_BACK_COLOR = "#3b82f6";

export const saveCardBack = async (color: string) => {
  try {
    await AsyncStorage.setItem(KEY_CARD_BACK, color);
  } catch (e) {
    console.error("Fehler beim Speichern des Designs", e);
  }
};

export const loadCardBack = async (): Promise<string> => {
  try {
    const color = await AsyncStorage.getItem(KEY_CARD_BACK);
    return color || DEFAULT_BACK_COLOR;
  } catch (e) {
    return DEFAULT_BACK_COLOR;
  }
};
