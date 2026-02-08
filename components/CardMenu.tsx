import AppButton from "@/components/AppButton";
import { CardData } from "@/components/useGameLogic";
import React from "react";
import { Modal, Pressable, StyleSheet, View } from "react-native";

type CardMenuProps = {
  visible: boolean;
  position: { x: number; y: number };
  targetCardId: string | null;
  targetSlot: number | null;
  handCards: CardData[];
  cardsBySlot: { [key: number]: CardData[] };
  onClose: () => void;
  actions: {
    flipCard: (id: string | null, slot: number | null) => void;
    flipAllHand?: () => void;
    // NEW: Add specific action for shuffling hand
    shuffleHand?: () => void;
    shuffleStack: (id: string | null, slot: number | null) => void;
    moveStack: (slot: number | null) => void;
    takeStack: (slot: number | null) => void;
  };
};

export default function CardMenu({
  visible,
  position,
  targetCardId,
  targetSlot,
  handCards,
  cardsBySlot,
  onClose,
  actions,
}: CardMenuProps) {
  if (!visible) return null;

  const isHand = targetCardId && handCards.some((c) => c.id === targetCardId);
  const stack = targetSlot !== null ? cardsBySlot[targetSlot] || [] : [];
  const isStack = stack.length > 1;

  const handleAction = (action: () => void) => {
    action();
    onClose();
  };

  return (
    <Modal transparent visible={visible} animationType="fade">
      <Pressable style={styles.overlay} onPress={onClose}>
        <View
          style={[styles.menuContainer, { top: position.y, left: position.x }]}
        >
          {isStack ? (
            // --- STACK ACTIONS ---
            <>
              <AppButton
                title="Flip All"
                onPress={() =>
                  handleAction(() => actions.flipCard(targetCardId, targetSlot))
                }
                style={styles.menuButton}
                textStyle={styles.menuButtonText}
              />
              <AppButton
                title="Mix"
                onPress={() =>
                  handleAction(() =>
                    actions.shuffleStack(targetCardId, targetSlot),
                  )
                }
                style={styles.menuButton}
                textStyle={styles.menuButtonText}
              />
              <AppButton
                title="Move"
                onPress={() =>
                  handleAction(() => {
                    if (targetSlot !== null) actions.moveStack(targetSlot);
                  })
                }
                style={styles.menuButton}
                textStyle={styles.menuButtonText}
              />
              <AppButton
                title="Take"
                onPress={() =>
                  handleAction(() => actions.takeStack(targetSlot))
                }
                style={styles.menuButton}
                textStyle={styles.menuButtonText}
              />
            </>
          ) : isHand ? (
            // --- HAND ACTIONS ---
            <>
              <AppButton
                title="Flip All"
                onPress={() => handleAction(() => actions.flipAllHand?.())}
                style={styles.menuButton}
                textStyle={styles.menuButtonText}
              />
              <AppButton
                title="Mix"
                // FIX: Call specific shuffleHand action
                onPress={() => handleAction(() => actions.shuffleHand?.())}
                style={styles.menuButton}
                textStyle={styles.menuButtonText}
              />
            </>
          ) : (
            // --- SINGLE CARD ACTIONS ---
            <AppButton
              title="Flip"
              onPress={() =>
                handleAction(() => actions.flipCard(targetCardId, targetSlot))
              }
              style={styles.menuButton}
              textStyle={styles.menuButtonText}
            />
          )}
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "transparent" },
  menuContainer: {
    position: "absolute",
    backgroundColor: "transparent",
    alignItems: "center",
    width: 70,
  },
  menuButton: {
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 6,
    minWidth: 70,
    marginBottom: 4,
  },
  menuButtonText: { fontSize: 12 },
});
