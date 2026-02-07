import CardVisual from "@/components/CardVisual";
import React, { useEffect } from "react";
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
  backColor?: string;
  onDrop: (id: string, x: number, y: number) => void;
  onDrag?: (id: string, x: number, y: number) => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  onTap?: () => void;
};

// NEU: Konfiguration für ein sattes, direktes Einrasten ohne Wackeln
const SPRING_CONFIG = {
  damping: 20, // Höhere Dämpfung = weniger Schwingen
  stiffness: 150, // Steifigkeit
  mass: 0.5, // Leichte Masse = schnelle Reaktion
  overshootClamping: true, // Verhindert das "Über das Ziel hinaus schießen"
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
  forceBadgeVisible = false,
  backColor,
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

  // Position updaten, wenn sich die Props ändern (durch Spiellogik)
  useEffect(() => {
    translateX.value = withSpring(x, SPRING_CONFIG);
    translateY.value = withSpring(y, SPRING_CONFIG);
  }, [x, y, translateX, translateY]);

  const tapGesture = Gesture.Tap()
    .maxDuration(250)
    .onEnd(() => {
      if (onTap) runOnJS(onTap)();
    });

  const dragGesture = Gesture.Pan()
    .onStart(() => {
      isDragging.value = true;
      scale.value = withSpring(1.1, SPRING_CONFIG);
      rotateZ.value = withTiming(0);
      if (onDragStart) runOnJS(onDragStart)();
    })
    .onUpdate((event) => {
      // Harte Zuweisung während Drag (kein Spring, 1:1 Bewegung)
      translateX.value = x + event.translationX;
      translateY.value = y + event.translationY;

      if (onDrag) {
        runOnJS(onDrag)(id, event.absoluteX, event.absoluteY);
      }
    })
    .onEnd((event) => {
      isDragging.value = false;
      scale.value = withSpring(1, SPRING_CONFIG);
      const absX = event.absoluteX;
      const absY = event.absoluteY;

      runOnJS(onDrop)(id, absX, absY);
      if (onDragEnd) runOnJS(onDragEnd)();

      // Zurück zur Ausgangsposition springen (falls Drop fehlschlägt)
      // Mit der neuen Config sollte das "snappy" wirken.
      translateX.value = withSpring(x, SPRING_CONFIG);
      translateY.value = withSpring(y, SPRING_CONFIG);
    });

  const gesture = Gesture.Race(dragGesture, tapGesture);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
      { rotateZ: `${rotateZ.value}deg` },
    ],
    // Z-Index extrem hoch während Drag
    zIndex: isDragging.value ? 9999 : zIndex,
  }));

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[styles.cardContainer, animatedStyle]}>
        <CardVisual
          rank={rank}
          suit={suit}
          isFaceUp={isFaceUp}
          badgeCount={badgeCount}
          backColor={backColor}
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
    // Optional: Schatten während Drag verstärken (über Animated Style besser, aber hier als Basis)
  },
});
