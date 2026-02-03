import AppButton from "@/components/AppButton";
import BurgerMenu from "@/components/BurgerMenu";
import { GAMES } from "@/data/games";
import { useFonts } from "expo-font";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

export default function RulebookIndex() {
  const [fontsLoaded] = useFonts({
    MochiBoom: require("../../assets/fonts/MochiBoom.ttf"),
  });
  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={{ flex: 1 }}>
      <BurgerMenu />

      <View style={styles.header}>
        <Text style={styles.title}>Regelbuch</Text>
      </View>
      <View style={{ marginTop: 10, marginBottom: 40, flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container}>
          {GAMES.map((game) => (
            <AppButton
              key={game.id}
              title={game.name}
              onPress={() =>
                router.push({
                  pathname: "/rulebook/[id]",
                  params: { id: game.id },
                })
              }
            />
          ))}
        </ScrollView>
        <LinearGradient
          colors={["#F2E8DF", "rgba(242, 232, 223, 0)"]}
          pointerEvents="none"
          style={styles.topFade}
        />

        {/* BOTTOM FADE */}
        <LinearGradient
          colors={["rgba(242, 232, 223, 0)", "#F2E8DF"]}
          pointerEvents="none"
          style={styles.bottomFade}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: "center",
    paddingTop: 100,
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontFamily: "MochiBoom",
    color: "#000",
    paddingTop: -50,
  },
  container: {
    alignItems: "center",
    rowGap: 40,
    paddingTop: 60,
    paddingBottom: 60,
  },
  topFade: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 60,
  },

  bottomFade: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
  },
});
