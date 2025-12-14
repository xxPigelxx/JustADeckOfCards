import AppButton from "@/componets/AppButton";
import Card from "@/componets/Card";
import React, { useState } from "react";
import {
  Dimensions,
  Modal,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  View
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");

// --- PLATFORM CONSTANTS ---
// We calculate the top inset manually to ensure coordinates match exactly
const ANDROID_BAR = Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 0;
// Standard iOS notch height (approx 47 for new phones, 20 for old). 
// safe-area-context would be better, but this fixed value works for 99% of cases without extra libs.
const IOS_BAR = Platform.OS === 'ios' ? 47 : 0; 
const SAFE_TOP = ANDROID_BAR + IOS_BAR;

// --- CONFIGURATION ---
const CARD_W = 60;
const CARD_H = 80;
const BOARD_PADDING = 10;
const GAP = 4;

const TOP_OFFSET = 0;        
const GRID_MARGIN_TOP = 15;   

const VISIBLE_STACK_LIMIT = 3; 
const STACK_OFFSET = 3;        

const HAND_HEIGHT = 150;
const BOARD_HEIGHT = SCREEN_H - HAND_HEIGHT; // Full height minus hand
const FAN_SPREAD = 25;
const FAN_ANGLE = 5;
const FAN_CURVE = 3;

// --- GRID CALCULATIONS ---
const SLOT_W = CARD_W;
const SLOT_H = CARD_H;
const ACTUAL_BOARD_W = SCREEN_W - (BOARD_PADDING * 2);

// Adjust available height for grid based on our Safe Top + Top Offset
const AVAILABLE_HEIGHT = BOARD_HEIGHT - SAFE_TOP - TOP_OFFSET - GRID_MARGIN_TOP - BOARD_PADDING;

const COLS = Math.floor(ACTUAL_BOARD_W / (SLOT_W + GAP));
const ROWS = Math.floor(AVAILABLE_HEIGHT / (SLOT_H + GAP));
const TOTAL_SLOTS = ROWS * COLS;
const GRID_WIDTH = COLS * (SLOT_W + GAP) - GAP;
const GRID_OFFSET_X = (ACTUAL_BOARD_W - GRID_WIDTH) / 2;

export default function GameScreen() {
  const [maxZIndex, setMaxZIndex] = useState(100);
  const [draggedId, setDraggedId] = useState<string | null>(null);

  // --- MENU STATE ---
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuTargetSlot, setMenuTargetSlot] = useState<number | null>(null);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });

  const [boardCards, setBoardCards] = useState([
    { id: "c1", rank: "10", suit: "♦", slot: 4, zIndex: 1 },
    { id: "c2", rank: "K", suit: "♠", slot: 7, zIndex: 2 },
    { id: "c3", rank: "2", suit: "♠", slot: 4, zIndex: 3 }, 
    { id: "c4", rank: "5", suit: "♦", slot: 4, zIndex: 4 }, 
    { id: "c5", rank: "A", suit: "♠", slot: 4, zIndex: 5 }, 
  ]);

  const [handCards, setHandCards] = useState([
    { id: "h1", rank: "A", suit: "♥" },
    { id: "h2", rank: "7", suit: "♣" },
    { id: "h3", rank: "Q", suit: "♥" },
    { id: "h4", rank: "9", suit: "♠" },
    { id: "h5", rank: "6", suit: "♠" },
    { id: "h6", rank: "J", suit: "♣" },
    { id: "h7", rank: "3", suit: "♦" },
  ]);

  // --- HELPERS ---
  const getFanConfig = (index: number, total: number) => {
    const centerIndex = (total - 1) / 2;
    const offset = index - centerIndex;
    const rotation = offset * FAN_ANGLE;
    const translateY = Math.abs(offset) * FAN_CURVE + Math.abs(offset * offset) * 1.5;
    const totalWidth = (total - 1) * FAN_SPREAD;
    const startX = (SCREEN_W - totalWidth) / 2 - (CARD_W / 2);
    const x = startX + index * FAN_SPREAD;
    return { x, translateY, rotation };
  };

  const getHandIndexFromX = (absX: number) => {
    const totalWidth = handCards.length * FAN_SPREAD;
    const startX = (SCREEN_W - totalWidth) / 2;
    const relativeX = absX - startX;
    return Math.min(handCards.length, Math.max(0, Math.floor(relativeX / FAN_SPREAD)));
  };

  const bringToFront = (id: string) => {
    const newZ = maxZIndex + 1;
    setMaxZIndex(newZ);
    setBoardCards((prev) =>
      prev.map((c) => (c.id === id ? { ...c, zIndex: newZ } : c))
    );
  };

  // --- INTERACTION LOGIC ---
  const handleDrop = (id: string, absX: number, absY: number) => {
    const isOverHand = absY > BOARD_HEIGHT - 30;

    if (isOverHand) {
      const fromBoard = boardCards.find((c) => c.id === id);
      if (fromBoard) {
        setBoardCards((prev) => prev.filter((c) => c.id !== id));
        const targetIndex = getHandIndexFromX(absX);
        setHandCards((prev) => {
          const newHand = [...prev];
          const safeIndex = Math.min(prev.length, targetIndex);
          newHand.splice(safeIndex, 0, { id, rank: fromBoard.rank, suit: fromBoard.suit });
          return newHand;
        });
        return;
      }
      const index = handCards.findIndex((c) => c.id === id);
      const newIndex = getHandIndexFromX(absX);
      if (index !== -1 && newIndex !== index) {
        const newHand = [...handCards];
        const [moved] = newHand.splice(index, 1);
        newHand.splice(Math.min(newHand.length, newIndex), 0, moved);
        setHandCards(newHand);
      }
      return;
    }

    const localX = absX - BOARD_PADDING - GRID_OFFSET_X;
    const localY = absY - BOARD_PADDING - TOP_OFFSET - GRID_MARGIN_TOP - SAFE_TOP; // Subtract SAFE_TOP to get grid-local Y
    
    const col = Math.round(localX / (SLOT_W + GAP));
    const row = Math.round(localY / (SLOT_H + GAP));

    if (col < 0 || col >= COLS || row < 0 || row >= ROWS) return;

    const targetSlot = row * COLS + col;
    const fromHand = handCards.find((c) => c.id === id);

    if (fromHand) {
      const newZ = maxZIndex + 1;
      setMaxZIndex(newZ);
      setHandCards((p) => p.filter((c) => c.id !== id));
      setBoardCards((p) => [...p, { ...fromHand, slot: targetSlot, zIndex: newZ }]);
    } else {
      setBoardCards((p) =>
        p.map((c) => (c.id === id ? { ...c, slot: targetSlot } : c))
      );
    }
  };

  const handleCardTap = (cardId: string, globalX: number, globalY: number) => {
    const card = boardCards.find(c => c.id === cardId) || handCards.find(c => c.id === cardId);
    if (!card) return;

    const inHand = handCards.find(c => c.id === cardId);

    const MENU_W = 70; 
    const slot = 'slot' in card ? card.slot : null;
    setMenuTargetSlot(slot as number | null);

    // EXACT POSITIONING LOGIC
    // We trust globalX/globalY because we calculated them explicitly with SAFE_TOP included.

    if (inHand) {
      // Position menu above the card in hand
      setMenuPosition({
        x: globalX + (CARD_W / 2) - (MENU_W / 2),
        y: globalY - CARD_H - 5 - SAFE_TOP  
      });
      setMenuVisible(true);
      return;
    }

    setMenuPosition({ 
        x: globalX + (CARD_W / 2) - (MENU_W / 2), 
        y: globalY + CARD_H + 5 - SAFE_TOP // +5px padding below card
    });
    setMenuVisible(true);
  };

  // --- RENDER PREP ---
  const cardsBySlot: { [key: number]: typeof boardCards } = {};
  boardCards.forEach((card) => {
    if (!cardsBySlot[card.slot]) cardsBySlot[card.slot] = [];
    cardsBySlot[card.slot].push(card);
  });
  Object.values(cardsBySlot).forEach(group => group.sort((a, b) => a.zIndex - b.zIndex));

  // --- MENU ---
  const renderContextMenu = () => {
    if (!menuVisible) return null;
    const stack = menuTargetSlot !== null ? cardsBySlot[menuTargetSlot] || [] : [];
    const isStack = stack.length > 1;
    return (
      <Modal transparent visible={menuVisible} animationType="fade">
        <Pressable style={styles.overlay} onPress={() => setMenuVisible(false)}>
          <View style={[styles.menuContainer, { top: menuPosition.y, left: menuPosition.x }]}>
            {isStack ? (
              <>
                <AppButton title="Take" onPress={() => alert("Take")} style={styles.menuButton} textStyle={styles.menuButtonText} />
                <AppButton title="Mix" onPress={() => alert("Shuffle")} style={styles.menuButton} textStyle={styles.menuButtonText} />
                <AppButton title="Spread" onPress={() => alert("Spread")} style={styles.menuButton} textStyle={styles.menuButtonText} />
              </>
            ) : (
              <>
                <AppButton title="Flip" onPress={() => alert("Flip")} style={styles.menuButton} textStyle={styles.menuButtonText} />
                <AppButton title="Info" onPress={() => alert("Info")} style={styles.menuButton} textStyle={styles.menuButtonText} />
              </>
            )}
          </View>
        </Pressable>
      </Modal>
    );
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      {/* 
          MANUAL SAFE AREA CONTROL 
          We use padding instead of SafeAreaView so we know exactly where Y=0 starts.
      */}
      <View style={{ flex: 1, paddingTop: SAFE_TOP }}>
        
        <View style={styles.boardContainer}>
          <View style={styles.boardSurface}>
            
            <View style={[styles.gridContainer, { paddingLeft: GRID_OFFSET_X }]}>
              {Array.from({ length: TOTAL_SLOTS }).map((_, i) => (
                <View key={i} style={styles.cardSlot} />
              ))}
            </View>

            {Object.keys(cardsBySlot).map((slotKey) => {
                const stack = cardsBySlot[Number(slotKey)];
                return stack.map((card, indexInStack) => {
                    const threshold = Math.max(0, stack.length - VISIBLE_STACK_LIMIT);
                    const isVisibleStack = indexInStack >= threshold;
                    const visualIndex = isVisibleStack ? indexInStack - threshold : 0;
                    const offsetX = visualIndex * STACK_OFFSET * -1; 
                    const offsetY = visualIndex * STACK_OFFSET * -1; 

                    const col = card.slot % COLS;
                    const row = Math.floor(card.slot / COLS);
                    const baseX = GRID_OFFSET_X + col * (SLOT_W + GAP);
                    const baseY = GRID_MARGIN_TOP + row * (SLOT_H + GAP);

                    // --- GLOBAL COORDINATE CALCULATION ---
                    // Base (Grid) + Offset (Stack) + Board Padding + Top Offset + Safe Area
                    const globalX = baseX + offsetX + BOARD_PADDING; 
                    const globalY = baseY + offsetY + TOP_OFFSET + SAFE_TOP; 

                    return (
                        <View
                            key={`${card.id}-slot-${card.slot}`}
                            style={{
                                position: "absolute",
                                left: baseX + offsetX,
                                top: baseY + offsetY,
                                width: CARD_W,
                                height: CARD_H,
                                zIndex: card.zIndex,
                            }}
                        >
                            <Card
                                {...card}
                                x={0}
                                y={0}
                                onDrop={handleDrop}
                                onTap={() => handleCardTap(card.id, globalX, globalY)}
                                onDragStart={() => {
                                    setDraggedId(card.id);
                                    bringToFront(card.id);
                                }}
                                onDragEnd={() => setDraggedId(null)}
                            />
                        </View>
                    );
                });
            })}
          </View>
        </View>

        <View style={styles.handArea}>
          {handCards.map((card, i) => {
            const { x, translateY, rotation } = getFanConfig(i, handCards.length);
            const isDragging = draggedId === card.id;

            // Global Hand Y: (Screen Height - Hand Area) + Card Top + Safe Top + Visual Shift
            // Note: Hand Area is usually at the bottom, so SAFE_TOP is irrelevant for position, 
            // BUT our coordinate system starts at SAFE_TOP now.
            // Screen Y = (y relative to View) + SAFE_TOP
            const handRelativeY = (SCREEN_H - HAND_HEIGHT - SAFE_TOP) + 30 + translateY;
            const handGlobalY = handRelativeY + SAFE_TOP;
            
            return (
              <View
                key={`${card.id}-hand-${i}`}
                style={{
                  position: "absolute",
                  left: x,
                  top: 30 + translateY,
                  width: CARD_W,
                  height: CARD_H,
                  transform: [{ rotate: isDragging ? "0deg" : `${rotation}deg` }],
                  zIndex: isDragging ? 99999 : i * 10,
                }}
              >
                <Card
                  {...card}
                  x={0}
                  y={0}
                  onDrop={handleDrop}
                  onTap={() => handleCardTap(card.id, x, handGlobalY)}
                  onDragStart={() => setDraggedId(card.id)}
                  onDragEnd={() => setDraggedId(null)}
                />
              </View>
            );
          })}
        </View>
      </View>

      {renderContextMenu()}

    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#333" },
  boardContainer: { 
    height: BOARD_HEIGHT - SAFE_TOP, // Adjust board height to fit in remaining space
    backgroundColor: "transparent", 
    zIndex: 1, 
    overflow: "hidden" 
  },
  boardSurface: { 
    flex: 1, 
    backgroundColor: "#86efac", 
    borderRadius: 40,
    marginHorizontal: BOARD_PADDING, 
    marginTop: TOP_OFFSET, 
    overflow: "hidden" 
  },
  gridContainer: { 
    flexDirection: "row", 
    flexWrap: "wrap",
    marginTop: GRID_MARGIN_TOP, 
  },
  cardSlot: { 
    width: SLOT_W, 
    height: SLOT_H, 
    marginRight: GAP, 
    marginBottom: GAP, 
    borderWidth: 1, 
    borderColor: "rgba(0,0,0,0.08)", 
    borderRadius: 4,
    backgroundColor: "rgba(0,0,0,0.02)"
  },
  handArea: { height: HAND_HEIGHT, backgroundColor: "#333", width: "100%", zIndex: 100 },
  arrowButton: { position: "absolute", bottom: 20, alignSelf: "center", width: 24, height: 24, borderRadius: 12, backgroundColor: "#222", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#444" },
  
  // MENU
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.1)' },
  menuContainer: { position: 'absolute', backgroundColor: 'transparent', alignItems: 'center', width: 70 },
  
  // BUTTON OVERRIDES
  menuButton: {
    paddingVertical: 6,       
    paddingHorizontal: 8,    
    borderRadius: 6,          
    minWidth: 70,            
    marginBottom: 4,          
  },
  menuButtonText: {
    fontSize: 12,             
  }
});
