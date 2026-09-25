import { DECK_SLOT, pileSlot } from "./board";
import { BoardCard, Card, GameConfig, GameState, PlayerId } from "./types";

export type Random = () => number;

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

// Fisher–Yates, in place
export const shuffle = <T>(items: T[], random: Random) => {
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
};

// Opaque id: must not reveal the card, since face-down cards are sent
// to other players without rank and suit
const ID_CHARS = "abcdefghijklmnopqrstuvwxyz0123456789";
const makeId = (random: Random, used: Set<string>) => {
  let id = "";
  do {
    id = "c_";
    for (let i = 0; i < 10; i++) {
      id += ID_CHARS[Math.floor(random() * ID_CHARS.length)];
    }
  } while (used.has(id));
  used.add(id);
  return id;
};

const buildDeck = (config: GameConfig, random: Random): Card[] => {
  const deckType =
    DECK_TYPES[config.deckType as keyof typeof DECK_TYPES] ||
    DECK_TYPES["52 Karten"];
  const ranks = ALL_RANKS.slice(deckType.minRankIndex);
  const usedIds = new Set<string>();
  const card = (rank: string, suit: string): Card => ({
    id: makeId(random, usedIds),
    rank,
    suit,
    isFaceUp: false,
  });

  const cards: Card[] = [];
  for (let d = 0; d < config.deckCount; d++) {
    SUITS.forEach((suit) =>
      ranks.forEach((rank) => cards.push(card(rank, suit))),
    );
    for (let j = 0; j < deckType.jokers; j++) cards.push(card("JK", "JOKER"));
  }
  return cards;
};

// Shuffles the deck(s), deals cardsPerPile face-down cards to each pile
// (round-robin) and puts the rest on the deck slot. Hands start empty.
export const createGame = (
  config: GameConfig,
  playerIds: PlayerId[],
  random: Random = Math.random,
): GameState => {
  const cards = shuffle(buildDeck(config, random), random);
  const board: BoardCard[] = [];
  let next = 0;

  const toDeal = config.pileCount * config.cardsPerPile;
  for (let i = 0; i < toDeal && next < cards.length; i++) {
    board.push({
      ...cards[next++],
      slot: pileSlot(i % config.pileCount, config.pileCount),
      zIndex: Math.floor(i / config.pileCount) + 1,
    });
  }
  while (next < cards.length) {
    board.push({ ...cards[next++], slot: DECK_SLOT, zIndex: next });
  }

  const hands: GameState["hands"] = {};
  playerIds.forEach((id) => (hands[id] = []));

  return {
    board,
    hands,
    maxZIndex: Math.max(0, ...board.map((c) => c.zIndex)),
  };
};
