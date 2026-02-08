import AppButton from "@/components/AppButton";
import BurgerMenu from "@/components/BurgerMenu";
import InfoAlert from "@/components/InfoAlert";
import CustomSlider from "@/components/Slider";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Create() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isTablet = width > 600;

  const [selectedDeckIndex, setSelectedDeckIndex] = useState<number>(1);
  const [deckCount, setDeckCount] = useState(1);
  const [playerCount, setPlayerCount] = useState(1);
  const [startCards, setStartCards] = useState(0);

  // --- INFO ALERT STATE ---
  const [infoVisible, setInfoVisible] = useState(false);
  const [infoTitle, setInfoTitle] = useState("");
  const [infoMessage, setInfoMessage] = useState("");

  const showInfo = (title: string, msg: string) => {
    setInfoTitle(title);
    setInfoMessage(msg);
    setInfoVisible(true);
  };

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

  const InfoIcon = ({ onPress }: { onPress: () => void }) => (
    <Pressable
      onPress={onPress}
      hitSlop={15}
      style={{ marginLeft: 8, opacity: 0.6 }} // Margin leicht erhöht
    >
      <Ionicons name="information-circle" size={24} color="#000" />
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <BurgerMenu />

      <SafeAreaView style={{ flex: 1 }} edges={["top", "left", "right"]}>
        <View
          style={[
            styles.content,
            isTablet && { width: 600, alignSelf: "center" },
          ]}
        >
          {/* 
              NEU: Überschrift jetzt als Row mit Info-Icon 
          */}
          <View style={styles.mainHeaderRow}>
            <Text style={styles.mainHeading}>Spiel Konfiguration</Text>
            <InfoIcon
              onPress={() =>
                showInfo(
                  "Kartendeck Auswahl",
                  "Wähle das passende Blatt für dein Spiel:\n" +
                    "• 54 Karten: Standard + 2 Joker (Rommé)\n" +
                    "• 52 Karten: International (Poker, Blackjack)\n" +
                    "• 36 Karten: Kleines Blatt (Durak, Jass)\n" +
                    "• 32 Karten: Deutsches Blatt (Skat)\n" +
                    "• 24 Karten: (Schnapsen, Sechsundsechzig)",
                )
              }
            />
          </View>

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

          <View style={styles.settingsCard}>
            {/* 1. Decks */}
            <View style={styles.sliderSection}>
              <View style={styles.headingRow}>
                <Text style={styles.heading}>
                  Anzahl Kartendecks: {deckCount}
                </Text>
                <InfoIcon
                  onPress={() =>
                    showInfo(
                      "Anzahl Kartendecks",
                      "Bestimmt, wie viele Sätze der oben gewählten Kartenart (z.B. 52er Deck) in den Nachziehstapel gemischt werden.",
                    )
                  }
                />
              </View>
              <CustomSlider
                value={deckCount}
                onValueChange={setDeckCount}
                minimumValue={1}
                maximumValue={4}
              />
            </View>

            <View style={styles.spacer} />

            {/* 2. Spieler */}
            <View style={styles.sliderSection}>
              <View style={styles.headingRow}>
                <Text style={styles.heading}>
                  Anzahl Spieler: {playerCount}
                </Text>
                <InfoIcon
                  onPress={() =>
                    showInfo(
                      "Anzahl Spieler",
                      "Bestimmt, wie viele Spielerbereiche (Spieler-Stapel) auf dem Spielbrett vorbereitet werden.",
                    )
                  }
                />
              </View>
              <CustomSlider
                value={playerCount}
                onValueChange={setPlayerCount}
                minimumValue={1}
                maximumValue={8}
              />
            </View>

            <View style={styles.spacer} />

            {/* 3. Handkarten */}
            <View style={styles.sliderSection}>
              <View style={styles.headingRow}>
                <Text style={styles.heading}>
                  Anzahl Handkarten: {startCards}
                </Text>
                <InfoIcon
                  onPress={() =>
                    showInfo(
                      "Start-Handkarten",
                      "Bestimmt, mit wie vielen Karten jeder der vorbereiteten Spieler-Stapel das Spiel beginnt.",
                    )
                  }
                />
              </View>
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
        </View>
      </SafeAreaView>

      <InfoAlert
        visible={infoVisible}
        title={infoTitle}
        message={infoMessage}
        onClose={() => setInfoVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F2E8DF" },
  content: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  // NEU: Container für Header + Icon
  mainHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  mainHeading: {
    fontSize: 22,
    fontWeight: "800",
    color: "#333",
    // marginBottom entfernt, da jetzt im Row-Container geregelt
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
    elevation: 1,
  },
  sliderSection: {
    marginBottom: 5,
  },
  headingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  spacer: {
    height: 20,
  },
  heading: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000",
  },
  button: {
    marginTop: 50,
    alignSelf: "center",
  },
});
