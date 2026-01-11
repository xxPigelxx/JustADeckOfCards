import AppButton from "@/componets/AppButton";
import BurgerMenu from "@/componets/BurgerMenu";
import { GAMES } from "@/data/games";
import { router } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";

export default function RulebookIndex() {
 
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
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: "#000",
  },
  container: {
    alignItems: "center",
    rowGap: 40,
    paddingBottom: 60,
  },
});
