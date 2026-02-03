import Card from "@/components/CardOld"; // Deine funktionierende Card
import * as C from "@/components/constants";
import { CardData } from "@/components/useGameLogic";
import React from "react";
import { StyleSheet, View } from "react-native";

type HandAreaProps = {
  handCards: CardData[];
  draggedId: string | null;
  // Callbacks
  onDrop: (id: string, x: number, y: number) => void;
  onDrag: (id: string, x: number, y: number) => void;
  onTap: (id: string, x: number, y: number) => void;
  onDragStart: (id: string) => void;
  onDragEnd: () => void;
};

export default function HandArea({
  handCards,
  draggedId,
  onDrop,
  onDrag,
  onTap,
  onDragStart,
  onDragEnd,
}: HandAreaProps) {
  // Helper direkt hier
  const getFanConfig = (index: number, total: number) => {
    const centerIndex = (total - 1) / 2;
    const offset = index - centerIndex;
    const rotation = offset * C.FAN_ANGLE;
    const translateY =
      Math.abs(offset) * C.FAN_CURVE + Math.abs(offset * offset) * 1.5;
    const totalWidth = (total - 1) * C.FAN_SPREAD;
    const startX = (C.SCREEN_DIMS.width - totalWidth) / 2 - C.CARD_W / 2;
    const x = startX + index * C.FAN_SPREAD;
    return { x, translateY, rotation };
  };

  return (
    <View style={styles.handArea}>
      {handCards.map((card, i) => {
        const { x, translateY, rotation } = getFanConfig(i, handCards.length);
        const isDragging = draggedId === card.id;

        // Globale Y-Koordinate berechnen für das Menü
        const handRelativeY =
          C.SCREEN_DIMS.height - C.HAND_HEIGHT - C.SAFE_TOP + 30 + translateY;
        const handGlobalY = handRelativeY + C.SAFE_TOP;

        return (
          <View
            key={`${card.id}-hand-${i}`}
            style={{
              position: "absolute",
              left: x,
              top: 30 + translateY,
              width: C.CARD_W,
              height: C.CARD_H,
              transform: [{ rotate: isDragging ? "0deg" : `${rotation}deg` }],
              zIndex: isDragging ? 99999 : i * 10,
            }}
          >
            <Card
              {...card}
              x={0}
              y={0}
              onDrop={onDrop}
              onDrag={onDrag}
              onTap={() => onTap(card.id, x, handGlobalY)}
              onDragStart={() => onDragStart(card.id)}
              onDragEnd={onDragEnd}
            />
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  handArea: {
    height: C.HAND_HEIGHT,
    backgroundColor: "#333",
    width: "100%",
    zIndex: 10,
  },
});
