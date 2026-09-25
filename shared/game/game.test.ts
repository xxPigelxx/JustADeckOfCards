import { describe, expect, it } from "vitest";
import { DECK_SLOT, pileSlot } from "./board";
import { applyAction } from "./rules";
import { createGame } from "./setup";
import { GameConfig, GameState } from "./types";
import { getPlayerView, viewToState } from "./view";

// Deterministic random numbers so tests are reproducible
const seeded =
  (seed = 1) =>
  () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };

const CONFIG: GameConfig = {
  deckType: "52 Karten",
  deckCount: 1,
  pileCount: 2,
  cardsPerPile: 3,
};
const ME = "me";
const OTHER = "other";

const newGame = (config: Partial<GameConfig> = {}) =>
  createGame({ ...CONFIG, ...config }, [ME, OTHER], seeded());

const inSlot = (state: GameState, slot: number) =>
  state.board
    .filter((c) => c.slot === slot)
    .sort((a, b) => a.zIndex - b.zIndex);

const allIds = (state: GameState) =>
  [
    ...state.board.map((c) => c.id),
    ...Object.values(state.hands).flatMap((h) => h.map((c) => c.id)),
  ].sort();

describe("createGame", () => {
  it("deals the piles and puts the rest on the deck", () => {
    const state = newGame();
    expect(state.board).toHaveLength(52);
    expect(inSlot(state, pileSlot(0, 2))).toHaveLength(3);
    expect(inSlot(state, pileSlot(1, 2))).toHaveLength(3);
    expect(inSlot(state, DECK_SLOT)).toHaveLength(46);
    expect(state.hands).toEqual({ [ME]: [], [OTHER]: [] });
    expect(state.board.every((c) => !c.isFaceUp)).toBe(true);
  });

  it("builds the chosen deck type and deck count", () => {
    expect(newGame({ deckType: "54 Karten" }).board).toHaveLength(54);
    expect(newGame({ deckType: "24 Karten" }).board).toHaveLength(24);
    expect(newGame({ deckCount: 2 }).board).toHaveLength(104);
  });

  it("uses unique ids that do not reveal the card", () => {
    const state = newGame({ deckCount: 2 });
    const ids = state.board.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
    state.board.forEach((c) => {
      expect(c.id).not.toContain(c.suit);
      expect(c.id).toMatch(/^c_[a-z0-9]{10}$/);
    });
  });

  it("starts maxZIndex above every card", () => {
    const state = newGame({ deckCount: 4 });
    expect(state.maxZIndex).toBe(Math.max(...state.board.map((c) => c.zIndex)));
  });
});

