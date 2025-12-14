import Card from "@/componets/CardOld";
import { StyleSheet, View } from "react-native";
import { useSharedValue } from "react-native-reanimated";

export default function Game() {
    const globalMaxZIndex = useSharedValue(1);
  return (
    <View style={styles.container}>
      <View style={styles.board}>
        <Card title="card 1" initialX={100} initialY={100} globalMaxZIndex={globalMaxZIndex}/>
        <Card title="card 2" initialX={200} initialY={200} globalMaxZIndex={globalMaxZIndex}/>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#09684470",
  },
  board: {
    flex: 1,
  },
});
