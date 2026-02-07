import Card from "@/components/Card";
import * as C from "@/components/constants";
import { CardData } from "@/components/useGameLogic";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

type BoardAreaProps = {
  boardCards: CardData[];
  highlightedSlot: number | null;
  movingStackSlot: number | null;
  draggedId: string | null;
  cardBackColor?: string;
  cardBackPattern?: string;
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
  cardBackPattern,
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

    const surfaceX = baseX + offsetX;
    const surfaceY = baseY + offsetY;

    const globalX = surfaceX + C.BOARD_PADDING;
    const globalY = surfaceY + C.TOP_OFFSET + C.SAFE_TOP;

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
        {/* Slot Grid */}
        <View style={styles.gridContainer}>
          {Array.from({ length: C.TOTAL_SLOTS }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.cardSlot,
                highlightedSlot === i && styles.activeSlot,
              ]}
            />
          ))}
        </View>

        {/* Karten */}
        {Object.keys(cardsBySlot).map((slotKeyStr) => {
          const slotKey = Number(slotKeyStr);
          const stack = cardsBySlot[slotKey];
          const totalInStack = stack.length;

          if (movingStackSlot === slotKey) {
            const leader = stack[stack.length - 1];
            const pos = getGridCardPosition(slotKey, 0);

            return (
              <Card
                key={`${leader.id}-${cardBackPattern}`}
                id={leader.id}
                rank={leader.rank}
                suit={leader.suit}
                x={pos.surfaceX}
                y={pos.surfaceY}
                zIndex={100}
                isFaceUp={leader.isFaceUp}
                badgeCount={totalInStack}
                forceBadgeVisible={true}
                backColor={cardBackColor}
                backPattern={cardBackPattern}
                onDrop={onDrop}
                onDrag={onDrag}
                onTap={() => onTap(leader.id, pos.globalX, pos.globalY)}
                onDragStart={() => onDragStart(leader.id)}
                onDragEnd={onDragEnd}
              />
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
              <React.Fragment key={card.id}>
                <Card
                  id={card.id}
                  rank={card.rank}
                  suit={card.suit}
                  x={pos.surfaceX}
                  y={pos.surfaceY}
                  zIndex={card.zIndex}
                  isFaceUp={card.isFaceUp}
                  badgeCount={showBadge ? totalInStack : 0}
                  backColor={cardBackColor}
                  backPattern={cardBackPattern}
                  onDrop={onDrop}
                  onDrag={onDrag}
                  onTap={() => onTap(card.id, pos.globalX, pos.globalY)}
                  onDragStart={() => onDragStart(card.id)}
                  onDragEnd={onDragEnd}
                />

                {/* 
                   DAS STATISCHE BADGE (wenn Stapel gezogen wird)
                   Hier angepasst: Gleicher Style wie in Card.tsx, KEIN Schatten
                */}
                {isTopCard && isBeingDragged && totalInStack > 1 && (
                  <View
                    style={[
                      styles.staticBadge,
                      {
                        left: pos.surfaceX + C.CARD_W - 10, // Positionierung angepasst
                        top: pos.surfaceY - 4,
                      },
                    ]}
                  >
                    <Text style={styles.badgeText}>{totalInStack - 1}</Text>
                  </View>
                )}
              </React.Fragment>
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
    paddingLeft: C.GRID_OFFSET_X,
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

  // --- Badge Style (angepasst an Card.tsx) ---
  staticBadge: {
    position: "absolute",
    backgroundColor: "#f1ce5bff",
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
    // border: Weißer Rand für Lesbarkeit
    borderWidth: 1.5,
    borderColor: "white",
    // KEIN Schatten mehr (elevation/shadow entfernt)
  },
  badgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
  },
});
