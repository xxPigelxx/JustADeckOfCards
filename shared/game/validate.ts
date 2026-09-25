import { GameAction } from "./types";

// Shape checks for data coming from the network. applyAction still decides
// whether a well-formed action is allowed.

type Obj = Record<string, unknown>;

const isObj = (value: unknown): value is Obj =>
  typeof value === "object" && value !== null;

const isInt = (value: unknown) => Number.isInteger(value);

const isId = (value: unknown) =>
  typeof value === "string" && value.length > 0 && value.length <= 64;

export const isGameAction = (value: unknown): value is GameAction => {
  if (!isObj(value)) return false;
  const a = value;
  switch (a.type) {
    case "moveToSlot":
      return isId(a.cardId) && isInt(a.slot);
    case "moveToHand":
      return isId(a.cardId) && isInt(a.index);
    case "moveStack":
      return isInt(a.fromSlot) && isInt(a.toSlot);
    case "takeStack":
    case "flipSlot":
    case "shuffleSlot":
      return isInt(a.slot);
    case "flipHandCard":
      return isId(a.cardId);
    case "flipHand":
    case "shuffleHand":
      return true;
    default:
      return false;
  }
};
