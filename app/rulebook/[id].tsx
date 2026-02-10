import BackButton from "@/components/BackButton";
import { GAMES } from "@/data/games";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";

export default function RulebookDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const game = GAMES.find((g) => g.id === id);

  if (!game) return null;

  return (
    <View style={{ flex: 1, backgroundColor: "#F2E8DF" }}>
      <BackButton />

      <View style={styles.header}>
        <Text style={styles.title}>{game.name}</Text>
      </View>

      <View style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.rules}>{game.rules}</Text>
        </ScrollView>
        <LinearGradient
          colors={["#F2E8DF", "rgba(242, 232, 223, 0)"]}
          pointerEvents="none"
          style={styles.topFade}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: "center",
    paddingTop: 100,
    marginBottom: 20, // Reduced slightly so fade starts closer to text
    paddingHorizontal: 20,
    zIndex: 10, // Ensure header is above scroll content
    backgroundColor: "#F2E8DF", // Solid background for header
  },
  title: {
    fontSize: 32,
    fontFamily: "MochiBoom",
    color: "#000",
    textAlign: "center",
  },
  container: {
    paddingHorizontal: 24,
    paddingTop: 20, // Add padding to top of scroll content so it starts under the fade
    paddingBottom: 80,
  },
  rules: {
    fontSize: 18,
    lineHeight: 26,
    color: "#000",
    textAlign: "left",
  },
  topFade: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 40, // Adjusted height for a subtle fade
    zIndex: 5,
  },
});
