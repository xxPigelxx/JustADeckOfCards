import CardVisual from "@/components/CardVisual";
import { DragLayerControls } from "@/components/DragLayer";
import { Point } from "@/utils/boardGeometry";
import React, { useEffect, useRef } from "react";
import { StyleSheet, Text, View } from "react-native";
import {
  Gesture,
  GestureDetector,
  GestureType,
} from "react-native-gesture-handler";
import Animated, {
  SharedValue,
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
  // Board camera zoom, so the dragged card stays under the finger
  zoom?: SharedValue<number>;
  // If set, the dragged card is drawn in the drag layer instead of moving
  // itself; getScreenOrigin tells where the card currently is on screen
  dragLayer?: DragLayerControls;
  getScreenOrigin?: () => { topLeft: Point; scale: number };
  // Gesture that has to wait for this card's drag (the board pan)
  blocksGesture?: GestureType;
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
  zoom,
  dragLayer,
  getScreenOrigin,
  blocksGesture,
  onDrop,
  onDrag,
  onDragStart,
  onDragEnd,
  onTap,
}: CardProps) {
  const translateX = useSharedValue(x);
  const translateY = useSharedValue(y);
  const offsetX = useSharedValue(0);
  const offsetY = useSharedValue(0);
  const isDragging = useSharedValue(false);
  const scale = useSharedValue(1);
  const rotateZ = useSharedValue(0);

  // Drag layer mode: the card stays in place (hidden) while its copy in the
  // drag layer follows the finger
  const inDragLayer = !!dragLayer;
  const layerFingerX = dragLayer?.fingerX;
  const layerFingerY = dragLayer?.fingerY;
  const hidden = useSharedValue(false);
  const justDropped = useRef(false);

  useEffect(() => {
    // After a drop the card appears at its new place without flying there
    if (justDropped.current) {
      justDropped.current = false;
      translateX.value = x;
      translateY.value = y;
      return;
    }
    translateX.value = withSpring(x, SPRING_CONFIG);
    translateY.value = withSpring(y, SPRING_CONFIG);
  }, [x, y, translateX, translateY]);

  const showInDragLayer = (fingerX: number, fingerY: number) => {
    if (!dragLayer || !getScreenOrigin) return;
    const origin = getScreenOrigin();
    dragLayer.show(
      { rank, suit, isFaceUp, backColor, backPattern },
      { x: fingerX, y: fingerY },
      origin.topLeft,
      origin.scale,
    );
  };

  // Wait until the drop is rendered, then swap the drag layer copy back
  // for the real card
  const finishDragLayer = () => {
    justDropped.current = true;
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        justDropped.current = false;
        hidden.value = false;
        dragLayer?.hide();
      }),
    );
  };

  const dragGesture = Gesture.Pan()
    .maxPointers(1)
    .onStart((event) => {
      isDragging.value = true;
      if (inDragLayer && layerFingerX && layerFingerY) {
        layerFingerX.value = event.absoluteX;
        layerFingerY.value = event.absoluteY;
        hidden.value = true;
        runOnJS(showInDragLayer)(event.absoluteX, event.absoluteY);
      } else {
        offsetX.value = translateX.value;
        offsetY.value = translateY.value;
        scale.value = withSpring(1.1, SPRING_CONFIG);
        rotateZ.value = withTiming(0);
      }
      if (onDragStart) runOnJS(onDragStart)();
    })
    .onUpdate((event) => {
      if (inDragLayer && layerFingerX && layerFingerY) {
        layerFingerX.value = event.absoluteX;
        layerFingerY.value = event.absoluteY;
      } else {
        const z = zoom ? zoom.value : 1;
        translateX.value = offsetX.value + event.translationX / z;
        translateY.value = offsetY.value + event.translationY / z;
      }
      if (onDrag) runOnJS(onDrag)(id, event.absoluteX, event.absoluteY);
    })
    .onEnd((event) => {
      runOnJS(onDrop)(id, event.absoluteX, event.absoluteY);
      if (onDragEnd) runOnJS(onDragEnd)();
      if (!inDragLayer) {
        scale.value = withSpring(1, SPRING_CONFIG);
        translateX.value = withSpring(x, SPRING_CONFIG);
        translateY.value = withSpring(y, SPRING_CONFIG);
      }
    })
    .onFinalize(() => {
      // Also runs when the drag is cancelled, so the card never stays hidden
      if (!isDragging.value) return;
      isDragging.value = false;
      if (inDragLayer) runOnJS(finishDragLayer)();
    });

  // Touching a card drags the card, not the board underneath
  if (blocksGesture) dragGesture.blocksExternalGesture(blocksGesture);

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
    opacity: hidden.value ? 0 : 1,
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
