import { applyAction } from "@/shared/game/rules";
import { CardData, GameAction, GameState, PlayerId } from "@/shared/game/types";
import {
  boardToSlot,
  getHandIndexFromX,
  isOverHand,
  screenToBoard,
} from "@/utils/boardGeometry";
import { useEffect, useState } from "react";

export type { CardData } from "@/shared/game/types";

// Player id for a game on this device only (no server)
export const LOCAL_PLAYER: PlayerId = "local";

interface GameLogicProps {
  // Offline: the dealt game. Online: the latest state from the server,
  // which replaces the local state whenever it changes.
  initialState: GameState;
  playerId?: PlayerId;
  // Online: sends an action to the server
  onAction?: (action: GameAction) => void;
}

// Game state is changed only through the shared rules (applyAction); this
// hook adds the UI state and turns finger positions into actions.
export const useGameLogic = ({
  initialState,
  playerId = LOCAL_PLAYER,
  onAction,
}: GameLogicProps) => {
  const [state, setState] = useState<GameState>(initialState);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [highlightedSlot, setHighlightedSlot] = useState<number | null>(null);
  const [movingStackSlot, setMovingStackSlot] = useState<number | null>(null);

  useEffect(() => {
    setState(initialState);
  }, [initialState]);

  const boardCards = state.board;
  const handCards: CardData[] = state.hands[playerId] ?? [];

  // Online the result only counts when the server sends it back, but most
  // actions are applied right away so the table reacts without delay
  const predictable = (action: GameAction) => {
    if (action.type === "shuffleSlot" || action.type === "shuffleHand") {
      return false; // the server decides the random order
    }
    if (action.type === "flipSlot") {
      // Face-down cards arrive without rank/suit, so they can't be shown yet
      return state.board.every((c) => c.slot !== action.slot || c.rank);
    }
    return true;
  };

  const dispatch = (action: GameAction) => {
    if (!onAction || predictable(action)) {
      setState((prev) => applyAction(prev, playerId, action));
    }
    onAction?.(action);
  };

  const isInHand = (id: string | null) =>
    !!id && handCards.some((c) => c.id === id);

  // --- HELPER: Detect Board Slot ---
  const getSlotFromCoords = (absX: number, absY: number) =>
    boardToSlot(screenToBoard({ x: absX, y: absY }));

  // --- ACTIONS (card menu) ---

  const flipCard = (id: string | null, slot: number | null) => {
    if (isInHand(id)) dispatch({ type: "flipHandCard", cardId: id! });
    else if (slot !== null) dispatch({ type: "flipSlot", slot });
  };

  const flipAllHand = () => dispatch({ type: "flipHand" });

  const shuffleHand = () => dispatch({ type: "shuffleHand" });

  // On a hand card this shuffles the hand
  const shuffleStack = (id: string | null, slot: number | null) => {
    if (isInHand(id)) shuffleHand();
    else if (slot !== null) dispatch({ type: "shuffleSlot", slot });
  };

  const takeStack = (slot: number | null) => {
    if (slot !== null) dispatch({ type: "takeStack", slot });
  };

  // --- DRAG HANDLERS ---

  const handleDrag = (id: string, absX: number, absY: number) => {
    if (isOverHand(absY)) {
      if (highlightedSlot !== null) setHighlightedSlot(null);
      return;
    }
    const slot = getSlotFromCoords(absX, absY);
    if (slot !== highlightedSlot) setHighlightedSlot(slot);
  };

  const handleDrop = (id: string, absX: number, absY: number) => {
    setHighlightedSlot(null);
    const overHand = isOverHand(absY);
    const targetSlot = overHand ? null : getSlotFromCoords(absX, absY);
    const fromBoard = boardCards.find((c) => c.id === id);

    // 1. Moving a whole stack ("Verschieben" in the card menu)
    if (movingStackSlot !== null && fromBoard?.slot === movingStackSlot) {
      if (overHand) {
        takeStack(movingStackSlot);
      } else if (targetSlot !== null) {
        dispatch({
          type: "moveStack",
          fromSlot: movingStackSlot,
          toSlot: targetSlot,
        });
      }
      setMovingStackSlot(null);
      return;
    }

    // 2. Into the hand (from the board, or sorting the hand)
    if (overHand) {
      dispatch({
        type: "moveToHand",
        cardId: id,
        index: getHandIndexFromX(absX, handCards.length),
      });
      return;
    }

    // 3. Onto a board slot (dropped outside the grid: nothing happens)
    if (targetSlot !== null) {
      dispatch({ type: "moveToSlot", cardId: id, slot: targetSlot });
    }
  };

  return {
    boardCards,
    handCards,
    highlightedSlot,
    draggedId,
    movingStackSlot,
    setDraggedId,
    setHighlightedSlot,
    setMovingStackSlot,
    handleDrop,
    handleDrag,
    actions: {
      flipCard,
      flipAllHand,
      shuffleHand,
      shuffleStack,
      takeStack,
    },
  };
};
