import Card from "@/components/Card";
import * as C from "@/components/constants";
import { CardData } from "@/components/useGameLogic";
import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, View } from "react-native";

type HandAreaProps = {
  handCards: CardData[];
  draggedId: string | null;
  cardBackColor?: string;
  cardBackPattern?: string; // <--- NEU: Prop für Muster
  onDrop: (id: string, x: number, y: number) => void;
  onDrag: (id: string, x: number, y: number) => void;
  onTap: (id: string, x: number, y: number) => void;
  onDragStart: (id: string) => void;
  onDragEnd: () => void;
};

export default function HandArea({
  handCards,
  draggedId,
  cardBackColor,
  cardBackPattern, // <--- NEU: Destructure
  onDrop,
  onDrag,
  onTap,
  onDragStart,
  onDragEnd,
}: HandAreaProps) {
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

  const centerX = (C.SCREEN_DIMS.width - C.CARD_W) / 2;

  return (
    <View style={styles.handArea}>
      {handCards.length === 0 && (
        <View
          style={{
            position: "absolute",
            left: centerX,
            top: 30,
            width: C.CARD_W,
            height: C.CARD_H,
            borderColor: "#666",
            borderWidth: 2,
            borderStyle: "dashed",
            borderRadius: 10,
            backgroundColor: "rgba(255, 255, 255, 0.05)",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Feather name="arrow-down" size={38} color="#666" />
        </View>
      )}

      {handCards.map((card, i) => {
        const { x, translateY, rotation } = getFanConfig(i, handCards.length);
        const isDragging = draggedId === card.id;

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
              backColor={cardBackColor}
              backPattern={cardBackPattern} // <--- NEU: Weitergeben
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
    overflow: "visible",
  },
});
