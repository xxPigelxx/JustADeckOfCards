import BoardArea from "@/components/BoardArea";
import BurgerMenu from "@/components/BurgerMenu";
import CardMenu from "@/components/CardMenu";
import * as C from "@/components/constants";
import HandArea from "@/components/HandArea";
import { CardData, useGameLogic } from "@/components/useGameLogic";
import { generateGameData } from "@/utils/gameSetup";
import { useLocalSearchParams } from "expo-router";
import React, { useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function GameScreen() {
  const params = useLocalSearchParams();

  const initialData = useMemo(() => {
    const deckType = (params.deckType as string) || "52 Karten";
    const deckCount = Number(params.deckCount) || 1;
    const playerCount = Number(params.playerCount) || 4;
    const startCards = Number(params.startCards) || 0; // <--- NEU

    return generateGameData(deckType, deckCount, playerCount, startCards);
  }, [
    params.deckType,
    params.deckCount,
    params.playerCount,
    params.startCards,
  ]);

  // 2. Logic initialisieren
  const game = useGameLogic({
    initialBoard: initialData.boardCards,
    initialHand: initialData.handCards,
  });

  // 3. UI State
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuTargetSlot, setMenuTargetSlot] = useState<number | null>(null);
  const [menuTargetCardId, setMenuTargetCardId] = useState<string | null>(null);
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 });

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
      <View style={{ height: C.SAFE_TOP, backgroundColor: "#333" }} />

      <View style={{ flex: 1 }}>
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

      <BurgerMenu />

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
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#333" },
});
