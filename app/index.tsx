import AppButton from "@/components/AppButton";
import BurgerMenu from "@/components/BurgerMenu";
import { ImageBackground } from "expo-image";
import { router } from "expo-router";
import { StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
export default function Index() {
  const { width, height } = useWindowDimensions();

  const logoSize = Math.min(width * 0.8, 400);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <BurgerMenu dontShow="home" />
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
          <Text style={styles.logoText}>Just a Deck of Cards</Text>
        </ImageBackground>
      </View>

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
    flex: 1.2,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonContainer: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    rowGap: 30,
    paddingTop: 20,
  },
  logoText: {
    fontSize: 32,
    fontFamily: "MochiBoom",
    color: "#000000ff",
    marginBottom: 20,

    position: "absolute",
    top: -50,
    width: "150%",
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
