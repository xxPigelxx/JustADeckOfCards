import * as C from "@/components/constants";
import { CardData } from "@/components/useGameLogic";

export const getBoardCardPosition = (
  card: CardData,
  stackIndex: number,
  stackSize: number,
  collapse: boolean,
) => {
  const col = card.slot! % C.COLS;
  const row = Math.floor(card.slot! / C.COLS);

  const baseX = C.GRID_OFFSET_X + col * (C.SLOT_W + C.GAP);
  const baseY = C.GRID_MARGIN_TOP + row * (C.SLOT_H + C.GAP);

  if (collapse) {
    return {
      x: baseX + C.BOARD_PADDING,
      y: baseY + C.TOP_OFFSET + C.SAFE_TOP,
      rotation: 0,
    };
  }

  // Treppen-Effekt
  const threshold = Math.max(0, stackSize - C.VISIBLE_STACK_LIMIT);
  const isVisible = stackIndex >= threshold;
  const visualIndex = isVisible ? stackIndex - threshold : 0;

  return {
    x: baseX + C.BOARD_PADDING - visualIndex * C.STACK_OFFSET,
    y: baseY + C.TOP_OFFSET + C.SAFE_TOP - visualIndex * C.STACK_OFFSET,
    rotation: 0,
  };
};

export const getHandCardPosition = (index: number, total: number) => {
  const centerIndex = (total - 1) / 2;
  const offset = index - centerIndex;

  // Fächer-Logik
  const rotation = offset * C.FAN_ANGLE;
  const translateY =
    Math.abs(offset) * C.FAN_CURVE + Math.abs(offset * offset) * 1.5;

  const totalWidth = (total - 1) * C.FAN_SPREAD;
  const startX = (C.SCREEN_DIMS.width - totalWidth) / 2 - C.CARD_W / 2;

  // Z-Index Fächer (Mitte oben)
  const distFromCenter = Math.abs(index - centerIndex);
  const zIndex = 100 - Math.floor(distFromCenter);

  return {
    x: startX + index * C.FAN_SPREAD,
    y: C.SCREEN_DIMS.height - C.HAND_HEIGHT + 30 + translateY,
    rotation,
    zIndex,
  };
};
