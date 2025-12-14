import React, { useContext } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { MatrixContext } from "./ZoomableBoard";

type CardProps = {
  id: string;
  title: string;
  initialX?: number;
  initialY?: number;
  inHand?: boolean;
  // Updated signature to include absoluteX
  onDrop: (id: string, x: number, y: number, absoluteY: number, absoluteX: number) => void;
};

export default function Card({
  id,
  title,
  initialX = 0,
  initialY = 0,
  inHand = false,
  onDrop,
}: CardProps) {
  const context = useContext(MatrixContext);
  const currentScale = inHand || !context ? { value: 1 } : context.scale;

  // Initialize with passed coordinates
  const x = useSharedValue(initialX);
  const y = useSharedValue(initialY);
  
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);
  const isActive = useSharedValue(false);
  const zIndex = useSharedValue(inHand ? 10 : 1);

  const dragGesture = Gesture.Pan()
    .onStart(() => {
      isActive.value = true;
      zIndex.value = 1000;
      startX.value = x.value;
      startY.value = y.value;
    })
    .onUpdate((e) => {
      const scaleFactor = currentScale.value;
      x.value = startX.value + e.translationX / scaleFactor;
      y.value = startY.value + e.translationY / scaleFactor;
    })
    .onFinalize((e) => {
      isActive.value = false;
      zIndex.value = inHand ? 10 : 1;
      
      // Pass absoluteX and absoluteY
      runOnJS(onDrop)(id, x.value, y.value, e.absoluteY, e.absoluteX);
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: x.value },
      { translateY: y.value },
      { scale: withSpring(isActive.value ? 1.1 : 1) },
    ],
    zIndex: zIndex.value,
    position: 'absolute',
  }));

  return (
    <GestureDetector gesture={dragGesture}>
      <Animated.View style={[styles.card, animatedStyle]}>
        <View style={styles.cardHeader}>
           <View style={styles.cardIcon} />
        </View>
        <View style={styles.cardBody}>
           <Text style={styles.text}>{title}</Text>
        </View>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 80,
    height: 120,
    backgroundColor: "#EEE",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#DDD",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
    overflow: 'hidden',
  },
  cardHeader: {
    flex: 2,
    backgroundColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  cardBody: {
    flex: 1,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 2,
  },
  text: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#333",
    textAlign: 'center',
  },
});
