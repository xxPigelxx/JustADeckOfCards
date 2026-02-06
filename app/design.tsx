import AppButton from "@/components/AppButton";
import BurgerMenu from "@/components/BurgerMenu";
import CardVisual from "@/components/CardVisual";
import CustomSlider from "@/components/Slider";
import {
  DEFAULT_BACK_COLOR,
  loadCardBack,
  saveCardBack,
} from "@/utils/designStorage";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

const rgbToHex = (r: number, g: number, b: number) => {
  const toHex = (c: number) => {
    const safeC = Math.round(c || 0); // Schutz vor NaN
    const hex = Math.max(0, Math.min(255, safeC)).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 };
};

const CARD_BACKS = [
  { id: "blue", color: "#3b82f6", name: "Blau" },
  { id: "red", color: "#ef4444", name: "Rot" },
  { id: "green", color: "#10b981", name: "Grün" },
  { id: "yellow", color: "#eab308", name: "Gelb" },
  { id: "black", color: "#1f2937", name: "Schwarz" },
  { id: "navy", color: "#1e3a8a", name: "Navy" },
  { id: "forest", color: "#064e3b", name: "Wald" },
  { id: "purple", color: "#581c87", name: "Deep Purple" },
  { id: "hotpink", color: "#ec4899", name: "Pink" },
  { id: "cyan", color: "#06b6d4", name: "Cyan" },
  { id: "lime", color: "#84cc16", name: "Lime" },
  { id: "orange", color: "#f97316", name: "Orange" },
  { id: "gold", color: "#f59e0b", name: "Gold" },
  { id: "teal", color: "#14b8a6", name: "Teal" },
  { id: "indigo", color: "#6366f1", name: "Indigo" },
  { id: "rose", color: "#f43f5e", name: "Rose" },
  { id: "slate", color: "#64748b", name: "Slate" },
  { id: "zinc", color: "#71717a", name: "Zinc" },
  { id: "brown", color: "#78350f", name: "Braun" },
  { id: "maroon", color: "#7f1d1d", name: "Weinrot" },
];

