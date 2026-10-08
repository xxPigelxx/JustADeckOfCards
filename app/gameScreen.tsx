import BoardArea from "@/components/BoardArea";
import BurgerMenu from "@/components/BurgerMenu";
import CardMenu from "@/components/CardMenu";
import * as C from "@/components/constants";
import CustomAlert from "@/components/CustomAlert";
import DragLayer, { useDragLayer } from "@/components/DragLayer";
import HandArea from "@/components/HandArea";
import HandGridOverlay from "@/components/HandGridOverlay";
import HandGridToggleButton from "@/components/HandGridToggleButton";
import PlayerListPopup, { PlayerRow } from "@/components/PlayerListPopup";
import { useCamera } from "@/components/useCamera";
import {
  CardData,
  LOCAL_PLAYER,
  useGameLogic,
} from "@/components/useGameLogic";
import InfoAlert from "@/components/InfoAlert";
import {
  clearLostRoom,
  leaveRoom,
  resumeRoom,
  sendAction,
  useRoom,
} from "@/components/useRoom";
import { DECK_SLOT } from "@/shared/game/board";
import { createGame } from "@/shared/game/setup";
import { GameState } from "@/shared/game/types";
import { viewToState } from "@/shared/game/view";
import { playerLabel } from "@/shared/protocol";
import { getCameraZoom, slotCenter } from "@/utils/boardGeometry";
import {
  DEFAULT_BACK_COLOR,
  DEFAULT_PATTERN,
  loadCardBack,
  loadCardPattern,
} from "@/utils/designStorage";
import { Feather } from "@expo/vector-icons"; // Import für das Icon
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  BackHandler,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

// Online, until the server's first game view has arrived
const EMPTY_GAME: GameState = { board: [], hands: {}, maxZIndex: 0 };

