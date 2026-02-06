import AppButton from "@/components/AppButton";
import BurgerMenu from "@/components/BurgerMenu";
import { useFonts } from "expo-font";
import { ImageBackground } from "expo-image";
import { router } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context"; // Empfohlen für Layouts

export default function Index() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { width, height } = useWindowDimensions(); // Holt aktuelle Screen-Maße

  const [fontsLoaded] = useFonts({
    MochiBoom: require("../assets/fonts/MochiBoom.ttf"),
  });

  if (!fontsLoaded) {
    return null;
  }

  // Berechne dynamische Logo-Größe:
  // Auf Tablets größer, auf Handys kleiner, aber nie riesig.
  // Z.B. 80% der Breite, aber maximal 400px.
  const logoSize = Math.min(width * 0.8, 400);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <BurgerMenu dontShow="home" />

      {/* Oberer Bereich für Logo (nimmt ca. 50% des Platzes ein) */}
      <View style={styles.logoContainer}>
        <ImageBackground
          source={require("../assets/images/logo.png")}
          style={{
            width: logoSize,
            height: logoSize,
            justifyContent: "flex-start",
            alignItems: "center",
          }}
          contentFit="contain"
        >
          {/* Text relativ zum Bild positionieren, falls er ÜBER dem Bild sein soll */}
          <Text style={styles.logoText}>Just a Deck of Cards</Text>
        </ImageBackground>
      </View>

      {/* Unterer Bereich für Buttons (nimmt den Rest ein) */}
      <View style={styles.buttonContainer}>
        <AppButton
          title="Spiel erstellen"
          onPress={() => router.push("/create")}
        />
        <AppButton
          title="Spiel beitreten"
          onPress={() => router.push("/join")}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  logoContainer: {
    marginTop: 40,
    flex: 1.2, // Logo bekommt etwas mehr Platz als die Buttons (Verhältnis 1.2 zu 1)
    justifyContent: "center", // Vertikal zentriert
    alignItems: "center", // Horizontal zentriert
    // paddingTop entfernen wir, da 'justifyContent: center' das übernimmt
  },
  buttonContainer: {
    flex: 1, // Buttons nehmen den unteren Bereich ein
    justifyContent: "flex-start", // Starten oben in ihrem Bereich
    alignItems: "center",
    rowGap: 30, // Abstand zwischen Buttons
    paddingTop: 20, // Kleiner Abstand zum Logo-Bereich
  },
  logoText: {
    fontSize: 32,
    fontFamily: "MochiBoom",
    color: "#000000ff",
    marginBottom: 20, // Abstand zum unteren Rand des Bildes
    // Positionierung relativ zum Logo-Bild anpassen
    // Wenn es drüber schweben soll, ist position: 'absolute' oft sicherer
    // als negative Margins, die oft Layouts verschieben.
    position: "absolute",
    top: -50,
    width: "150%", // Breiter als das Bild erlauben, falls Text lang ist
    textAlign: "center",
  },
  circleText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  text: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
});
