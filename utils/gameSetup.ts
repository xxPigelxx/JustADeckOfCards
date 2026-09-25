import { COLS } from "@/components/constants";
import { CardData } from "@/components/useGameLogic";

export const SUITS = ["♦", "♥", "♠", "♣"];
export const ALL_RANKS = [
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "J",
  "Q",
  "K",
  "A",
];

export const DECK_TYPES = {
  "54 Karten": { minRankIndex: 0, jokers: 2 },
  "52 Karten": { minRankIndex: 0, jokers: 0 },
  "36 Karten": { minRankIndex: 4, jokers: 0 },
  "32 Karten": { minRankIndex: 5, jokers: 0 },
  "24 Karten": { minRankIndex: 7, jokers: 0 },
};

export const generateGameData = (
  deckTypeStr: string,
  deckCount: number,
  playerCount: number,
  cardsPerPlayer: number,
) => {
  const config =
    DECK_TYPES[deckTypeStr as keyof typeof DECK_TYPES] ||
    DECK_TYPES["52 Karten"];

  // Schritt 1: Die "normalen" Ranks filtern (z.B. 2-A)
  const activeRanks = ALL_RANKS.slice(config.minRankIndex);

  let allCards: CardData[] = [];
  let idCounter = 1;

  // Schleife über Anzahl der Decks (falls man mit 2 Decks spielt)
  for (let d = 0; d < deckCount; d++) {
    SUITS.forEach((suit) => {
      activeRanks.forEach((rank) => {
        allCards.push({
          id: `d${d}-${suit}-${rank}-${idCounter++}`,
          rank,
          suit,
          isFaceUp: false,
          slot: 0,
          zIndex: 0,
        });
      });
    });

    for (let j = 0; j < config.jokers; j++) {
      allCards.push({
        id: `d${d}-joker-${j}-${idCounter++}`,
        rank: "JK",
        suit: "JOKER",
        isFaceUp: false,
        slot: 0,
        zIndex: 0,
      });
    }
  }

  // 2. Mischen
  for (let i = allCards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allCards[i], allCards[j]] = [allCards[j], allCards[i]];
  }
  const mainDeckSlot = COLS * 1 + Math.floor(COLS / 2);
  const rowStart = COLS * 3;
  const playerSlots = Array.from(
    { length: playerCount },
    (_, i) => rowStart + i * 2,
  );

  const boardCards: CardData[] = [];
  let cardIndex = 0;
  const cardsToDeal = playerCount * cardsPerPlayer;

  for (let i = 0; i < cardsToDeal && cardIndex < allCards.length; i++) {
    const card = allCards[cardIndex++];
    const playerIndex = i % playerCount;
    boardCards.push({
      ...card,
      slot: playerSlots[playerIndex],
      zIndex: Math.floor(i / playerCount) + 1,
    });
  }

  while (cardIndex < allCards.length) {
    const card = allCards[cardIndex++];
    boardCards.push({ ...card, slot: mainDeckSlot, zIndex: cardIndex });
  }

  return { boardCards, handCards: [] };
};
