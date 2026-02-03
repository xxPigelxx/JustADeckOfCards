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
  deckCount: number, // Wie viele Decks? (1-4)
  playerCount: number, // Wie viele Spieler-Slots? (1-8)
  cardsPerPlayer: number, // NEU: Wie viele Karten kriegt jeder am Start?
) => {
  const config =
    DECK_TYPES[deckTypeStr as keyof typeof DECK_TYPES] ||
    DECK_TYPES["52 Karten"];
  const activeRanks = ALL_RANKS.slice(config.minRankIndex);

  // Slots berechnen (Mitte + Spieler)
  const mainDeckSlot = COLS * 1 + Math.floor(COLS / 2);

  const rowStart = COLS * 3; // Start 2. Reihe
  const startOffset = Math.max(0, Math.floor((COLS - playerCount) / 2));
  // Array der Ziel-Slots für Spieler: [8, 9, 10, 11] z.B.
  const playerSlots = Array.from(
    { length: playerCount },
    (_, i) => rowStart + i * 2,
  );

  let allCards: CardData[] = [];
  let idCounter = 1;

  // 1. Generieren
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
        suit: "★",
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

  // 3. Verteilen
  const boardCards: CardData[] = [];

  // A) Karten an Spieler austeilen
  // Wir gehen reihum, bis jeder 'cardsPerPlayer' hat.
  let cardIndex = 0;

  // Wir müssen sicherstellen, dass genug Karten da sind
  const cardsToDeal = playerCount * cardsPerPlayer;

  // Austeilen
  for (let i = 0; i < cardsToDeal && cardIndex < allCards.length; i++) {
    const card = allCards[cardIndex++];
    // Reihum verteilen: 0->P1, 1->P2, 2->P1...
    const playerIndex = i % playerCount;
    const targetSlot = playerSlots[playerIndex];

    boardCards.push({
      ...card,
      slot: targetSlot,
      zIndex: Math.floor(i / playerCount) + 1, // Z-Index stapelweise erhöhen
      isFaceUp: false, // Verdeckt (oder true, wenn sie offen liegen sollen?)
    });
  }

  // B) Rest ins Main Deck (Mitte)
  while (cardIndex < allCards.length) {
    const card = allCards[cardIndex++];
    boardCards.push({
      ...card,
      slot: mainDeckSlot,
      zIndex: cardIndex, // Einfach hochzählen
      isFaceUp: false,
    });
  }

  const handCards: CardData[] = [];

  return { boardCards, handCards };
};
