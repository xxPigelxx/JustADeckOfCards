import AppButton from "@/componets/AppButton";
import BurgerMenu from "@/componets/BurgerMenu";
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
const ANDROID_BAR = Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 0;
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
const BOARD_HEIGHT = SCREEN_H - HAND_HEIGHT; 
const FAN_SPREAD = 25;
const FAN_ANGLE = 5;
const FAN_CURVE = 3;
const SLOT_W = CARD_W;
const SLOT_H = CARD_H;
const ACTUAL_BOARD_W = SCREEN_W - (BOARD_PADDING * 2);
const AVAILABLE_HEIGHT = BOARD_HEIGHT - SAFE_TOP - TOP_OFFSET - GRID_MARGIN_TOP - BOARD_PADDING;

const COLS = Math.floor(ACTUAL_BOARD_W / (SLOT_W + GAP));
const ROWS = Math.floor(AVAILABLE_HEIGHT / (SLOT_H + GAP));
const TOTAL_SLOTS = ROWS * COLS;
const GRID_WIDTH = COLS * (SLOT_W + GAP) - GAP;
const GRID_OFFSET_X = (ACTUAL_BOARD_W - GRID_WIDTH) / 2;

export default function GameScreen() {
  const [maxZIndex, setMaxZIndex] = useState(100);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [highlightedSlot, setHighlightedSlot] = useState<number | null>(null);

  const [menuVisible, setMenuVisible] = useState(false);
  const [menuTargetSlot, setMenuTargetSlot] = useState<number | null>(null);
  const [menuTargetCardId, setMenuTargetCardId] = useState<string | null>(null); 
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });

  const [movingStackSlot, setMovingStackSlot] = useState<number | null>(null);

  const [boardCards, setBoardCards] = useState([
    { id: "c1", rank: "10", suit: "♦", slot: 4, zIndex: 1, isFaceUp: true },
    { id: "c2", rank: "K", suit: "♠", slot: 7, zIndex: 2, isFaceUp: true },
    { id: "c3", rank: "2", suit: "♠", slot: 4, zIndex: 3, isFaceUp: true }, 
    { id: "c4", rank: "5", suit: "♦", slot: 4, zIndex: 4, isFaceUp: true }, 
    { id: "c5", rank: "A", suit: "♠", slot: 4, zIndex: 5, isFaceUp: true }, 
  ]);

  const [handCards, setHandCards] = useState([
    { id: "h1", rank: "A", suit: "♥", isFaceUp: true },
    { id: "h2", rank: "7", suit: "♣", isFaceUp: true },
    { id: "h3", rank: "Q", suit: "♥", isFaceUp: true },
    { id: "h4", rank: "9", suit: "♠", isFaceUp: true },
    { id: "h5", rank: "6", suit: "♠", isFaceUp: true },
    { id: "h6", rank: "J", suit: "♣", isFaceUp: true },
    { id: "h7", rank: "3", suit: "♦", isFaceUp: true },
  ]);

  // --- ACTIONS ---

  const handleFlip = () => {
    setMenuVisible(false);
    if (menuTargetCardId && handCards.some(c => c.id === menuTargetCardId)) {
        setHandCards(prev => prev.map(c => c.id === menuTargetCardId ? { ...c, isFaceUp: !c.isFaceUp } : c));
        return;
    }
    if (menuTargetSlot !== null) {
        setBoardCards(prev => prev.map(c => {
            if (c.slot === menuTargetSlot) {
                return { ...c, isFaceUp: !c.isFaceUp }; 
            }
            return c;
        }));
    }
  };

  const handleShuffle = () => {
      setMenuVisible(false);
      if (menuTargetCardId && handCards.some(c => c.id === menuTargetCardId)) {
          setHandCards(prev => {
              const newHand = [...prev];
              for (let i = newHand.length - 1; i > 0; i--) {
                  const j = Math.floor(Math.random() * (i + 1));
                  [newHand[i], newHand[j]] = [newHand[j], newHand[i]];
              }
              return newHand;
          });
          return;
      }
      if (menuTargetSlot === null) return;
      setBoardCards(prev => {
          const cardsInSlot = prev.filter(c => c.slot === menuTargetSlot);
          const otherCards = prev.filter(c => c.slot !== menuTargetSlot);
          if (cardsInSlot.length < 2) return prev; 
          const shuffled = [...cardsInSlot];
          for (let i = shuffled.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1));
              [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
          }
          const baseZ = Math.min(...cardsInSlot.map(c => c.zIndex));
          const reIndexed = shuffled.map((c, i) => ({ ...c, zIndex: baseZ + i }));
          return [...otherCards, ...reIndexed];
      });
  };

  const handleTake = () => {
      setMenuVisible(false);
      if (menuTargetSlot === null) return;
      const cardsToTake = boardCards.filter(c => c.slot === menuTargetSlot);
      if (cardsToTake.length === 0) return;

      setBoardCards(prev => prev.filter(c => c.slot !== menuTargetSlot));
      setHandCards(prev => [
          ...prev, 
          ...cardsToTake.map(c => ({
              id: c.id, rank: c.rank, suit: c.suit, isFaceUp: c.isFaceUp 
          }))
      ]);
  };

  const handleMoveStack = () => {
      setMenuVisible(false);
      if (menuTargetSlot !== null) {
          setMovingStackSlot(menuTargetSlot);
      }
  };

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

  const getSlotFromCoords = (absX: number, absY: number) => {
    const localX = absX - BOARD_PADDING - GRID_OFFSET_X;
    const localY = absY - TOP_OFFSET - GRID_MARGIN_TOP - SAFE_TOP; 
    const col = Math.floor(localX / (SLOT_W + GAP));
    const row = Math.floor(localY / (SLOT_H + GAP));
    if (col < 0 || col >= COLS || row < 0 || row >= ROWS) return null;
    return row * COLS + col;
  };

  const handleDrag = (id: string, absX: number, absY: number) => {
    const isOverHand = absY > BOARD_HEIGHT - 30;
    if (isOverHand) {
        if (highlightedSlot !== null) setHighlightedSlot(null);
        return;
    }
    const slot = getSlotFromCoords(absX, absY);
    if (slot !== highlightedSlot) {
        setHighlightedSlot(slot);
    }
  };

  const handleDrop = (id: string, absX: number, absY: number) => {
    setHighlightedSlot(null);
    const isOverHand = absY > BOARD_HEIGHT - 30;
    const fromBoard = boardCards.find((c) => c.id === id);

    // 1. BULK MOVE LOGIC
    if (movingStackSlot !== null && fromBoard && fromBoard.slot === movingStackSlot) {
        
        if (isOverHand) {
             const cardsToMove = boardCards.filter(c => c.slot === movingStackSlot);
             cardsToMove.sort((a,b) => a.zIndex - b.zIndex);
             setBoardCards(prev => prev.filter(c => c.slot !== movingStackSlot));
             setHandCards(prev => [
                 ...prev,
                 ...cardsToMove.map(c => ({
                     id: c.id, rank: c.rank, suit: c.suit, isFaceUp: c.isFaceUp
                 }))
             ]);
             setMovingStackSlot(null);
             return;
        }

        const targetSlot = getSlotFromCoords(absX, absY);
        if (targetSlot === null) {
            setMovingStackSlot(null);
            return;
        }

        setBoardCards(prev => {
            const movingCards = prev.filter(c => c.slot === movingStackSlot);
            const otherCards = prev.filter(c => c.slot !== movingStackSlot);
            
            movingCards.sort((a, b) => a.zIndex - b.zIndex);

            let nextZ = maxZIndex + 1;
            const updatedMovingCards = movingCards.map(c => ({
                ...c,
                slot: targetSlot,
                zIndex: nextZ++
            }));

            setMaxZIndex(nextZ);
            return [...otherCards, ...updatedMovingCards];
        });
        
        setMovingStackSlot(null);
        return;
    }

    // 2. STANDARD DROP LOGIC
    if (isOverHand) {
      if (fromBoard) {
        setBoardCards((prev) => prev.filter((c) => c.id !== id));
        const targetIndex = getHandIndexFromX(absX);
        setHandCards((prev) => {
          const newHand = [...prev];
          const safeIndex = Math.min(prev.length, targetIndex);
          newHand.splice(safeIndex, 0, { ...fromBoard, id }); 
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

    const targetSlot = getSlotFromCoords(absX, absY);
    if (targetSlot === null) return; 

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
    if (movingStackSlot !== null) {
        setMovingStackSlot(null); 
        return; 
    }

    const card = boardCards.find(c => c.id === cardId) || handCards.find(c => c.id === cardId);
    if (!card) return;
    
    setMenuTargetCardId(cardId);
    const slot = 'slot' in card ? card.slot : null;
    setMenuTargetSlot(slot as number | null);

    const MENU_W = 70; 
    const inHand = handCards.find(c => c.id === cardId);

    if (inHand) {
      setMenuPosition({
        x: globalX + (CARD_W / 2) - (MENU_W / 2),
        y: globalY - CARD_H - 5 - SAFE_TOP  
      });
    } else {
      setMenuPosition({ 
        x: globalX + (CARD_W / 2) - (MENU_W / 2), 
        y: globalY + CARD_H + 5 - SAFE_TOP 
      });
    }
    setMenuVisible(true);
  };

  const cardsBySlot: { [key: number]: typeof boardCards } = {};
  boardCards.forEach((card) => {
    if (!cardsBySlot[card.slot]) cardsBySlot[card.slot] = [];
    cardsBySlot[card.slot].push(card);
  });
  Object.values(cardsBySlot).forEach(group => group.sort((a, b) => a.zIndex - b.zIndex));

  const renderContextMenu = () => {
    if (!menuVisible) return null;
    const isHand = menuTargetCardId && handCards.some(c => c.id === menuTargetCardId);
    const stack = menuTargetSlot !== null ? cardsBySlot[menuTargetSlot] || [] : [];
    const isStack = stack.length > 1;

    return (
      <Modal transparent visible={menuVisible} animationType="fade">
        <Pressable style={styles.overlay} onPress={() => setMenuVisible(false)}>
          <View style={[styles.menuContainer, { top: menuPosition.y, left: menuPosition.x }]}>
            <AppButton title="Flip" onPress={handleFlip} style={styles.menuButton} textStyle={styles.menuButtonText} /> 
            {isStack ? (
              <>
                <AppButton title="Mix" onPress={handleShuffle} style={styles.menuButton} textStyle={styles.menuButtonText} />
                <AppButton title="Move" onPress={handleMoveStack} style={styles.menuButton} textStyle={styles.menuButtonText} />
                <AppButton title="Take" onPress={handleTake} style={styles.menuButton} textStyle={styles.menuButtonText} />
              </>
            ) : isHand ? (
                <AppButton title="Mix" onPress={handleShuffle} style={styles.menuButton} textStyle={styles.menuButtonText} />
              
            ) : !isHand ? (
              <AppButton title="Take" onPress={handleTake} style={styles.menuButton} textStyle={styles.menuButtonText} />
            ) : null 
            } 
          </View>
        </Pressable>
      </Modal>
    );
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={{ height: SAFE_TOP, backgroundColor: '#333' }} />

      <View style={{ flex: 1 }}>
        <View style={styles.boardContainer}>
          <View style={styles.boardSurface}>
            <View style={[styles.gridContainer, { paddingLeft: GRID_OFFSET_X }]}>
              {Array.from({ length: TOTAL_SLOTS }).map((_, i) => (
                <View 
                    key={i} 
                    style={[
                        styles.cardSlot,
                        i === highlightedSlot && styles.activeSlot
                    ]} 
                />
              ))}
            </View>

            {Object.keys(cardsBySlot).map((slotKey) => {
                const stack = cardsBySlot[Number(slotKey)];
                const isMovingThisStack = movingStackSlot === Number(slotKey);
                
                if (isMovingThisStack) {
                     const leader = stack[stack.length - 1]; 
                     const col = leader.slot % COLS;
                     const row = Math.floor(leader.slot / COLS);
                     const baseX = GRID_OFFSET_X + col * (SLOT_W + GAP);
                     const baseY = GRID_MARGIN_TOP + row * (SLOT_H + GAP);
                     const globalX = baseX + BOARD_PADDING; 
                     const globalY = baseY + TOP_OFFSET + SAFE_TOP; 

                     return (
                        <View
                            key={`${leader.id}-slot-${leader.slot}`}
                            style={{
                                position: "absolute", left: baseX, top: baseY,
                                width: CARD_W, height: CARD_H, zIndex: 9999,
                            }}
                        >
                            <Card
                                {...leader}
                                isFaceUp={leader.isFaceUp} 
                                badgeCount={stack.length} // PASS COUNT HERE
                                x={0} y={0}
                                onDrop={handleDrop}
                                onDrag={handleDrag}
                                onTap={() => handleCardTap(leader.id, globalX, globalY)}
                                onDragStart={() => { setDraggedId(leader.id); bringToFront(leader.id); }}
                                onDragEnd={() => { setDraggedId(null); setHighlightedSlot(null); }}
                            />
                        </View>
                     );
                }

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
                    const globalX = baseX + offsetX + BOARD_PADDING; 
                    const globalY = baseY + offsetY + TOP_OFFSET + SAFE_TOP; 

                    return (
                        <View
                            key={`${card.id}-slot-${card.slot}`}
                            style={{
                                position: "absolute", left: baseX + offsetX, top: baseY + offsetY,
                                width: CARD_W, height: CARD_H, zIndex: card.zIndex,
                            }}
                        >
                            <Card
                                {...card}
                                isFaceUp={card.isFaceUp} 
                                x={0} y={0}
                                onDrop={handleDrop}
                                onDrag={handleDrag}
                                onTap={() => handleCardTap(card.id, globalX, globalY)}
                                onDragStart={() => { setDraggedId(card.id); bringToFront(card.id); }}
                                onDragEnd={() => { setDraggedId(null); setHighlightedSlot(null); }}
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
            const handRelativeY = (SCREEN_H - HAND_HEIGHT - SAFE_TOP) + 30 + translateY;
            const handGlobalY = handRelativeY + SAFE_TOP;
            return (
              <View
                key={`${card.id}-hand-${i}`}
                style={{
                  position: "absolute", left: x, top: 30 + translateY,
                  width: CARD_W, height: CARD_H,
                  transform: [{ rotate: isDragging ? "0deg" : `${rotation}deg` }],
                  zIndex: isDragging ? 99999 : i * 10,
                }}
              >
                <Card
                  {...card}
                  isFaceUp={card.isFaceUp}
                  x={0} y={0}
                  onDrop={handleDrop}
                  onDrag={handleDrag}
                  onTap={() => handleCardTap(card.id, x, handGlobalY)}
                  onDragStart={() => setDraggedId(card.id)}
                  onDragEnd={() => { setDraggedId(null); setHighlightedSlot(null); }}
                />
              </View>
            );
          })}
        </View>
      </View>
      <BurgerMenu />
      {renderContextMenu()}
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#333" },
  boardContainer: { height: BOARD_HEIGHT - SAFE_TOP, backgroundColor: "transparent", zIndex: 1, overflow: "hidden" },
  boardSurface: { flex: 1, backgroundColor: "#86efac", borderRadius: 40, marginHorizontal: BOARD_PADDING, marginTop: TOP_OFFSET, overflow: "hidden" },
  gridContainer: { flexDirection: "row", flexWrap: "wrap", marginTop: GRID_MARGIN_TOP },
  cardSlot: { 
    width: SLOT_W, height: SLOT_H, marginRight: GAP, marginBottom: GAP, 
    borderWidth: 1, borderColor: "rgba(0,0,0,0.08)", borderRadius: 4, backgroundColor: "rgba(0,0,0,0.02)"
  },
  activeSlot: {
    borderColor: "rgba(0,0,0,0.2)",
    backgroundColor: "rgba(0,0,0,0.15)",
    borderWidth: 2
  },
  handArea: { height: HAND_HEIGHT, backgroundColor: "#333", width: "100%", zIndex: 10 },
  overlay: { flex: 1, backgroundColor:'transparent' },
  menuContainer: { position: 'absolute', backgroundColor: 'transparent', alignItems: 'center', width: 70 },
  menuButton: { paddingVertical: 6, paddingHorizontal: 8, borderRadius: 6, minWidth: 70, marginBottom: 4 },
  menuButtonText: { fontSize: 12 }
});
