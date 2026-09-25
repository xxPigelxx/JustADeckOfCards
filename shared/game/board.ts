// Board layout shared by app and server (no React Native imports here).
// Positions on the board are slot numbers: row * BOARD_COLS + col.

export const BOARD_COLS = 20;
export const BOARD_ROWS = 20;
export const TOTAL_SLOTS = BOARD_COLS * BOARD_ROWS;

// The deck lies in the middle of the board (the camera starts there),
// the player piles two rows below it with an empty slot between each
const DECK_COL = Math.floor(BOARD_COLS / 2);
const DECK_ROW = Math.floor(BOARD_ROWS / 2) - 1;
const PILE_ROW = DECK_ROW + 2;

export const DECK_SLOT = DECK_ROW * BOARD_COLS + DECK_COL;

// Slot of pile `index` when `pileCount` piles are dealt, centered below the deck
export const pileSlot = (index: number, pileCount: number) =>
  PILE_ROW * BOARD_COLS + DECK_COL - (pileCount - 1) + index * 2;

export const isValidSlot = (slot: unknown): slot is number =>
  Number.isInteger(slot) &&
  (slot as number) >= 0 &&
  (slot as number) < TOTAL_SLOTS;
