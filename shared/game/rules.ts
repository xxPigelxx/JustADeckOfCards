import { isValidSlot } from "./board";
import { Random, shuffle } from "./setup";
import { BoardCard, Card, GameAction, GameState, PlayerId } from "./types";

// Rules of the table: the board is shared (anyone may act on it), hand cards
// may only be used by their owner. Pure function: an invalid action returns
// the unchanged state.

const toHandCard = ({ id, rank, suit, isFaceUp }: BoardCard | Card): Card => ({
  id,
  rank,
  suit,
  isFaceUp,
});

const clampIndex = (index: number, length: number) =>
  Number.isFinite(index)
    ? Math.max(0, Math.min(length, Math.floor(index)))
    : length;

const slotCards = (state: GameState, slot: number) =>
  state.board.filter((c) => c.slot === slot);

export const applyAction = (
  state: GameState,
  playerId: PlayerId,
  action: GameAction,
  random: Random = Math.random,
): GameState => {
  const hand = state.hands[playerId];
  if (!hand) return state;

  const withHand = (
    next: Card[],
    board = state.board,
    maxZIndex = state.maxZIndex,
  ) => ({
    board,
    hands: { ...state.hands, [playerId]: next },
    maxZIndex,
  });

  switch (action.type) {
    // Board -> board or hand -> board; the card goes on top of the slot
    case "moveToSlot": {
      if (!isValidSlot(action.slot)) return state;
      const z = state.maxZIndex + 1;
      const onBoard = state.board.find((c) => c.id === action.cardId);
      if (onBoard) {
        return {
          ...state,
          board: state.board.map((c) =>
            c.id === action.cardId ? { ...c, slot: action.slot, zIndex: z } : c,
          ),
          maxZIndex: z,
        };
      }
      const inHand = hand.find((c) => c.id === action.cardId);
      if (!inHand) return state;
      return withHand(
        hand.filter((c) => c.id !== action.cardId),
        [...state.board, { ...inHand, slot: action.slot, zIndex: z }],
        z,
      );
    }

    // Board -> hand (insert at index) or reorder the own hand
    case "moveToHand": {
      const onBoard = state.board.find((c) => c.id === action.cardId);
      if (onBoard) {
        const next = [...hand];
        next.splice(
          clampIndex(action.index, next.length),
          0,
          toHandCard(onBoard),
        );
        return withHand(
          next,
          state.board.filter((c) => c.id !== action.cardId),
        );
      }
      const oldIndex = hand.findIndex((c) => c.id === action.cardId);
      if (oldIndex === -1) return state;
      const next = [...hand];
      const [card] = next.splice(oldIndex, 1);
      next.splice(clampIndex(action.index, next.length), 0, card);
      return withHand(next);
    }

    // Whole stack to another slot, keeping its order, on top of that slot
    case "moveStack": {
      if (!isValidSlot(action.fromSlot) || !isValidSlot(action.toSlot)) {
        return state;
      }
      const moving = slotCards(state, action.fromSlot).sort(
        (a, b) => a.zIndex - b.zIndex,
      );
      if (!moving.length) return state;
      let z = state.maxZIndex;
      const moved = moving.map((c) => ({
        ...c,
        slot: action.toSlot,
        zIndex: ++z,
      }));
      return {
        ...state,
        board: [
          ...state.board.filter((c) => c.slot !== action.fromSlot),
          ...moved,
        ],
        maxZIndex: z,
      };
    }

    // Whole stack into the own hand (bottom card first)
    case "takeStack": {
      const taken = slotCards(state, action.slot).sort(
        (a, b) => a.zIndex - b.zIndex,
      );
      if (!taken.length) return state;
      return withHand(
        [...hand, ...taken.map(toHandCard)],
        state.board.filter((c) => c.slot !== action.slot),
      );
    }

    case "flipSlot": {
      if (!slotCards(state, action.slot).length) return state;
      return {
        ...state,
        board: state.board.map((c) =>
          c.slot === action.slot ? { ...c, isFaceUp: !c.isFaceUp } : c,
        ),
      };
    }

    case "flipHandCard": {
      if (!hand.some((c) => c.id === action.cardId)) return state;
      return withHand(
        hand.map((c) =>
          c.id === action.cardId ? { ...c, isFaceUp: !c.isFaceUp } : c,
        ),
      );
    }

    // All face up if any is face down, otherwise all face down
    case "flipHand": {
      if (!hand.length) return state;
      const allFaceUp = hand.every((c) => c.isFaceUp);
      return withHand(hand.map((c) => ({ ...c, isFaceUp: !allFaceUp })));
    }

    // New order within the slot, keeping the stack's zIndex range
    case "shuffleSlot": {
      const stack = slotCards(state, action.slot);
      if (stack.length < 2) return state;
      const baseZ = Math.min(...stack.map((c) => c.zIndex));
      const shuffled = shuffle([...stack], random).map((c, i) => ({
        ...c,
        zIndex: baseZ + i,
      }));
      return {
        ...state,
        board: [
          ...state.board.filter((c) => c.slot !== action.slot),
          ...shuffled,
        ],
      };
    }

    case "shuffleHand": {
      if (hand.length < 2) return state;
      return withHand(shuffle([...hand], random));
    }

    default:
      return state;
  }
};
