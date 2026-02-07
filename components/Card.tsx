import CardVisual from "@/components/CardVisual";
import React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { CARD_H, CARD_W } from "./constants";

type CardProps = {
  id: string;
  rank: string;
  suit: string;
  x: number;
  y: number;
  zIndex?: number;
  isFaceUp?: boolean;
  badgeCount?: number;
  forceBadgeVisible?: boolean;
  backColor?: string;
  backPattern?: string;
  onDrop: (id: string, x: number, y: number) => void;
  onDrag?: (id: string, x: number, y: number) => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  onTap?: () => void;
};

const SPRING_CONFIG = {
  damping: 20,
  stiffness: 150,
  mass: 0.5,
  overshootClamping: true,
  restDisplacementThreshold: 0.01,
  restSpeedThreshold: 0.01,
};

export default function Card({
  id,
  rank,
  suit,
  x,
  y,
  zIndex = 1,
  isFaceUp = true,
  badgeCount = 0,
  backColor,
  backPattern,
  onDrop,
  onDrag,
  onDragStart,
  onDragEnd,
  onTap,
}: CardProps) {
  // ... (Gleiche Logik wie vorher) ...
  const translateX = useSharedValue(x);
  const translateY = useSharedValue(y);
  const offsetX = useSharedValue(0);
  const offsetY = useSharedValue(0);
  const isDragging = useSharedValue(false);
  const scale = useSharedValue(1);
  const rotateZ = useSharedValue(0);

  useEffect(() => {
    translateX.value = withSpring(x, SPRING_CONFIG);
    translateY.value = withSpring(y, SPRING_CONFIG);
  }, [x, y, translateX, translateY]);

  const dragGesture = Gesture.Pan()
    .onStart(() => {
      offsetX.value = translateX.value;
      offsetY.value = translateY.value;
      isDragging.value = true;
      scale.value = withSpring(1.1, SPRING_CONFIG);
      rotateZ.value = withTiming(0);
      if (onDragStart) runOnJS(onDragStart)();
    })
    .onUpdate((event) => {
      translateX.value = offsetX.value + event.translationX;
      translateY.value = offsetY.value + event.translationY;
      if (onDrag) runOnJS(onDrag)(id, event.absoluteX, event.absoluteY);
    })
    .onEnd((event) => {
      isDragging.value = false;
      scale.value = withSpring(1, SPRING_CONFIG);
      runOnJS(onDrop)(id, event.absoluteX, event.absoluteY);
      if (onDragEnd) runOnJS(onDragEnd)();
      translateX.value = withSpring(x, SPRING_CONFIG);
      translateY.value = withSpring(y, SPRING_CONFIG);
    });

  const tapGesture = Gesture.Tap()
    .maxDuration(250)
    .onEnd(() => {
      if (onTap) runOnJS(onTap)();
    });
  const gesture = Gesture.Race(dragGesture, tapGesture);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
      { rotateZ: `${rotateZ.value}deg` },
    ],
    zIndex: isDragging.value ? 9999 : zIndex,
  }));

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[styles.cardContainer, animatedStyle]}>
        <CardVisual
          rank={rank}
          suit={suit}
          isFaceUp={isFaceUp}
          backColor={backColor}
          backPattern={backPattern}
        />

        {badgeCount > 1 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badgeCount}</Text>
          </View>
        )}
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    width: CARD_W,
    height: CARD_H,
    position: "absolute",
  },
  // --- Badge Style (Angepasst: KEIN Schatten) ---
  badge: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: "#f1ce5bff",
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100,
    // elevation und shadow entfernt!
    borderWidth: 1.5,
    borderColor: "white",
  },
  badgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
  },
});
