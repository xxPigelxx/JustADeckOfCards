import * as C from "@/components/constants";

// Coordinate spaces:
// - screen: absolute touch position (event.absoluteX / absoluteY)
// - board:  position on the board content, where cards are placed
//           (moved and scaled by the camera inside the green board surface)
// All conversions between them live here.

export type Point = { x: number; y: number };
export type Camera = { x: number; y: number; zoom: number };

// Current camera, provided by useCamera (reads its shared values)
let getCamera: () => Camera = () => ({ x: 0, y: 0, zoom: 1 });

export const setCameraSource = (source: () => Camera) => {
  getCamera = source;
};

export const getCameraZoom = () => getCamera().zoom;

// Drop slightly above the hand area still counts as "into the hand"
const HAND_DROP_TOLERANCE = 30;

// Top-left screen position of the board surface and hand area.
// Estimated from constants until BoardArea / HandArea measure the real values.
let boardOrigin: Point = { x: C.BOARD_PADDING, y: C.TOP_OFFSET + C.SAFE_TOP };
let handOrigin: Point = { x: 0, y: C.SCREEN_DIMS.height - C.HAND_HEIGHT };

export const setBoardOrigin = (origin: Point) => {
  boardOrigin = origin;
};

export const setHandOrigin = (origin: Point) => {
  handOrigin = origin;
};

// --- BOARD ---

export const slotToBoard = (slot: number, stackIndex: number = 0): Point => {
  const col = slot % C.BOARD_COLS;
  const row = Math.floor(slot / C.BOARD_COLS);
  const stackOffset = stackIndex * C.STACK_OFFSET;

  return {
    x: C.GRID_OFFSET_X + col * (C.SLOT_W + C.GAP) - stackOffset,
    y: C.GRID_MARGIN_TOP + row * (C.SLOT_H + C.GAP) - stackOffset,
  };
};

export const slotCenter = (slot: number): Point => {
  const topLeft = slotToBoard(slot);
  return { x: topLeft.x + C.SLOT_W / 2, y: topLeft.y + C.SLOT_H / 2 };
};

export const boardToSlot = ({ x, y }: Point): number | null => {
  const col = Math.floor((x - C.GRID_OFFSET_X) / (C.SLOT_W + C.GAP));
  const row = Math.floor((y - C.GRID_MARGIN_TOP) / (C.SLOT_H + C.GAP));

  if (col < 0 || col >= C.BOARD_COLS || row < 0 || row >= C.BOARD_ROWS) {
    return null;
  }
  return row * C.BOARD_COLS + col;
};

export const screenToBoard = ({ x, y }: Point): Point => {
  const cam = getCamera();
  return {
    x: (x - boardOrigin.x - cam.x) / cam.zoom,
    y: (y - boardOrigin.y - cam.y) / cam.zoom,
  };
};

export const boardToScreen = ({ x, y }: Point): Point => {
  const cam = getCamera();
  return {
    x: boardOrigin.x + cam.x + x * cam.zoom,
    y: boardOrigin.y + cam.y + y * cam.zoom,
  };
};

export const isOverHand = (screenY: number) =>
  screenY > handOrigin.y - HAND_DROP_TOLERANCE;

// --- HAND (fan layout) ---

export const getFanPosition = (index: number, total: number) => {
  const centerIndex = (total - 1) / 2;
  const offset = index - centerIndex;
  const rotation = offset * C.FAN_ANGLE;
  const translateY =
    Math.abs(offset) * C.FAN_CURVE + Math.abs(offset * offset) * 1.5;
  const totalWidth = (total - 1) * C.FAN_SPREAD;
  const startX = (C.SCREEN_DIMS.width - totalWidth) / 2 - C.CARD_W / 2;
  const x = startX + index * C.FAN_SPREAD;
  return { x, translateY, rotation };
};

export const handCardToScreen = (index: number, total: number): Point => {
  const { x, translateY } = getFanPosition(index, total);
  return {
    x: handOrigin.x + x,
    y: handOrigin.y + C.HAND_CARD_TOP + translateY,
  };
};

// Insert position in the hand (0..total) for a finger at screenX
export const getHandIndexFromX = (screenX: number, total: number) => {
  const startX = handOrigin.x + getFanPosition(0, total).x;
  const index = Math.round((screenX - startX) / C.FAN_SPREAD);
  return Math.max(0, Math.min(total, index));
};
