import CardVisual from "@/components/CardVisual";
import React from "react";
import { StyleSheet } from "react-native";
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
  backColor?: string; // Prop für Farbe
  onDrop: (id: string, x: number, y: number) => void;
  onDrag?: (id: string, x: number, y: number) => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  onTap?: () => void;
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
  forceBadgeVisible = false,
  backColor, // Farbe empfangen
  onDrop,
  onDrag,
  onDragStart,
  onDragEnd,
  onTap,
}: CardProps) {
  const translateX = useSharedValue(x);
  const translateY = useSharedValue(y);
  const isDragging = useSharedValue(false);
  const scale = useSharedValue(1);
  const rotateZ = useSharedValue(0);

  const tapGesture = Gesture.Tap()
    .maxDuration(250)
    .onEnd(() => {
      if (onTap) runOnJS(onTap)();
    });

  const dragGesture = Gesture.Pan()
    .onStart(() => {
      isDragging.value = true;
      scale.value = withSpring(1.1);
      rotateZ.value = withTiming(0);
      if (onDragStart) runOnJS(onDragStart)();
    })
    .onUpdate((event) => {
      translateX.value = event.translationX + x;
      translateY.value = event.translationY + y;
      if (onDrag) {
        runOnJS(onDrag)(id, event.absoluteX, event.absoluteY);
      }
    })
    .onEnd((event) => {
      isDragging.value = false;
      scale.value = withSpring(1);
      const absX = event.absoluteX;
      const absY = event.absoluteY;
      runOnJS(onDrop)(id, absX, absY);
      if (onDragEnd) runOnJS(onDragEnd)();

      translateX.value = withSpring(0);
      translateY.value = withSpring(0);
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
        {/* Hier nutzen wir CardVisual für das Design */}
        <CardVisual
          rank={rank}
          suit={suit}
          isFaceUp={isFaceUp}
          badgeCount={badgeCount}
          backColor={backColor} // Farbe weitergeben
        />
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
});
