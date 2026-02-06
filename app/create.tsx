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
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Create() {
  const { width, height } = useWindowDimensions();
  const isTablet = width > 600;

  const [selectedDeckIndex, setSelectedDeckIndex] = useState<number>(1);
  const [deckCount, setDeckCount] = useState(1);
  const [playerCount, setPlayerCount] = useState(1);
  const [startCards, setStartCards] = useState(0);

  const options = [
    "54 Karten",
    "52 Karten",
    "36 Karten",
    "32 Karten",
    "24 Karten",
  ];

  const handleStartGame = () => {
    router.push({
      pathname: "/invite",
      params: {
        deckType: options[selectedDeckIndex],
        deckCount,
        playerCount,
        startCards,
      },
    });
  };

  return (
    <View style={styles.container}>
      {/* BurgerMenu bleibt absolut oben */}
      <BurgerMenu />

      <SafeAreaView style={{ flex: 1 }} edges={["top", "left", "right"]}>
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            // Auf Tablets den Inhalt zentrieren, damit er nicht zu breit wird
            isTablet && { width: 600, alignSelf: "center" },
          ]}
        >
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

          {/* --- GROSSER CONTAINER FÜR SLIDER --- */}
          <View style={styles.settingsCard}>
            {/* 1. ANZAHL DECKS */}
            <View style={styles.sliderSection}>
              <Text style={styles.heading}>
                Anzahl Kartendecks: {deckCount}
              </Text>
              <CustomSlider
                value={deckCount}
                onValueChange={setDeckCount}
                minimumValue={1}
                maximumValue={4}
              />
            </View>

            {/* Kleiner Abstand (statt 3% View) */}
            <View style={styles.spacer} />

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

            <View style={styles.spacer} />

            {/* 3. STARTKARTEN */}
            <View style={styles.sliderSection}>
              <Text style={styles.heading}>
                Anzahl Handkarten: {startCards}
              </Text>
              <CustomSlider
                value={startCards}
                onValueChange={setStartCards}
                minimumValue={0}
                maximumValue={10}
              />
            </View>
          </View>

          <AppButton
            title="Erstellen"
            onPress={handleStartGame}
            style={styles.button}
          />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  scrollContent: {
    paddingTop: 60, // Platz für BurgerMenu
    paddingHorizontal: 20,
    paddingBottom: 40,
  },

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
    // Kein Shadow hier, wie im Original gewünscht
  },

  toggleButtonActive: {
    backgroundColor: "#f1ce5bff",
    borderColor: "#f1ce5bff",
  },

  toggleText: {
    color: "#000",
    fontWeight: "600",
    fontSize: 13,
  },

  toggleTextActive: {
    color: "#fff",
  },

  settingsCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    // Originaler Look ohne starken Schatten
  },

  sliderSection: {
    marginBottom: 5,
  },

  // Ersatz für <View style={{ height: "3%" }} />
  // Fest 20px ist sicherer als %, da % in ScrollViews manchmal kollabiert
  spacer: {
    height: 20,
  },

  heading: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000",
    marginBottom: 2,
  },

  button: {
    marginTop: 50, // Etwas reduziert, damit es auf kleinen Screens nicht scrollen muss
    alignSelf: "center",
  },
});
