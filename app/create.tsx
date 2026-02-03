import AppButton from "@/components/AppButton";
import BurgerMenu from "@/components/BurgerMenu";
import CustomSlider from "@/components/Slider";
import { router } from "expo-router";
import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function Create() {
  const [selectedDeckIndex, setSelectedDeckIndex] = useState<number>(1);

  const [deckCount, setDeckCount] = useState(1);
  const [playerCount, setPlayerCount] = useState(4);
  const [startCards, setStartCards] = useState(5);

  const options = [
    "54 Karten",
    "52 Karten",
    "36 Karten",
    "32 Karten",
    "24 Karten",
  ];

  const handleStartGame = () => {
    router.push({
      pathname: "/gameScreen",
      params: {
        deckType: options[selectedDeckIndex],
        deckCount: deckCount,
        playerCount: playerCount,
        startCards: startCards,
      },
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* --- DECK TYP --- */}
        <Text style={styles.mainHeading}>Spiel Konfiguration</Text>

        <View style={styles.toggleGroup}>
          {options.map((title, index) => {
            const isActive = selectedDeckIndex === index;
            return (
              <TouchableOpacity
                key={index}
                onPress={() => setSelectedDeckIndex(index)}
                style={[
                  styles.toggleButton,
                  isActive && styles.toggleButtonActive,
                ]}
              >
                <Text
                  style={[
                    styles.toggleText,
                    isActive && styles.toggleTextActive,
                  ]}
                >
                  {title}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* --- GROSSER CONTAINER FÜR ALLE SLIDER --- */}
        <View style={styles.settingsCard}>
          {/* 1. ANZAHL DECKS */}
          <View style={styles.sliderSection}>
            <Text style={styles.heading}>Anzahl Kartendecks: {deckCount}</Text>
            <CustomSlider
              value={deckCount}
              onValueChange={setDeckCount}
              minimumValue={1}
              maximumValue={4}
            />
          </View>

          <View style={{ height: 40 }} />

          {/* 2. ANZAHL SPIELER */}
          <View style={styles.sliderSection}>
            <Text style={styles.heading}>Anzahl Spieler: {playerCount}</Text>
            <CustomSlider
              value={playerCount}
              onValueChange={setPlayerCount}
              minimumValue={1}
              maximumValue={8}
            />
          </View>

          <View style={{ height: 40 }} />

          {/* 3. STARTKARTEN */}
          <View style={styles.sliderSection}>
            <Text style={styles.heading}>Anzahl Handkarten: {startCards}</Text>
            <CustomSlider
              value={startCards}
              onValueChange={setStartCards}
              minimumValue={0}
              maximumValue={10}
            />
          </View>
        </View>

        <AppButton
          title="Spiel Starten"
          onPress={handleStartGame}
          style={styles.button}
        />
      </ScrollView>
      <BurgerMenu />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingTop: 100, paddingHorizontal: 20, paddingBottom: 40 },

  mainHeading: {
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 15,
    color: "#333",
  },

  toggleGroup: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 25,
  },
  toggleButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#fff",
    shadowColor: "transparent",
    elevation: 2,
  },
  toggleButtonActive: {
    backgroundColor: "#f1ce5bff",
    borderColor: "#f1ce5bff",
  },
  toggleText: { color: "#000", fontWeight: "600", fontSize: 13 },
  toggleTextActive: { color: "#fff" },

  // Der neue große Container
  settingsCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "transparent",
  },

  sliderSection: {
    marginBottom: 5,
  },

  heading: { fontSize: 16, fontWeight: "700", color: "#000", marginBottom: 2 },

  button: { marginTop: 70, alignSelf: "center" },
});
