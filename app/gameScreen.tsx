import BoardArea from "@/components/BoardArea";
import BurgerMenu from "@/components/BurgerMenu";
import CardMenu from "@/components/CardMenu";
import * as C from "@/components/constants";
import CustomAlert from "@/components/CustomAlert";
import HandArea from "@/components/HandArea";
import { CardData, useGameLogic } from "@/components/useGameLogic";
import { generateGameData } from "@/utils/gameSetup";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useMemo, useState } from "react";
import { BackHandler, StyleSheet, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function GameScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();

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

  // --- NEU: Wir ermitteln die QUELLE des Drags ---
  const draggedSource = useMemo(() => {
    if (!game.draggedId) return null;
    // Ist die Karte in der Hand?
    if (game.handCards.find((c) => c.id === game.draggedId)) {
      return "hand";
    }
    // Sonst ist sie auf dem Board
    return "board";
  }, [game.draggedId, game.handCards]);

  // --- NEU: Dynamische Z-Indexe basierend auf der Quelle ---
  // Standard: Hand (10) liegt über Board (1), damit man Karten reinstecken kann.
  // Wenn Board gezogen wird: Board (100) muss über Hand liegen.
  // Wenn Hand gezogen wird: Hand (100) muss über Board liegen.
  const boardZIndex = draggedSource === "board" ? 100 : 1;
  const handZIndex = draggedSource === "hand" ? 100 : 10;

  const [menuVisible, setMenuVisible] = useState(false);
  const [menuTargetSlot, setMenuTargetSlot] = useState<number | null>(null);
  const [menuTargetCardId, setMenuTargetCardId] = useState<string | null>(null);
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 });
  const [exitModalVisible, setExitModalVisible] = useState(false);

  useEffect(() => {
    const onBackPress = () => {
      if (exitModalVisible) setExitModalVisible(false);
      else setExitModalVisible(true);
      return true;
    };
    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      onBackPress,
    );
    return () => subscription.remove();
  }, [exitModalVisible]);

  const handleLeaveGame = () => setExitModalVisible(true);
  const confirmExit = () => {
    setExitModalVisible(false);
    router.replace("/");
  };

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
    const inHand = game.handCards.find((c) => c.id === cardId);

    if (inHand) {
      setMenuPos({
        x: globalX + C.CARD_W / 2 - MENU_W / 2,
        y: globalY - C.CARD_H - 5 - C.SAFE_TOP,
      });
    } else {
      setMenuPos({
        x: globalX + C.CARD_W / 2 - MENU_W / 2,
        y: globalY + C.CARD_H + 5 - C.SAFE_TOP,
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
        {/* BOARD AREA mit dynamischem zIndex */}
        <View style={{ flex: 1, zIndex: boardZIndex, elevation: boardZIndex }}>
          <BoardArea
            boardCards={game.boardCards}
            highlightedSlot={game.highlightedSlot}
            movingStackSlot={game.movingStackSlot}
            draggedId={game.draggedId}
            onDrop={game.handleDrop}
            onDrag={game.handleDrag}
            onTap={handleCardTap}
            onDragStart={(id) => {
              game.setDraggedId(id);
              game.bringToFront(id);
            }}
            onDragEnd={() => {
              game.setDraggedId(null);
              game.setHighlightedSlot(null);
            }}
          />
        </View>

        {/* HAND AREA mit dynamischem zIndex */}
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
            onDrop={game.handleDrop}
            onDrag={game.handleDrag}
            onTap={handleCardTap}
            onDragStart={(id) => game.setDraggedId(id)}
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
        }}
      />

      <CustomAlert
        visible={exitModalVisible}
        title="Lobby verlassen"
        message="Möchtest du die Lobby wirklich verlassen?"
        onConfirm={confirmExit}
        onCancel={() => setExitModalVisible(false)}
      />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#333" },
});