export default function GameScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();

  // Online: game of the joined room (started from the invite screen)
  const { room, view, connected, lost } = useRoom();
  const wantsOnline = params.mode === "online";
  const online = wantsOnline && room?.status === "playing";
  const lobbyCode = online ? room.code : wantsOnline ? "…" : "OFFLINE";
  const disconnected = wantsOnline && !connected && !lost;

  // Page reloaded or app reopened on this screen: take the seat back
  const resumeTried = useRef(false);
  useEffect(() => {
    if (!wantsOnline || room || lost || resumeTried.current) return;
    resumeTried.current = true;
    resumeRoom();
  }, [wantsOnline, room, lost]);

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

  const offlinePlayerCount = Number(params.playerCount) || 1;
  const playerCount = wantsOnline
    ? (room?.players.length ?? 0)
    : offlinePlayerCount;

  // Offline game: one pile per player on the board, one hand on this device
  const offlineState = useMemo(
    () =>
      createGame(
        {
          deckType: (params.deckType as string) || "52 Karten",
          deckCount: Number(params.deckCount) || 1,
          pileCount: offlinePlayerCount,
          cardsPerPile: Number(params.startCards) || 0,
        },
        [LOCAL_PLAYER],
      ),
    [params.deckType, params.deckCount, offlinePlayerCount, params.startCards],
  );

  // Online game: what the server lets this player see
  const onlineState = useMemo(
    () => (online && view ? viewToState(view, room.you) : EMPTY_GAME),
    [online, view, room?.you],
  );

  // An online game never falls back to a local game, even while reconnecting
  const game = useGameLogic(
    wantsOnline
      ? {
          initialState: onlineState,
          playerId: room?.you ?? LOCAL_PLAYER,
          onAction: sendAction,
        }
      : { initialState: offlineState },
  );

  // UI States
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuTargetSlot, setMenuTargetSlot] = useState<number | null>(null);
  const [menuTargetCardId, setMenuTargetCardId] = useState<string | null>(null);
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 });
  const [exitModalVisible, setExitModalVisible] = useState(false);

  // The card menu is placed next to its card, so it closes when the board moves
  const camera = useCamera(slotCenter(DECK_SLOT), () => setMenuVisible(false));
  const dragLayer = useDragLayer();

  // Hand Grid Modal State
  const [handGridVisible, setHandGridVisible] = useState(false);

  // Player list (burger menu): other hands only as a count (from the server)
  const [playersVisible, setPlayersVisible] = useState(false);
  const playerRows: PlayerRow[] = online
    ? room.players.map((p) => ({
        id: p.id,
        label: playerLabel(p),
        cards:
          p.id === room.you
            ? game.handCards.length
            : (view?.handCounts[p.id] ?? 0),
        connected: p.connected,
        isYou: p.id === room.you,
        isHost: p.id === room.hostId,
      }))
    : [
        {
          id: LOCAL_PLAYER,
          label: "Du",
          cards: game.handCards.length,
          connected: true,
          isYou: false,
          isHost: false,
        },
      ];

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
    if (wantsOnline) leaveRoom();
    router.replace("/");
  };

  // The room no longer exists: back to the start screen
  const closeLostGame = () => {
    clearLostRoom();
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

    const MENU_W = 100;
    const MENU_H_ESTIMATE = 100; // Approx height of menu buttons
    const inHand = game.handCards.find((c) => c.id === cardId);

    if (inHand) {
      setMenuPos({
        x: globalX + C.CARD_W / 2 - MENU_W / 2,
        y: globalY - MENU_H_ESTIMATE,
      });
    } else {
      // Board cards are scaled by the camera
      const zoom = getCameraZoom();
      setMenuPos({
        x: globalX + (C.CARD_W * zoom) / 2 - MENU_W / 2,
        y: globalY + C.CARD_H * zoom + 10,
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

      {/* --- LOBBY CODE PILL (player list: burger menu → "Spieler") --- */}
      <View
        style={[styles.lobbyPill, disconnected && styles.lobbyPillOffline]}
        pointerEvents="none"
      >
        {disconnected && <Feather name="wifi-off" size={16} color="white" />}
        <Feather
          name="hash"
          size={18}
          style={{ marginRight: -5 }}
          color="white"
        />
        <Text style={styles.lobbyText}>: {lobbyCode} </Text>
        <Feather
          name="users"
          size={18}
          style={{ marginRight: -3 }}
          color="white"
        />
        <Text style={styles.lobbyText}>: {playerCount}</Text>
      </View>
      {/* ----------------------------- */}

      <View style={{ flex: 1 }}>
        {/* BOARD AREA */}
        <View style={{ flex: 1, zIndex: 1 }}>
          <BoardArea
            camera={camera}
            dragLayer={dragLayer}
            boardCards={game.boardCards}
            cardsBySlot={cardsBySlot}
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
        <View style={{ height: C.HAND_HEIGHT, zIndex: 10 }}>
          <HandArea
            dragLayer={dragLayer}
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

      {/* Dragged card, drawn above board and hand */}
      <DragLayer layer={dragLayer} />

      {/* Online game without room yet (reloaded page, reopened app) */}
      {wantsOnline && !online && !lost && (
        <View style={styles.reconnectBox} pointerEvents="none">
          <Text style={styles.reconnectText}>Verbinde neu…</Text>
        </View>
      )}

      {/* Zoom buttons (web only, touch devices use pinch) */}
      {Platform.OS === "web" && (
        <View style={styles.zoomButtons}>
          <Pressable
            style={styles.zoomButton}
            onPress={() => camera.zoomBy(1.25)}
          >
            <Feather name="plus" size={22} color="white" />
          </Pressable>
          <Pressable
            style={styles.zoomButton}
            onPress={() => camera.zoomBy(0.8)}
          >
            <Feather name="minus" size={22} color="white" />
          </Pressable>
        </View>
      )}

      <BurgerMenu
        onLeave={handleLeaveGame}
        onResetView={camera.resetView}
        onShowPlayers={() => setPlayersVisible(true)}
      />

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
        onDragStart={(id) => game.setDraggedId(id)}
        onDrag={game.handleDrag}
        onDrop={game.handleDrop}
        onDragEnd={() => {
          game.setDraggedId(null);
          game.setHighlightedSlot(null);
        }}
      />

      <InfoAlert
        visible={wantsOnline && lost}
        title="Spiel beendet"
        message="Dieses Spiel gibt es nicht mehr. Vielleicht haben alle Spieler es verlassen oder der Server wurde neu gestartet."
        onClose={closeLostGame}
      />

      <PlayerListPopup
        visible={playersVisible}
        players={playerRows}
        onClose={() => setPlayersVisible(false)}
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

  lobbyPillOffline: {
    backgroundColor: "#b91c1c",
  },

  reconnectBox: {
    position: "absolute",
    top: "40%",
    alignSelf: "center",
    backgroundColor: "rgba(0,0,0,0.75)",
    borderRadius: 15,
    paddingVertical: 12,
    paddingHorizontal: 20,
    zIndex: 950,
  },

  reconnectText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },

  lobbyPill: {
    position: "absolute",
    top: C.SAFE_TOP - 15,
    alignSelf: "center",
    backgroundColor: "black",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    zIndex: 900,
    elevation: 900,
  },

  zoomButtons: {
    position: "absolute",
    top: C.SAFE_TOP + 30,
    right: 24,
    gap: 10,
    zIndex: 900,
  },

  zoomButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "black",
    alignItems: "center",
    justifyContent: "center",
  },

  lobbyText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
    letterSpacing: 1,
  },
});
