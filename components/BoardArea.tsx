import Card from "@/components/Card"; // <--- Korrekter Import
import * as C from "@/components/constants";
import { CardData } from "@/components/useGameLogic";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

type BoardAreaProps = {
  boardCards: CardData[];
  highlightedSlot: number | null;
  movingStackSlot: number | null;
  draggedId: string | null;
  cardBackColor?: string; // Prop für Farbe
  onDrop: (id: string, x: number, y: number) => void;
  onDrag: (id: string, x: number, y: number) => void;
  onTap: (id: string, x: number, y: number) => void;
  onDragStart: (id: string) => void;
  onDragEnd: () => void;
};

export default function BoardArea({
  boardCards,
  highlightedSlot,
  movingStackSlot,
  draggedId,
  cardBackColor,
  onDrop,
  onDrag,
  onTap,
  onDragStart,
  onDragEnd,
}: BoardAreaProps) {
  const getGridCardPosition = (slot: number, visualIndex: number = 0) => {
    const col = slot % C.COLS;
    const row = Math.floor(slot / C.COLS);
    const baseX = C.GRID_OFFSET_X + col * (C.SLOT_W + C.GAP);
    const baseY = C.GRID_MARGIN_TOP + row * (C.SLOT_H + C.GAP);
    const offsetX = visualIndex * C.STACK_OFFSET * -1;
    const offsetY = visualIndex * C.STACK_OFFSET * -1;
    const globalX = baseX + offsetX + C.BOARD_PADDING;
    const globalY = baseY + offsetY + C.TOP_OFFSET + C.SAFE_TOP;
    const surfaceX = baseX + offsetX;
    const surfaceY = baseY + offsetY;
    return { surfaceX, surfaceY, globalX, globalY, baseX, baseY };
  };

  const cardsBySlot: { [key: number]: CardData[] } = {};
  boardCards.forEach((card) => {
    if (!cardsBySlot[card.slot!]) cardsBySlot[card.slot!] = [];
    cardsBySlot[card.slot!].push(card);
  });
  Object.values(cardsBySlot).forEach((group) =>
    group.sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0)),
  );

  return (
    <View style={styles.boardContainer}>
      <View style={styles.boardSurface}>
        <View style={[styles.gridContainer, { paddingLeft: C.GRID_OFFSET_X }]}>
          {Array.from({ length: C.TOTAL_SLOTS }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.cardSlot,
                i === highlightedSlot && styles.activeSlot,
              ]}
            />
          ))}
        </View>

        {Object.keys(cardsBySlot).map((slotKeyStr) => {
          const slotKey = Number(slotKeyStr);
          const stack = cardsBySlot[slotKey];
          const totalInStack = stack.length;

          if (movingStackSlot === slotKey) {
            const leader = stack[stack.length - 1];
            const pos = getGridCardPosition(slotKey, 0);

            return (
              <View
                key={leader.id}
                style={{
                  position: "absolute",
                  left: pos.baseX,
                  top: pos.baseY,
                  width: C.CARD_W,
                  height: C.CARD_H,
                  zIndex: 9999,
                }}
              >
                <Card
                  {...leader}
                  x={0}
                  y={0}
                  badgeCount={totalInStack}
                  forceBadgeVisible={true}
                  backColor={cardBackColor} // Farbe weitergeben
                  onDrop={onDrop}
                  onDrag={onDrag}
                  onTap={() => onTap(leader.id, pos.globalX, pos.globalY)}
                  onDragStart={() => onDragStart(leader.id)}
                  onDragEnd={onDragEnd}
                />
              </View>
            );
          }

          return stack.map((card, idx) => {
            const threshold = Math.max(0, stack.length - C.VISIBLE_STACK_LIMIT);
            if (idx < threshold) return null;

            const vIdx = idx - threshold;
            const pos = getGridCardPosition(slotKey, vIdx);
            const isTopCard = idx === stack.length - 1;
            const isBeingDragged = draggedId === card.id;
            const showBadge = isTopCard && !isBeingDragged && totalInStack > 1;

            return (
              <View
                key={card.id}
                style={{
                  position: "absolute",
                  left: pos.surfaceX,
                  top: pos.surfaceY,
                  width: C.CARD_W,
                  height: C.CARD_H,
                  zIndex: isBeingDragged ? 99999 : card.zIndex,
                }}
              >
                <Card
                  {...card}
                  x={0}
                  y={0}
                  badgeCount={showBadge ? totalInStack : 0}
                  forceBadgeVisible={false}
                  backColor={cardBackColor} // Farbe weitergeben
                  onDrop={onDrop}
                  onDrag={onDrag}
                  onTap={() => onTap(card.id, pos.globalX, pos.globalY)}
                  onDragStart={() => onDragStart(card.id)}
                  onDragEnd={onDragEnd}
                />

                {isTopCard && isBeingDragged && totalInStack > 1 && (
                  <View style={styles.staticBadge}>
                    <Text style={styles.badgeText}>{totalInStack - 1}</Text>
                  </View>
                )}
              </View>
            );
          });
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  boardContainer: {
    height: C.BOARD_HEIGHT - C.SAFE_TOP,
    backgroundColor: "transparent",
    zIndex: 1,
    overflow: "visible",
  },
  boardSurface: {
    flex: 1,
    backgroundColor: "#86efac",
    borderRadius: 40,
    marginHorizontal: C.BOARD_PADDING,
    marginTop: C.TOP_OFFSET,
    position: "relative",
    overflow: "visible",
    zIndex: 1,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: C.GRID_MARGIN_TOP,
    zIndex: 0,
  },
  cardSlot: {
    width: C.SLOT_W,
    height: C.SLOT_H,
    marginRight: C.GAP,
    marginBottom: C.GAP,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
    borderRadius: 4,
    backgroundColor: "rgba(0,0,0,0.02)",
  },
  activeSlot: {
    borderColor: "rgba(0,0,0,0.3)",
    backgroundColor: "rgba(0,0,0,0.2)",
    borderWidth: 2,
  },
  staticBadge: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "#f1ce5bff",
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100,
    elevation: 5,
  },
  badgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
  },
});
