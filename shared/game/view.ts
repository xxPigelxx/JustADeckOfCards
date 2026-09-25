import { GameState, PlayerId, PlayerView } from "./types";

// What `playerId` may see: the own hand in full, only the number of cards in
// other hands, and face-down board cards without rank and suit
export const getPlayerView = (
  state: GameState,
  playerId: PlayerId,
): PlayerView => {
  const handCounts: PlayerView["handCounts"] = {};
  Object.entries(state.hands).forEach(([id, cards]) => {
    if (id !== playerId) handCounts[id] = cards.length;
  });

  return {
    board: state.board.map((c) =>
      c.isFaceUp ? c : { ...c, rank: "", suit: "" },
    ),
    hand: state.hands[playerId] ?? [],
    handCounts,
    maxZIndex: state.maxZIndex,
  };
};

// Client side: a view as game state (other hands are unknown, so empty),
// so the same rules can be applied locally before the server answers
export const viewToState = (
  view: PlayerView,
  playerId: PlayerId,
): GameState => ({
  board: view.board,
  hands: { [playerId]: view.hand },
  maxZIndex: view.maxZIndex,
});
