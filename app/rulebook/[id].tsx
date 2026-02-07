import BackButton from "@/components/BackButton";
import { GAMES } from "@/data/games";
import { useLocalSearchParams } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";

export default function RulebookDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const game = GAMES.find((g) => g.id === id);

  if (!game) return null;

  return (
    <View style={{ flex: 1 }}>
      <BackButton />
      <View style={styles.header}>
        <Text style={styles.title}>{game.name}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.rules}>{game.rules}</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: "center",
    paddingTop: 100,
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontFamily: "MochiBoom",
    color: "#000",
    textAlign: "center",
  },
  container: {
    paddingHorizontal: 24,
    paddingBottom: 80,
  },
  rules: {
    fontSize: 18,
    lineHeight: 26,
    color: "#000",
    textAlign: "left",
  },
});
