import AppButton from "@/componets/AppButton";
import BurgerMenu from "@/componets/BurgerMenu";
import { GAMES } from "@/data/games";
import { useFonts } from "expo-font";
import { router } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";

export default function RulebookIndex() {
  const [fontsLoaded] = useFonts({
    MochiBoom: require("../../assets/fonts/MochiBoom.ttf"),
  });

  if (!fontsLoaded) return null;

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
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: "center",
    paddingTop: 100,
    marginBottom: 60,
  },
  title: {
    fontSize: 32,
    fontFamily: "MochiBoom",
    color: "#000",
  },
  container: {
    alignItems: "center",
    rowGap: 40,
    paddingBottom: 60,
  },
});