export default function DesignScreen() {
  const router = useRouter();
  const [selectedColor, setSelectedColor] = useState(DEFAULT_BACK_COLOR);
  const [showPicker, setShowPicker] = useState(false);
  const [red, setRed] = useState(0);
  const [green, setGreen] = useState(0);
  const [blue, setBlue] = useState(0);

  useEffect(() => {
    loadCardBack().then((color) => setSelectedColor(color));
  }, []);

  const openPicker = () => {
    const rgb = hexToRgb(selectedColor);
    setRed(rgb.r);
    setGreen(rgb.g);
    setBlue(rgb.b);
    setShowPicker(true);
  };

  // FIX: Verhindert Infinite Loop durch Check, ob sich Hex wirklich geändert hat
  useEffect(() => {
    if (showPicker) {
      const newHex = rgbToHex(red, green, blue);
      if (newHex !== selectedColor) {
        setSelectedColor(newHex);
      }
    }
  }, [red, green, blue, showPicker]); // showPicker fehlte in Deps

  const handleSave = async () => {
    await saveCardBack(selectedColor);
    if (router.canGoBack()) router.back();
    else router.replace("/");
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#F2E8DF" }}>
      <BurgerMenu dontShow="design" />

      <View style={styles.header}>
        <Text style={styles.title}>Kartendesign</Text>
      </View>

      <View style={styles.previewContainer}>
        <View style={{ transform: [{ scale: 1.5 }] }}>
          <CardVisual
            rank="A"
            suit="♠"
            isFaceUp={false}
            backColor={selectedColor}
          />
        </View>
        <Text style={styles.previewText}>Vorschau</Text>
      </View>

      <View style={{ flex: 1, marginBottom: 150, marginHorizontal: 20 }}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Pressable onPress={openPicker} style={styles.customOption}>
            <View style={styles.rainbowCircle}>
              <Ionicons name="color-palette" size={24} color="white" />
            </View>
            <Text style={styles.optionText}>Mischer</Text>
          </Pressable>

          {CARD_BACKS.map((back) => (
            <Pressable
              key={back.id}
              onPress={() => setSelectedColor(back.color)}
              style={[
                styles.optionItem,
                selectedColor === back.color && styles.selectedOption,
              ]}
            >
              <View
                style={[styles.colorCircle, { backgroundColor: back.color }]}
              />
              <Text
                style={[
                  styles.optionText,
                  selectedColor === back.color && styles.selectedText,
                ]}
              >
                {back.name}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        <LinearGradient
          colors={["#F2E8DF", "rgba(242, 232, 223, 0)"]}
          pointerEvents="none"
          style={styles.topFade}
        />
        <LinearGradient
          colors={["rgba(242, 232, 223, 0)", "#F2E8DF"]}
          pointerEvents="none"
          style={styles.bottomFade}
        />
      </View>

      <View style={styles.footer}>
        <AppButton title="Speichern" onPress={handleSave} />
      </View>

      <Modal
        visible={showPicker}
        animationType="fade"
        transparent={true} // Wichtig!
        statusBarTranslucent={true} // NEU: Damit es auch hinter die Statusbar geht
        onRequestClose={() => setShowPicker(false)}
      >
        <Pressable
          style={styles.modalOverlay} // Siehe Style Update unten!
          onPress={() => setShowPicker(false)}
        >
          <Pressable
            style={styles.pickerContainer}
            onPress={(e) => e.stopPropagation()}
          >
            <Text style={styles.pickerTitle}>Farbmischer</Text>
            <View
              style={[
                styles.modalPreview,
                { backgroundColor: `rgb(${red},${green},${blue})` },
              ]}
            />

            <View style={styles.sliderRow}>
              <Text style={[styles.sliderLabel, { color: "#ef4444" }]}>R</Text>
              <View style={{ flex: 1, paddingTop: 22 }}>
                <CustomSlider
                  value={red}
                  onValueChange={setRed}
                  minimumValue={0}
                  maximumValue={255}
                  trackColor="#ef4444"
                  thumbColor="#ef4444"
                />
              </View>
              <Text style={styles.valueText}>{Math.round(red)}</Text>
            </View>

            <View style={styles.sliderRow}>
              <Text style={[styles.sliderLabel, { color: "#10b981" }]}>G</Text>
              <View style={{ flex: 1, paddingTop: 22 }}>
                <CustomSlider
                  value={green}
                  onValueChange={setGreen}
                  minimumValue={0}
                  maximumValue={255}
                  trackColor="#10b981"
                  thumbColor="#10b981"
                />
              </View>
              <Text style={styles.valueText}>{Math.round(green)}</Text>
            </View>

            <View style={styles.sliderRow}>
              <Text style={[styles.sliderLabel, { color: "#3b82f6" }]}>B</Text>
              <View style={{ flex: 1, paddingTop: 22 }}>
                <CustomSlider
                  value={blue}
                  onValueChange={setBlue}
                  minimumValue={0}
                  maximumValue={255}
                  trackColor="#3b82f6"
                  thumbColor="#3b82f6"
                />
              </View>
              <Text style={styles.valueText}>{Math.round(blue)}</Text>
            </View>

            <AppButton
              title="Übernehmen"
              onPress={() => setShowPicker(false)}
              style={{ marginTop: 20 }}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: "center", paddingTop: 80, marginBottom: 10 },
  title: { fontSize: 32, fontFamily: "MochiBoom", color: "#000" },
  previewContainer: {
    height: 160,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 0,
    zIndex: 10,
  },
  previewText: {
    marginTop: 20,
    color: "#999",
    fontSize: 12,
    fontFamily: "MochiBoom",
  },
  scrollContent: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 12,
    paddingTop: 20,
    paddingBottom: 20,
  },
  topFade: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 30,
    zIndex: 5,
  },
  bottomFade: {
    position: "absolute",
    bottom: -1,
    left: 0,
    right: 0,
    height: 30,
    zIndex: 5,
  },
  optionItem: {
    width: 85,
    height: 85,
    backgroundColor: "#fff",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
  customOption: {
    width: 85,
    height: 85,
    backgroundColor: "#fff",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#ccc",
    borderStyle: "dashed",
    elevation: 2,
  },
  rainbowCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginBottom: 8,
    backgroundColor: "#333",
    justifyContent: "center",
    alignItems: "center",
  },
  selectedOption: {
    borderColor: "#f1ce5bff",
    backgroundColor: "#fffbe6",
    transform: [{ scale: 1.05 }],
  },
  colorCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.1)",
  },
  optionText: {
    fontSize: 11,
    fontWeight: "500",
    color: "#555",
    textAlign: "center",
  },
  selectedText: { color: "#000", fontWeight: "bold" },
  footer: {
    position: "absolute",
    bottom: 40,
    width: "100%",
    alignItems: "center",
    zIndex: 20,
  },
  modalOverlay: {
    flex: 1,
    // WICHTIG: absolute Positionierung für Fullscreen
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    // Farbe:
    backgroundColor: "rgba(0,0,0,0.7)", // Halbtransparenter Hintergrund
    // Ausrichtung des Inhalts (der weißen Box):
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999, // Ganz nach oben
  },
  pickerContainer: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    elevation: 5,
  },
  pickerTitle: { fontSize: 24, fontFamily: "MochiBoom", marginBottom: 15 },
  modalPreview: {
    width: "100%",
    height: 60,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#eee",
    marginBottom: 20,
  },
  sliderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 5,
    width: "100%",
    height: 60,
  },
  sliderLabel: {
    fontWeight: "bold",
    fontSize: 16,
    width: 20,
    marginRight: 10,
  },
  valueText: {
    width: 50,
    textAlign: "right",
    fontSize: 12,
    color: "#666",
  },
});
