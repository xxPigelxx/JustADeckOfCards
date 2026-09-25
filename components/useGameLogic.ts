import { useEffect, useState } from "react";
import {
  boardToSlot,
  getHandIndexFromX,
  isOverHand,
  screenToBoard,
} from "@/utils/boardGeometry";

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

  // --- HELPER: Detect Board Slot ---
  const getSlotFromCoords = (absX: number, absY: number) =>
    boardToSlot(screenToBoard({ x: absX, y: absY }));

  const bringToFront = (id: string) => {
    const newZ = maxZIndex + 1;
    setMaxZIndex(newZ);
    setBoardCards((prev) =>
      prev.map((c) => (c.id === id ? { ...c, zIndex: newZ } : c)),
    );
  };

  // --- ACTIONS ---

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

  const flipAllHand = () => {
    setHandCards((prev) => {
      const allFaceUp = prev.every((c) => c.isFaceUp);
      return prev.map((c) => ({ ...c, isFaceUp: !allFaceUp }));
    });
  };

  const shuffleHand = () => {
    setHandCards((prev) => {
      const newHand = [...prev].sort(() => Math.random() - 0.5);
      return newHand;
    });
  };

  const shuffleStack = (id: string | null, slot: number | null) => {
    // If context menu called on a hand card, shuffle the hand
    if (id && handCards.some((c) => c.id === id)) {
      shuffleHand();
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

  // --- DRAG HANDLERS ---

  const handleDrag = (id: string, absX: number, absY: number) => {
    if (isOverHand(absY)) {
      if (highlightedSlot !== null) setHighlightedSlot(null);
      return;
    }
    const slot = getSlotFromCoords(absX, absY);
    if (slot !== highlightedSlot) setHighlightedSlot(slot);
  };

  const handleDrop = (id: string, absX: number, absY: number) => {
    setHighlightedSlot(null);
    const overHand = isOverHand(absY);
    const fromBoard = boardCards.find((c) => c.id === id);

    // 1. Moving a whole stack (Special Case)
    if (
      movingStackSlot !== null &&
      fromBoard &&
      fromBoard.slot === movingStackSlot
    ) {
      if (overHand) {
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

    // 2. Dropping into Hand (Sorting / Adding)
    if (overHand) {
      const newIndex = getHandIndexFromX(absX, handCards.length);

      if (fromBoard) {
        // A. From Board -> Hand (Insert at specific index)
        setBoardCards((p) => p.filter((c) => c.id !== id));
        setHandCards((prev) => {
          const newHand = [...prev];
          newHand.splice(newIndex, 0, { ...fromBoard, slot: undefined });
          return newHand;
        });
        return;
      } else {
        // B. Hand -> Hand (Reorder)
        setHandCards((prev) => {
          const newHand = [...prev];
          const oldIndex = newHand.findIndex((c) => c.id === id);
          if (oldIndex === -1) return prev;

          // Remove
          const [card] = newHand.splice(oldIndex, 1);

          // Re-insert (clamp index to new length)
          const targetIndex = Math.min(newIndex, newHand.length);
          newHand.splice(targetIndex, 0, card);

          return newHand;
        });
        return;
      }
    }

    // 3. Dropping onto Board
    const targetSlot = getSlotFromCoords(absX, absY);
    if (targetSlot === null) return; // Dropped into void

    if (!fromBoard) {
      // From Hand -> Board
      const c = handCards.find((x) => x.id === id)!;
      setHandCards((p) => p.filter((x) => x.id !== id));
      setBoardCards((p) => [
        ...p,
        { ...c, slot: targetSlot, zIndex: maxZIndex + 1 },
      ]);
      setMaxZIndex((p) => p + 1);
    } else {
      // Board -> Board
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
      flipAllHand,
      shuffleHand,
      shuffleStack,
      takeStack,
    },
  };
};
