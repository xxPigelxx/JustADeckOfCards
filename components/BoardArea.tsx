import Card from "@/components/Card";
import * as C from "@/components/constants";
import { CardData } from "@/components/useGameLogic";
import {
  boardToScreen,
  setBoardOrigin,
  slotToBoard,
} from "@/utils/boardGeometry";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
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
  const surfaceRef = useRef<View>(null);
  const [touchedSlots, setTouchedSlots] = useState<number[]>([]);

  // Map: SlotIndex -> Label ("P1", "P2", "Deck")
  const [slotLabels, setSlotLabels] = useState<Record<number, string>>({});
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialisierungs-Logik: Wer ist wer?
  useEffect(() => {
    if (!isInitialized && boardCards.length > 0) {
      const slotsWithCards = new Set<number>();
      const cardCounts: Record<number, number> = {};

      boardCards.forEach((card) => {
        if (card.slot !== undefined) {
          slotsWithCards.add(card.slot);
          cardCounts[card.slot] = (cardCounts[card.slot] || 0) + 1;
        }
      });

      const initialSlotIndices = Array.from(slotsWithCards).sort(
        (a, b) => a - b,
      );
      const newLabels: Record<number, string> = {};

      let maxCards = 0;
      let deckSlot = -1;
      initialSlotIndices.forEach((slot) => {
        if (cardCounts[slot] > maxCards) {
          maxCards = cardCounts[slot];
          deckSlot = slot;
        }
      });

      let playerCounter = 1;
      initialSlotIndices.forEach((slot) => {
        if (slot === deckSlot) {
          newLabels[slot] = "Deck";
        } else {
          newLabels[slot] = `P${playerCounter++}`;
        }
      });

      setSlotLabels(newLabels);
      setIsInitialized(true);
    }
  }, [boardCards, isInitialized]);

  const getGridCardPosition = (slot: number, visualIndex: number = 0) => {
    const surface = slotToBoard(slot, visualIndex);
    const global = boardToScreen(surface);

    return {
      surfaceX: surface.x,
      surfaceY: surface.y,
      globalX: global.x,
      globalY: global.y,
    };
  };

  const cardsBySlot: { [key: number]: CardData[] } = {};
  boardCards.forEach((card) => {
    if (!cardsBySlot[card.slot!]) cardsBySlot[card.slot!] = [];
    cardsBySlot[card.slot!].push(card);
  });

  Object.values(cardsBySlot).forEach((group) =>
    group.sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0)),
  );

  const markAsTouched = (id: string) => {
    const card = boardCards.find((c) => c.id === id);
    if (card && card.slot !== undefined) {
      if (!touchedSlots.includes(card.slot)) {
        setTouchedSlots((prev) => [...prev, card.slot!]);
      }
    }
  };

  return (
    <View style={styles.boardContainer}>
      <View
        ref={surfaceRef}
        style={styles.boardSurface}
        onLayout={() =>
          surfaceRef.current?.measure((_x, _y, _w, _h, pageX, pageY) =>
            setBoardOrigin({ x: pageX, y: pageY }),
          )
        }
      >
        {/* 1. LAYER: LEERE SLOTS */}
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

        {/* 2. LAYER: KARTEN */}
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
                onDragEnd={onDragEnd}
                onTap={() => {
                  markAsTouched(leader.id);
                  onTap(leader.id, pos.globalX, pos.globalY);
                }}
                onDragStart={() => {
                  markAsTouched(leader.id);
                  onDragStart(leader.id);
                }}
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
                  key={`${card.id}-${cardBackPattern}`}
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
                  onDragEnd={onDragEnd}
                  onTap={() => {
                    markAsTouched(card.id);
                    onTap(card.id, pos.globalX, pos.globalY);
                  }}
                  onDragStart={() => {
                    markAsTouched(card.id);
                    onDragStart(card.id);
                  }}
                />
                {isTopCard && isBeingDragged && totalInStack > 1 && (
                  <View
                    style={[
                      styles.staticBadge,
                      {
                        left: pos.surfaceX + C.CARD_W - 14,
                        top: pos.surfaceY - 6,
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

        {/* 3. LAYER: CHIP MARKER */}
        {Object.keys(slotLabels).map((slotKeyStr) => {
          const slotKey = Number(slotKeyStr);
          const label = slotLabels[slotKey];
          const hasCards = cardsBySlot[slotKey]?.length > 0;
          const isTouched = touchedSlots.includes(slotKey);

          if (hasCards && !isTouched) {
            const pos = getGridCardPosition(slotKey, 0);

            return (
              <View
                key={`marker-${slotKey}`}
                style={[
                  styles.chipMarker,
                  {
                    left: pos.surfaceX + C.CARD_W / 2 - 26,
                    top: pos.surfaceY + 14,
                  },
                ]}
                pointerEvents="none"
              >
                {label === "Deck" ? (
                  <MaterialCommunityIcons
                    name="crown"
                    size={24}
                    color="#854d0e"
                  />
                ) : (
                  <Text style={styles.chipText}>{label}</Text>
                )}
              </View>
            );
          }
          return null;
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
  staticBadge: {
    position: "absolute",
    backgroundColor: "#f1ce5bff",
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 800,
    borderWidth: 1.5,
    borderColor: "white",
  },
  badgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
  },

  chipMarker: {
    position: "absolute",
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "white",
    borderWidth: 2,
    borderColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 99999,
    elevation: 10,
    shadowColor: "transparent",
  },
  chipText: {
    textAlign: "center",
    fontSize: 16,
    lineHeight: 20,
    fontWeight: "800",
    color: "#555",
    includeFontPadding: false,
  },
});
