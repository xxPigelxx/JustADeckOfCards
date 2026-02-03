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
    // NEU: Funktion zum Flippen aller Handkarten
    flipAllHand?: () => void;
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

  return (
    <Modal transparent visible={visible} animationType="fade">
      <Pressable style={styles.overlay} onPress={onClose}>
        <View
          style={[styles.menuContainer, { top: position.y, left: position.x }]}
        >
          <AppButton
            title="Flip"
            onPress={() => {
              actions.flipCard(targetCardId, targetSlot);
              onClose();
            }}
            style={styles.menuButton}
            textStyle={styles.menuButtonText}
          />

          {isStack ? (
            <>
              <AppButton
                title="Mix"
                onPress={() => {
                  actions.shuffleStack(targetCardId, targetSlot);
                  onClose();
                }}
                style={styles.menuButton}
                textStyle={styles.menuButtonText}
              />
              <AppButton
                title="Move"
                onPress={() => {
                  if (targetSlot !== null) actions.moveStack(targetSlot);
                  onClose();
                }}
                style={styles.menuButton}
                textStyle={styles.menuButtonText}
              />
              <AppButton
                title="Take"
                onPress={() => {
                  actions.takeStack(targetSlot);
                  onClose();
                }}
                style={styles.menuButton}
                textStyle={styles.menuButtonText}
              />
            </>
          ) : isHand ? (
            <>
              <AppButton
                title="Flip All"
                onPress={() => {
                  actions.flipAllHand?.(); // Sicherer Aufruf
                  onClose();
                }}
                style={styles.menuButton}
                textStyle={styles.menuButtonText}
              />
              <AppButton
                title="Mix"
                onPress={() => {
                  actions.shuffleStack(targetCardId, null);
                  onClose();
                }}
                style={styles.menuButton}
                textStyle={styles.menuButtonText}
              />
            </>
          ) : !isHand ? (
            <AppButton
              title="Take"
              onPress={() => {
                actions.takeStack(targetSlot);
                onClose();
              }}
              style={styles.menuButton}
              textStyle={styles.menuButtonText}
            />
          ) : null}
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
