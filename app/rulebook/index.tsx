import AppButton from "@/componets/AppButton";
import BurgerMenu from "@/componets/BurgerMenu";
import { GAMES } from "@/data/games";
import { useFonts } from "expo-font";
import { LinearGradient } from 'expo-linear-gradient';
import { router } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

export default function RulebookIndex() {
 
  const [fontsLoaded] = useFonts({
    'MochiBoom': require('../../assets/fonts/MochiBoom.ttf'),
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
          colors={["#F2E8DF", "transparent"]}
          pointerEvents="none"
          style={styles.topFade}
        />

        {/* BOTTOM FADE */}
        <LinearGradient
          colors={["transparent", "#F2E8DF"]}
          pointerEvents="none"
          style={styles.bottomFade}
        />
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
    fontFamily: 'MochiBoom',
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
    top: 160,
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
