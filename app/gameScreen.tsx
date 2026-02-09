import BoardArea from "@/components/BoardArea";
import BurgerMenu from "@/components/BurgerMenu";
import CardMenu from "@/components/CardMenu";
import * as C from "@/components/constants";
import CustomAlert from "@/components/CustomAlert";
import HandArea from "@/components/HandArea";
import HandGridOverlay from "@/components/HandGridOverlay"; // Verwenden wir jetzt
import HandGridToggleButton from "@/components/HandGridToggleButton";
import { CardData, useGameLogic } from "@/components/useGameLogic";
import {
  DEFAULT_BACK_COLOR,
  DEFAULT_PATTERN,
  loadCardBack,
  loadCardPattern,
} from "@/utils/designStorage";
import { generateGameData } from "@/utils/gameSetup";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useMemo, useState } from "react";
import { BackHandler, StyleSheet, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function GameScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();

  // --- Design State ---
  const [cardBackColor, setCardBackColor] = useState(DEFAULT_BACK_COLOR);
  const [cardBackPattern, setCardBackPattern] = useState(DEFAULT_PATTERN);

  useFocusEffect(
    useCallback(() => {
      Promise.all([loadCardBack(), loadCardPattern()]).then(
        ([color, pattern]) => {
          setCardBackColor(color);
          setCardBackPattern(pattern);
        },
      );
    }, []),
  );

  const initialData = useMemo(() => {
    const deckType = (params.deckType as string) || "52 Karten";
    const deckCount = Number(params.deckCount) || 1;
    const playerCount = Number(params.playerCount) || 4;
    const startCards = Number(params.startCards) || 0;

    return generateGameData(deckType, deckCount, playerCount, startCards);
  }, [
    params.deckType,
    params.deckCount,
    params.playerCount,
    params.startCards,
  ]);

  const game = useGameLogic({
    initialBoard: initialData.boardCards,
    initialHand: initialData.handCards,
  });

  // --- Smart zIndex Fix ---
  const draggedSource = useMemo(() => {
    if (!game.draggedId) return null;
    if (game.handCards.find((c) => c.id === game.draggedId)) {
      return "hand";
    }
    return "board";
  }, [game.draggedId, game.handCards]);

  const boardZIndex = draggedSource === "board" ? 100 : 1;
  const handZIndex = draggedSource === "hand" ? 100 : 10;

  // UI States
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuTargetSlot, setMenuTargetSlot] = useState<number | null>(null);
  const [menuTargetCardId, setMenuTargetCardId] = useState<string | null>(null);
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 });
  const [exitModalVisible, setExitModalVisible] = useState(false);

  // Hand Grid Modal State
  const [handGridVisible, setHandGridVisible] = useState(false);

  // Back Button Handler
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (handGridVisible) {
          setHandGridVisible(false);
          return true;
        }
        if (exitModalVisible) {
          setExitModalVisible(false);
          return true;
        }
        setExitModalVisible(true);
        return true;
      };

      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress,
      );

      return () => subscription.remove();
    }, [exitModalVisible, handGridVisible]),
  );

  const handleLeaveGame = () => setExitModalVisible(true);
  const confirmExit = () => {
    setExitModalVisible(false);
    router.replace("/");
  };

  // --- FIXED COORDINATE CALCULATION ---
  const handleCardTap = (cardId: string, globalX: number, globalY: number) => {
    if (game.movingStackSlot !== null) {
      game.setMovingStackSlot(null);
      return;
    }
    const card =
      game.boardCards.find((c) => c.id === cardId) ||
      game.handCards.find((c) => c.id === cardId);
    if (!card) return;

    setMenuTargetCardId(cardId);
    setMenuTargetSlot(card.slot ?? null);

    const MENU_W = 70;
    const MENU_H_ESTIMATE = 80; // Approx height of menu buttons
    const inHand = game.handCards.find((c) => c.id === cardId);

    if (inHand) {
      // Hand Cards: Position Menu ABOVE the card
      // We subtract the menu height to push it up
      setMenuPos({
        x: globalX + C.CARD_W / 2 - MENU_W / 2,
        y: globalY - MENU_H_ESTIMATE,
      });
    } else {
      // Board Cards: Position Menu BELOW the card
      // We add the card height + padding to push it down
      setMenuPos({
        x: globalX + C.CARD_W / 2 - MENU_W / 2,
        y: globalY + C.CARD_H + 5,
      });
    }
    setMenuVisible(true);
  };

  const cardsBySlot: { [key: number]: CardData[] } = {};
  game.boardCards.forEach((card) => {
    if (!cardsBySlot[card.slot!]) cardsBySlot[card.slot!] = [];
    cardsBySlot[card.slot!].push(card);
  });
  Object.values(cardsBySlot).forEach((group) =>
    group.sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0)),
  );

  return (
    <GestureHandlerRootView style={styles.container}>
      <StatusBar style="light" />
      <View style={{ height: C.SAFE_TOP, backgroundColor: "#333" }} />

      <View style={{ flex: 1 }}>
        {/* BOARD AREA */}
        <View style={{ flex: 1, zIndex: boardZIndex, elevation: boardZIndex }}>
          <BoardArea
            boardCards={game.boardCards}
            highlightedSlot={game.highlightedSlot}
            movingStackSlot={game.movingStackSlot}
            draggedId={game.draggedId}
            cardBackColor={cardBackColor}
            cardBackPattern={cardBackPattern}
            onDrop={game.handleDrop}
            onDrag={game.handleDrag}
            onTap={handleCardTap}
            onDragStart={(id) => {
              game.setDraggedId(id);
              game.bringToFront(id);
              setMenuVisible(false);
            }}
            onDragEnd={() => {
              game.setDraggedId(null);
              game.setHighlightedSlot(null);
            }}
          />
        </View>

        {/* TOGGLE BUTTON */}
        {game.handCards.length > 0 && !handGridVisible && (
          <HandGridToggleButton
            onPress={() => setHandGridVisible(true)}
            style={styles.gridToggleButton}
          />
        )}

        {/* HAND AREA */}
        <View
          style={{
            height: C.HAND_HEIGHT,
            zIndex: handZIndex,
            elevation: handZIndex,
          }}
        >
          <HandArea
            handCards={game.handCards}
            draggedId={game.draggedId}
            cardBackColor={cardBackColor}
            cardBackPattern={cardBackPattern}
            onDrop={game.handleDrop}
            onDrag={game.handleDrag}
            onTap={handleCardTap}
            onDragStart={(id) => {
              game.setDraggedId(id);
              setMenuVisible(false);
            }}
            onDragEnd={() => {
              game.setDraggedId(null);
              game.setHighlightedSlot(null);
            }}
          />
        </View>
      </View>

      <BurgerMenu onLeave={handleLeaveGame} />

      <CardMenu
        visible={menuVisible}
        position={menuPos}
        targetCardId={menuTargetCardId}
        targetSlot={menuTargetSlot}
        handCards={game.handCards}
        cardsBySlot={cardsBySlot}
        onClose={() => setMenuVisible(false)}
        actions={{
          flipCard: game.actions.flipCard,
          shuffleStack: game.actions.shuffleStack,
          moveStack: game.setMovingStackSlot,
          takeStack: game.actions.takeStack,
          flipAllHand: game.actions.flipAllHand,
          shuffleHand: game.actions.shuffleHand,
        }}
      />

      {/* Hand Grid Overlay */}
      <HandGridOverlay
        visible={handGridVisible}
        handCards={game.handCards}
        cardBackColor={cardBackColor}
        cardBackPattern={cardBackPattern}
        onClose={() => setHandGridVisible(false)}
        // HIER SIND DIE ECHTEN FUNKTIONEN:
        onDragStart={(id) => game.setDraggedId(id)}
        onDrag={game.handleDrag}
        onDrop={game.handleDrop}
        onDragEnd={() => {
          game.setDraggedId(null);
          game.setHighlightedSlot(null);
        }}
      />

      <CustomAlert
        visible={exitModalVisible}
        title="Spiel verlassen"
        message="Möchtest du das Spiel wirklich verlassen?"
        onConfirm={confirmExit}
        onCancel={() => setExitModalVisible(false)}
      />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#333" },

  gridToggleButton: {
    position: "absolute",
    bottom: 40,
    left: 40,
    zIndex: 200,
  },
});
