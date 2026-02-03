import AppButton from "@/components/AppButton";
import BurgerMenu from "@/components/BurgerMenu";
import { useFonts } from "expo-font";
import { ImageBackground } from "expo-image";
import { router } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

export default function Index() {
  const [menuOpen, setMenuOpen] = useState(false);

  const [fontsLoaded] = useFonts({
    MochiBoom: require("../assets/fonts/MochiBoom.ttf"),
  });
  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={{ flex: 1 }}>
      <BurgerMenu dontShow="home" />
      <View style={{ alignItems: "center", paddingTop: 150 }}>
        <ImageBackground
          source={require("../assets/images/logo.png")}
          style={{
            width: 350,
            height: 350,
            justifyContent: "flex-start",
            alignItems: "center",
          }}
          contentFit="contain"
        >
          <Text style={styles.logoText}>Just a Deck of Cards</Text>
        </ImageBackground>
      </View>
      <View style={styles.container}>
        <AppButton
          title="Spiel erstellen"
          onPress={() => router.push("/create")}
        />
        <AppButton
          title="Spiel beitreten"
          onPress={() => router.push("/join")}
        />
        {/* <AppButton title='Game' onPress={() => router.push("/gameScreen")}/> */}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  circleText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },

  container: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    rowGap: 40,
    marginTop: 50,
  },
  logoText: {
    fontSize: 32,
    fontFamily: "MochiBoom",
    color: "#000000ff",
    marginTop: -50,
    marginBottom: 100,
  },

  text: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
});
