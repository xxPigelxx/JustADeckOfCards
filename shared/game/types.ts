export type PlayerId = string;

export interface Card {
  id: string;
  rank: string;
  suit: string;
  isFaceUp: boolean;
}

export interface BoardCard extends Card {
  slot: number;
  zIndex: number;
}

// Card as used by the UI components (board or hand)
export type CardData = Card & { slot?: number; zIndex?: number };

export interface GameState {
  board: BoardCard[];
  hands: Record<PlayerId, Card[]>;
  // Highest zIndex on the board; a card moved onto a slot goes on top
  maxZIndex: number;
}

export interface GameConfig {
  deckType: string;
  deckCount: number;
  // Piles dealt on the board (one per player online, the slider value offline)
  pileCount: number;
  cardsPerPile: number;
}

export type GameAction =
  | { type: "moveToSlot"; cardId: string; slot: number }
  | { type: "moveToHand"; cardId: string; index: number }
  | { type: "moveStack"; fromSlot: number; toSlot: number }
  | { type: "takeStack"; slot: number }
  | { type: "flipSlot"; slot: number }
  | { type: "flipHandCard"; cardId: string }
  | { type: "flipHand" }
  | { type: "shuffleSlot"; slot: number }
  | { type: "shuffleHand" };

// What one player is allowed to see of a game
export interface PlayerView {
  board: BoardCard[];
  hand: Card[];
  handCounts: Record<PlayerId, number>;
  maxZIndex: number;
}
