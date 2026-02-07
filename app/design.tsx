import AppButton from "@/components/AppButton";
import BackButton from "@/components/BackButton";
import CardVisual from "@/components/CardVisual";
import ColorPickerModal from "@/components/ColorPickerModal"; // NEU
import {
  DEFAULT_BACK_COLOR,
  loadCardBack,
  saveCardBack,
} from "@/utils/designStorage";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Datenkonstante könnte man auch auslagern, aber hier ok
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

  useEffect(() => {
    loadCardBack().then(setSelectedColor);
  }, []);

  const handleSave = async () => {
    await saveCardBack(selectedColor);
    if (router.canGoBack()) router.back();
    else router.replace("/");
  };

  const isCustomColor = !CARD_BACKS.some(
    (back) => back.color === selectedColor,
  );

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#F2E8DF" }}
      edges={["top", "left", "right", "bottom"]}
    >
      <BackButton />

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

      <View style={styles.selectionArea}>
        <LinearGradient
          colors={["#F2E8DF", "rgba(242, 232, 223, 0)"]}
          pointerEvents="none"
          style={styles.topFade}
        />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Mischer Button */}
          <Pressable
            onPress={() => setShowPicker(true)}
            style={[
              styles.optionItem,
              isCustomColor ? styles.selectedOption : styles.customOptionDashed,
            ]}
          >
            <View
              style={[
                styles.rainbowCircle,
                isCustomColor && { backgroundColor: selectedColor },
              ]}
            >
              <Ionicons
                name="color-palette"
                size={24}
                color={isCustomColor ? "rgba(255,255,255,0.8)" : "white"}
              />
            </View>
            <Text
              style={[styles.optionText, isCustomColor && styles.selectedText]}
            >
              Mischer
            </Text>
          </Pressable>

          {/* Preset Colors */}
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
          colors={["rgba(242, 232, 223, 0)", "#F2E8DF"]}
          pointerEvents="none"
          style={styles.bottomFade}
        />
      </View>

      <View style={styles.footerContainer}>
        <AppButton title="Speichern" onPress={handleSave} />
      </View>

      {/* Das neue Modal */}
      <ColorPickerModal
        visible={showPicker}
        initialColor={selectedColor}
        onClose={() => setShowPicker(false)}
        onSelectColor={setSelectedColor}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: "center", paddingTop: 20, marginBottom: 10, zIndex: 1 },
  title: { fontSize: 32, fontFamily: "MochiBoom", color: "#000" },
  previewContainer: {
    height: 160,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    zIndex: 10,
  },
  previewText: {
    marginTop: 20,
    color: "#999",
    fontSize: 12,
    fontFamily: "MochiBoom",
  },
  selectionArea: { flex: 1, marginHorizontal: 20, position: "relative" },
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
    bottom: 0,
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
  customOptionDashed: { borderColor: "#ccc", borderStyle: "dashed" },
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
    borderStyle: "solid",
    elevation: 4,
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
  footerContainer: {
    width: "100%",
    alignItems: "center",
    marginTop: 10,
    paddingVertical: 20,
    backgroundColor: "transparent",
    zIndex: 20,
  },
});