describe("applyAction", () => {
  it("moves a board card onto another slot, on top", () => {
    const state = newGame();
    const card = inSlot(state, DECK_SLOT)[0];
    const next = applyAction(state, ME, {
      type: "moveToSlot",
      cardId: card.id,
      slot: 5,
    });
    const moved = next.board.find((c) => c.id === card.id)!;
    expect(moved.slot).toBe(5);
    expect(moved.zIndex).toBe(state.maxZIndex + 1);
    expect(next.maxZIndex).toBe(state.maxZIndex + 1);
  });

  it("moves cards between board and own hand", () => {
    let state = newGame();
    const [a, b] = inSlot(state, DECK_SLOT);
    state = applyAction(state, ME, {
      type: "moveToHand",
      cardId: a.id,
      index: 0,
    });
    state = applyAction(state, ME, {
      type: "moveToHand",
      cardId: b.id,
      index: 0,
    });
    expect(state.hands[ME].map((c) => c.id)).toEqual([b.id, a.id]);
    expect(state.board.some((c) => c.id === a.id)).toBe(false);

    state = applyAction(state, ME, {
      type: "moveToSlot",
      cardId: a.id,
      slot: 7,
    });
    expect(state.hands[ME].map((c) => c.id)).toEqual([b.id]);
    expect(state.board.find((c) => c.id === a.id)?.slot).toBe(7);
  });

  it("reorders the own hand", () => {
    let state = newGame();
    const deck = inSlot(state, DECK_SLOT);
    for (const c of deck.slice(0, 3)) {
      state = applyAction(state, ME, {
        type: "moveToHand",
        cardId: c.id,
        index: 99,
      });
    }
    const [a, b, c] = deck;
    state = applyAction(state, ME, {
      type: "moveToHand",
      cardId: a.id,
      index: 2,
    });
    expect(state.hands[ME].map((x) => x.id)).toEqual([b.id, c.id, a.id]);
  });

  it("does not let a player use someone else's hand card", () => {
    let state = newGame();
    const card = inSlot(state, DECK_SLOT)[0];
    state = applyAction(state, OTHER, {
      type: "moveToHand",
      cardId: card.id,
      index: 0,
    });
    const next = applyAction(state, ME, {
      type: "moveToSlot",
      cardId: card.id,
      slot: 3,
    });
    expect(next).toBe(state);
  });

  it("ignores unknown players, cards and slots", () => {
    const state = newGame();
    const card = state.board[0];
    expect(
      applyAction(state, "nobody", { type: "flipSlot", slot: DECK_SLOT }),
    ).toBe(state);
    expect(
      applyAction(state, ME, {
        type: "moveToSlot",
        cardId: "c_missing",
        slot: 1,
      }),
    ).toBe(state);
    expect(
      applyAction(state, ME, { type: "moveToSlot", cardId: card.id, slot: -1 }),
    ).toBe(state);
    expect(
      applyAction(state, ME, {
        type: "moveToSlot",
        cardId: card.id,
        slot: 400,
      }),
    ).toBe(state);
  });

  it("moves a whole stack keeping its order", () => {
    const state = newGame();
    const from = pileSlot(0, 2);
    const before = inSlot(state, from).map((c) => c.id);
    const next = applyAction(state, ME, {
      type: "moveStack",
      fromSlot: from,
      toSlot: 3,
    });
    expect(inSlot(next, from)).toHaveLength(0);
    expect(inSlot(next, 3).map((c) => c.id)).toEqual(before);
    expect(next.maxZIndex).toBe(state.maxZIndex + before.length);
  });

  it("takes a whole stack into the hand", () => {
    const state = newGame();
    const slot = pileSlot(1, 2);
    const next = applyAction(state, ME, { type: "takeStack", slot });
    expect(inSlot(next, slot)).toHaveLength(0);
    expect(next.hands[ME]).toHaveLength(3);
    expect(next.hands[ME][0]).not.toHaveProperty("slot");
  });

  it("flips a slot, a hand card and the whole hand", () => {
    let state = newGame();
    state = applyAction(state, ME, { type: "flipSlot", slot: pileSlot(0, 2) });
    expect(inSlot(state, pileSlot(0, 2)).every((c) => c.isFaceUp)).toBe(true);

    state = applyAction(state, ME, { type: "takeStack", slot: pileSlot(1, 2) });
    const first = state.hands[ME][0];
    state = applyAction(state, ME, { type: "flipHandCard", cardId: first.id });
    expect(state.hands[ME][0].isFaceUp).toBe(true);

    // Not all face up -> all face up, then all face down again
    state = applyAction(state, ME, { type: "flipHand" });
    expect(state.hands[ME].every((c) => c.isFaceUp)).toBe(true);
    state = applyAction(state, ME, { type: "flipHand" });
    expect(state.hands[ME].every((c) => !c.isFaceUp)).toBe(true);
  });

  it("shuffles a stack and a hand without losing cards", () => {
    let state = newGame();
    const deckBefore = inSlot(state, DECK_SLOT);
    state = applyAction(
      state,
      ME,
      { type: "shuffleSlot", slot: DECK_SLOT },
      seeded(7),
    );
    const deckAfter = inSlot(state, DECK_SLOT);
    expect(deckAfter.map((c) => c.id).sort()).toEqual(
      deckBefore.map((c) => c.id).sort(),
    );
    expect(deckAfter.map((c) => c.id)).not.toEqual(deckBefore.map((c) => c.id));
    expect(deckAfter.map((c) => c.zIndex)).toEqual(
      deckBefore.map((c) => c.zIndex),
    );

    state = applyAction(state, ME, { type: "takeStack", slot: DECK_SLOT });
    const handBefore = state.hands[ME].map((c) => c.id);
    state = applyAction(state, ME, { type: "shuffleHand" }, seeded(3));
    expect([...state.hands[ME].map((c) => c.id)].sort()).toEqual(
      [...handBefore].sort(),
    );
    expect(state.hands[ME].map((c) => c.id)).not.toEqual(handBefore);
  });

  it("never creates or loses cards", () => {
    let state = newGame();
    const ids = allIds(state);
    const deck = inSlot(state, DECK_SLOT);
    state = applyAction(state, ME, {
      type: "moveToHand",
      cardId: deck[0].id,
      index: 0,
    });
    state = applyAction(state, OTHER, {
      type: "takeStack",
      slot: pileSlot(0, 2),
    });
    state = applyAction(state, ME, {
      type: "moveStack",
      fromSlot: DECK_SLOT,
      toSlot: 0,
    });
    state = applyAction(state, ME, {
      type: "moveToSlot",
      cardId: deck[0].id,
      slot: 0,
    });
    expect(allIds(state)).toEqual(ids);
  });
});

describe("getPlayerView", () => {
  it("hides other hands and face-down cards", () => {
    let state = newGame();
    state = applyAction(state, OTHER, {
      type: "takeStack",
      slot: pileSlot(1, 2),
    });
    state = applyAction(state, ME, { type: "takeStack", slot: pileSlot(0, 2) });
    state = applyAction(state, ME, { type: "flipSlot", slot: DECK_SLOT });
    state = applyAction(state, ME, {
      type: "moveToSlot",
      cardId: inSlot(state, DECK_SLOT)[0].id,
      slot: 0,
    });
    state = applyAction(state, ME, { type: "flipSlot", slot: 0 });

    const view = getPlayerView(state, ME);
    expect(view.hand).toEqual(state.hands[ME]);
    expect(view.handCounts).toEqual({ [OTHER]: 3 });
    expect(JSON.stringify(view)).not.toContain(
      JSON.stringify(state.hands[OTHER][0]),
    );

    const hidden = view.board.find((c) => c.slot === 0)!;
    expect(hidden.isFaceUp).toBe(false);
    expect(hidden.rank).toBe("");
    expect(hidden.suit).toBe("");
    const visible = view.board.filter((c) => c.slot === DECK_SLOT);
    expect(visible.every((c) => c.rank !== "")).toBe(true);
  });

  it("can be turned back into a state for local rules", () => {
    const state = newGame();
    const view = getPlayerView(state, ME);
    const local = viewToState(view, ME);
    const card = inSlot(local, DECK_SLOT)[0];
    const next = applyAction(local, ME, {
      type: "moveToHand",
      cardId: card.id,
      index: 0,
    });
    expect(next.hands[ME].map((c) => c.id)).toEqual([card.id]);
  });
});
