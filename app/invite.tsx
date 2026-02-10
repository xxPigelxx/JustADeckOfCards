import AppButton from "@/components/AppButton";
import BurgerMenu from "@/components/BurgerMenu";
// Importiere deine neue Komponente
import ControlsHint from "@/components/ControlsHint";
import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";

export default function Invite() {
  const [code, setCode] = useState("");
  const router = useRouter();
  const params = useLocalSearchParams();

  const generateCode = () => {
    const randomNum = Math.floor(Math.random() * 1000000);
    return randomNum.toString().padStart(6, "0");
  };

  useEffect(() => {
    setCode(generateCode());
  }, []);

  return (
    <View style={styles.container}>
      <Image
        source={require("../assets/images/key.png")}
        style={styles.image}
        resizeMode="contain"
      />

      <Text style={styles.title}>Einladungscode</Text>

      <View style={styles.codeField}>
        <Text style={styles.codeText}>{code}</Text>
      </View>

      {/* HIER: Pill-Style für Spieler Anzahl */}
      <View style={styles.playerBadge}>
        <Feather
          name="users"
          size={24}
          color="black"
          style={{ marginRight: 8 }}
        />
        <Text style={styles.text}>Spieler Anzahl: 1</Text>
      </View>

      {/* Hier nutzen wir jetzt die Komponente mit etwas Abstand */}
      <ControlsHint style={{ marginTop: 120 }} />
      <AppButton
        title="Spiel starten"
        onPress={() => {
          router.push({
            pathname: "/gameScreen",
            params: params,
          });
        }}
        style={styles.button}
      />

      <BurgerMenu />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: "flex-start",
    alignItems: "center",
  },
  image: {
    width: 230,
    height: 350,
    marginTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
    textAlign: "center",
    marginTop: -40,
  },
  // Style für den Text IN der Pill
  text: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
    textAlign: "center",
    // marginTop entfernt, damit es in der Pill mittig ist
  },
  codeField: {
    width: "70%",
    height: 45,
    borderColor: "#000",
    borderWidth: 0.5,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    marginTop: 10,
  },
  codeText: {
    color: "#000",
    fontSize: 18,
    fontWeight: "bold",
  },
  button: {
    marginTop: 30,
  },

  // NEU: Style für die Pill-Box
  playerBadge: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10, // Abstand nach oben zum Code

    // Das macht es zur "Pill":
    backgroundColor: "#ffffffff", // Leichtes Grau
    paddingVertical: 10, // Höhe
    paddingHorizontal: 20, // Breite
    borderRadius: 15, // Ganz rund
  },
});
