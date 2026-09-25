import Card from "@/components/Card";
import * as C from "@/components/constants";
import { CardData } from "@/components/useGameLogic";
import {
  getFanPosition,
  handCardToScreen,
  setHandOrigin,
} from "@/utils/boardGeometry";
import { Feather } from "@expo/vector-icons";
import React, { useRef } from "react";
import { StyleSheet, View } from "react-native";

type HandAreaProps = {
  handCards: CardData[];
  draggedId: string | null;
  cardBackColor?: string;
  cardBackPattern?: string;
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
  cardBackPattern,
  onDrop,
  onDrag,
  onTap,
  onDragStart,
  onDragEnd,
}: HandAreaProps) {
  const handRef = useRef<View>(null);
  const centerX = (C.SCREEN_DIMS.width - C.CARD_W) / 2;

  return (
    <View
      ref={handRef}
      style={styles.handArea}
      onLayout={() =>
        handRef.current?.measure((_x, _y, _w, _h, pageX, pageY) =>
          setHandOrigin({ x: pageX, y: pageY }),
        )
      }
    >
      {handCards.length === 0 && (
        <View
          style={{
            position: "absolute",
            left: centerX,
            top: C.HAND_CARD_TOP,
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
        const { x, translateY, rotation } = getFanPosition(
          i,
          handCards.length,
        );
        const isDragging = draggedId === card.id;
        const screenPos = handCardToScreen(i, handCards.length);

        return (
          <View
            key={`${card.id}-hand-${i}`}
            style={{
              position: "absolute",
              left: x,
              top: C.HAND_CARD_TOP + translateY,
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
              backPattern={cardBackPattern}
              onDrop={onDrop}
              onDrag={onDrag}
              onTap={() => onTap(card.id, screenPos.x, screenPos.y)}
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
