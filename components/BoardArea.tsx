import Card from "@/components/Card";
import * as C from "@/components/constants";
import { DragLayerControls } from "@/components/DragLayer";
import { CameraControls } from "@/components/useCamera";
import { CardData } from "@/components/useGameLogic";
import {
  boardToScreen,
  getCameraZoom,
  setBoardOrigin,
  slotToBoard,
} from "@/utils/boardGeometry";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { GestureDetector } from "react-native-gesture-handler";
import Animated, { useAnimatedStyle } from "react-native-reanimated";

type BoardAreaProps = {
  camera: CameraControls;
  dragLayer: DragLayerControls;
  boardCards: CardData[];
  cardsBySlot: { [key: number]: CardData[] };
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
  camera,
  dragLayer,
  boardCards,
  cardsBySlot,
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
    return { surfaceX: surface.x, surfaceY: surface.y };
  };

  // Screen position depends on the camera, so it is computed at tap time
  const tapCard = (id: string, pos: { surfaceX: number; surfaceY: number }) => {
    markAsTouched(id);
    const screen = boardToScreen({ x: pos.surfaceX, y: pos.surfaceY });
    onTap(id, screen.x, screen.y);
  };

  // Where a card is on screen right now, for the drag layer
  const screenOrigin = (pos: { surfaceX: number; surfaceY: number }) => () => ({
    topLeft: boardToScreen({ x: pos.surfaceX, y: pos.surfaceY }),
    scale: getCameraZoom(),
  });

  const contentStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: camera.x.value },
      { translateY: camera.y.value },
      { scale: camera.zoom.value },
    ],
  }));

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
      <GestureDetector gesture={camera.gesture}>
        <View
          ref={surfaceRef}
          style={styles.boardSurface}
          onLayout={(event) => {
            const { width, height } = event.nativeEvent.layout;
            camera.setViewportSize(width, height);
            surfaceRef.current?.measure((_x, _y, _w, _h, pageX, pageY) =>
              setBoardOrigin({ x: pageX, y: pageY }),
            );
          }}
        >
          <Animated.View style={[styles.boardContent, contentStyle]}>
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
                    zoom={camera.zoom}
                    dragLayer={dragLayer}
                    blocksGesture={camera.panGesture}
                    getScreenOrigin={screenOrigin(pos)}
                    onTap={() => tapCard(leader.id, pos)}
                    onDragStart={() => {
                      markAsTouched(leader.id);
                      onDragStart(leader.id);
                    }}
                  />
                );
              }
              return stack.map((card, idx) => {
                const threshold = Math.max(
                  0,
                  stack.length - C.VISIBLE_STACK_LIMIT,
                );
                if (idx < threshold) return null;
                const vIdx = idx - threshold;
                const pos = getGridCardPosition(slotKey, vIdx);
                const isTopCard = idx === stack.length - 1;
                const isBeingDragged = draggedId === card.id;
                const showBadge =
                  isTopCard && !isBeingDragged && totalInStack > 1;

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
                      zoom={camera.zoom}
                      dragLayer={dragLayer}
                      blocksGesture={camera.panGesture}
                      getScreenOrigin={screenOrigin(pos)}
                      onTap={() => tapCard(card.id, pos)}
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
          </Animated.View>
        </View>
      </GestureDetector>
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
    // Board content is only visible inside the green field
    overflow: "hidden",
    zIndex: 1,
  },
  boardContent: {
    position: "absolute",
    top: 0,
    left: 0,
    width: C.BOARD_CONTENT_W,
    height: C.BOARD_CONTENT_H,
    transformOrigin: "left top",
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: C.GRID_MARGIN_TOP,
    zIndex: 0,
    paddingLeft: C.GRID_OFFSET_X,
    // Exactly BOARD_COLS slots per row (each slot includes its right gap)
    width: C.GRID_OFFSET_X + C.BOARD_COLS * (C.SLOT_W + C.GAP),
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
