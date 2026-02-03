import { useEffect, useState } from "react";
import * as C from "./constants";

export interface CardData {
  id: string;
  rank: string;
  suit: string;
  slot?: number;
  zIndex?: number;
  isFaceUp: boolean;
}

interface GameLogicProps {
  initialBoard?: CardData[];
  initialHand?: CardData[];
}

export const useGameLogic = ({
  initialBoard,
  initialHand,
}: GameLogicProps = {}) => {
  const [maxZIndex, setMaxZIndex] = useState(100);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [highlightedSlot, setHighlightedSlot] = useState<number | null>(null);
  const [movingStackSlot, setMovingStackSlot] = useState<number | null>(null);

  const [boardCards, setBoardCards] = useState<CardData[]>(initialBoard || []);
  const [handCards, setHandCards] = useState<CardData[]>(initialHand || []);

  useEffect(() => {
    if (initialBoard) setBoardCards(initialBoard);
    if (initialHand) setHandCards(initialHand);
  }, [initialBoard, initialHand]);

  // --- STANDARD GRID HIT DETECTION ---
  const getSlotFromCoords = (absX: number, absY: number) => {
    const localX = absX - C.BOARD_PADDING - C.GRID_OFFSET_X;
    const localY = absY - C.TOP_OFFSET - C.GRID_MARGIN_TOP - C.SAFE_TOP;

    const col = Math.floor(localX / (C.SLOT_W + C.GAP));
    const row = Math.floor(localY / (C.SLOT_H + C.GAP));

    if (col < 0 || col >= C.COLS || row < 0 || row >= C.ROWS) return null;
    return row * C.COLS + col;
  };

  const getHandIndexFromX = (absX: number) => {
    const totalWidth = handCards.length * C.FAN_SPREAD;
    const startX = (C.SCREEN_DIMS.width - totalWidth) / 2;
    const relativeX = absX - startX;
    return Math.min(
      handCards.length,
      Math.max(0, Math.floor(relativeX / C.FAN_SPREAD)),
    );
  };

  const bringToFront = (id: string) => {
    const newZ = maxZIndex + 1;
    setMaxZIndex(newZ);
    setBoardCards((prev) =>
      prev.map((c) => (c.id === id ? { ...c, zIndex: newZ } : c)),
    );
  };

  const flipCard = (id: string | null, slot: number | null) => {
    if (id && handCards.some((c) => c.id === id)) {
      setHandCards((prev) =>
        prev.map((c) => (c.id === id ? { ...c, isFaceUp: !c.isFaceUp } : c)),
      );
      return;
    }
    if (slot !== null) {
      setBoardCards((prev) =>
        prev.map((c) =>
          c.slot === slot ? { ...c, isFaceUp: !c.isFaceUp } : c,
        ),
      );
    }
  };

  // --- NEU: Funktion zum Flippen aller Handkarten ---
  const flipAllHand = () => {
    setHandCards((prev) => {
      // Prüfen, ob ALLE aufgedeckt sind
      const allFaceUp = prev.every((c) => c.isFaceUp);
      // Wenn alle aufgedeckt sind -> alle zudecken. Sonst alle aufdecken.
      return prev.map((c) => ({ ...c, isFaceUp: !allFaceUp }));
    });
  };
  // --------------------------------------------------

  const shuffleStack = (id: string | null, slot: number | null) => {
    if (id && handCards.some((c) => c.id === id)) {
      // Hand Shuffle Logic (optional, falls benötigt)
      return;
    }
    if (slot === null) return;
    setBoardCards((prev) => {
      const s = prev.filter((c) => c.slot === slot);
      const o = prev.filter((c) => c.slot !== slot);

      for (let i = s.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [s[i], s[j]] = [s[j], s[i]];
      }
      const bz = Math.min(...s.map((c) => c.zIndex!));
      return [...o, ...s.map((c, i) => ({ ...c, zIndex: bz + i }))];
    });
  };

  const takeStack = (slot: number | null) => {
    if (slot === null) return;
    const t = boardCards.filter((c) => c.slot === slot);
    if (!t.length) return;
    setBoardCards((p) => p.filter((c) => c.slot !== slot));
    setHandCards((p) => [...p, ...t.map((c) => ({ ...c, slot: undefined }))]);
  };

  const handleDrag = (id: string, absX: number, absY: number) => {
    const isOverHand = absY > C.BOARD_HEIGHT - 30;
    if (isOverHand) {
      if (highlightedSlot !== null) setHighlightedSlot(null);
      return;
    }
    const slot = getSlotFromCoords(absX, absY);
    if (slot !== highlightedSlot) setHighlightedSlot(slot);
  };

  const handleDrop = (id: string, absX: number, absY: number) => {
    setHighlightedSlot(null);
    const isOverHand = absY > C.BOARD_HEIGHT - 30;
    const fromBoard = boardCards.find((c) => c.id === id);

    if (
      movingStackSlot !== null &&
      fromBoard &&
      fromBoard.slot === movingStackSlot
    ) {
      if (isOverHand) {
        takeStack(movingStackSlot);
        setMovingStackSlot(null);
        return;
      }
      const targetSlot = getSlotFromCoords(absX, absY);
      if (targetSlot === null) {
        setMovingStackSlot(null);
        return;
      }

      setBoardCards((prev) => {
        const m = prev
          .filter((c) => c.slot === movingStackSlot)
          .sort((a, b) => a.zIndex! - b.zIndex!);
        const o = prev.filter((c) => c.slot !== movingStackSlot);
        let nz = maxZIndex + 1;
        const um = m.map((c) => ({ ...c, slot: targetSlot, zIndex: nz++ }));
        setMaxZIndex(nz);
        return [...o, ...um];
      });
      setMovingStackSlot(null);
      return;
    }

    if (isOverHand) {
      if (fromBoard) {
        setBoardCards((p) => p.filter((c) => c.id !== id));
        setHandCards((p) => [...p, { ...fromBoard, slot: undefined }]);
        return;
      }
      // Optional: Hand Reorder Logic here
      return;
    }
    const targetSlot = getSlotFromCoords(absX, absY);
    if (targetSlot === null) return;

    if (!fromBoard) {
      // From Hand
      const c = handCards.find((x) => x.id === id)!;
      setHandCards((p) => p.filter((x) => x.id !== id));
      setBoardCards((p) => [
        ...p,
        { ...c, slot: targetSlot, zIndex: maxZIndex + 1 },
      ]);
      setMaxZIndex((p) => p + 1);
    } else {
      // Board to Board
      setBoardCards((p) =>
        p.map((x) => (x.id === id ? { ...x, slot: targetSlot } : x)),
      );
    }
  };

  return {
    boardCards,
    handCards,
    highlightedSlot,
    draggedId,
    movingStackSlot,
    setDraggedId,
    setHighlightedSlot,
    setMovingStackSlot,
    bringToFront,
    handleDrop,
    handleDrag,
    actions: {
      flipCard,
      flipAllHand, // <--- HIER EXPORTIEREN
      shuffleStack,
      takeStack,
    },
  };
};
