import CardVisual from "@/components/CardVisual";
import { CARD_H, CARD_W } from "@/components/constants";
import { Point } from "@/utils/boardGeometry";
import React, { useState } from "react";
import { StyleSheet } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";

export type DragCard = {
  rank: string;
  suit: string;
  isFaceUp: boolean;
  backColor?: string;
  backPattern?: string;
};

// The card being dragged is drawn here, above the (clipped) board and the
// hand, so it can move freely between them. Positions are screen coordinates.
export const useDragLayer = () => {
  const fingerX = useSharedValue(0);
  const fingerY = useSharedValue(0);
  // Finger position relative to the card's top-left corner
  const grabX = useSharedValue(0);
  const grabY = useSharedValue(0);
  const scale = useSharedValue(1);
  const visible = useSharedValue(false);
  const [card, setCard] = useState<DragCard | null>(null);

  const show = (
    dragCard: DragCard,
    finger: Point,
    cardTopLeft: Point,
    cardScale: number,
  ) => {
    grabX.value = finger.x - cardTopLeft.x;
    grabY.value = finger.y - cardTopLeft.y;
    scale.value = cardScale;
    setCard(dragCard);
    visible.value = true;
  };

  const hide = () => {
    visible.value = false;
  };

  return { fingerX, fingerY, grabX, grabY, scale, visible, card, show, hide };
};

export type DragLayerControls = ReturnType<typeof useDragLayer>;

export default function DragLayer({ layer }: { layer: DragLayerControls }) {
  const style = useAnimatedStyle(() => ({
    opacity: layer.visible.value ? 1 : 0,
    transform: [
      { translateX: layer.fingerX.value - layer.grabX.value },
      { translateY: layer.fingerY.value - layer.grabY.value },
      { scale: layer.scale.value },
    ],
  }));

  if (!layer.card) return null;

  return (
    <Animated.View style={[styles.card, style]} pointerEvents="none">
      <CardVisual
        rank={layer.card.rank}
        suit={layer.card.suit}
        isFaceUp={layer.card.isFaceUp}
        backColor={layer.card.backColor}
        backPattern={layer.card.backPattern}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    position: "absolute",
    top: 0,
    left: 0,
    width: CARD_W,
    height: CARD_H,
    transformOrigin: "left top",
    zIndex: 5000,
    elevation: 5000,
  },
});
