import Card from "@/components/Card";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  SlideInDown,
} from "react-native-reanimated";
import { CARD_H, CARD_W } from "./constants"; // Import dimensions
import { CardData } from "./useGameLogic";

interface HandGridOverlayProps {
  visible: boolean;
  handCards: CardData[];
  cardBackColor: string;
  cardBackPattern: string;
  onClose: () => void;
  onDragStart: (id: string) => void;
  onDrag: (id: string, x: number, y: number) => void;
  onDrop: (id: string, x: number, y: number) => void;
  onDragEnd: () => void;
}

export default function HandGridOverlay({
  visible,
  handCards,
  cardBackColor,
  cardBackPattern,
  onClose,
  onDragStart,
  onDrag,
  onDrop,
  onDragEnd,
}: HandGridOverlayProps) {
  const [draggedCardId, setDraggedCardId] = useState<string | null>(null);

  if (!visible) return null;

  const isDraggingAny = draggedCardId !== null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {/* Backdrop */}
      {!isDraggingAny && (
        <Animated.View
          entering={FadeIn}
          exiting={FadeOut}
          style={styles.backdrop}
        >
          <Pressable style={{ flex: 1 }} onPress={onClose} />
        </Animated.View>
      )}

      {/* Sheet */}
      <Animated.View
        entering={SlideInDown}
        exiting={isDraggingAny ? undefined : FadeOut}
        style={[
          styles.sheetContainer,
          isDraggingAny && styles.sheetTransparent,
        ]}
      >
        <View style={[styles.header, isDraggingAny && { opacity: 0 }]}>
          <Text style={styles.title}>Deine Hand</Text>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <Ionicons name="chevron-down" size={28} color="white" />
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={styles.gridContent}
          style={{ overflow: "visible" }}
          scrollEnabled={!isDraggingAny}
        >
          {handCards.map((card) => {
            const isHidden = isDraggingAny && card.id !== draggedCardId;

            return (
              <View
                key={card.id}
                style={[styles.cardWrapper, isHidden && { opacity: 0 }]}
                pointerEvents={isHidden ? "none" : "auto"}
              >
                {/* FIX: Removed transform scale to fix drag tracking! */}
                <View style={{ width: CARD_W, height: CARD_H }}>
                  <Card
                    {...card}
                    x={0}
                    y={0}
                    backColor={cardBackColor}
                    backPattern={cardBackPattern}
                    onDragStart={() => {
                      setDraggedCardId(card.id);
                      onDragStart(card.id);
                    }}
                    onDrag={onDrag}
                    onDrop={(id, x, y) => {
                      onDrop(id, x, y);
                      setDraggedCardId(null);
                      onClose();
                    }}
                    onDragEnd={() => {
                      setDraggedCardId(null);
                      onDragEnd();
                    }}
                  />
                </View>
              </View>
            );
          })}
        </ScrollView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
    zIndex: 100,
  },
  sheetContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "70%",
    backgroundColor: "#333",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    zIndex: 101,
    elevation: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  sheetTransparent: {
    backgroundColor: "transparent",
    shadowOpacity: 0,
    elevation: 0,
    borderTopWidth: 0,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  title: { fontSize: 20, fontWeight: "bold", color: "white" },
  closeButton: { padding: 5 },
  gridContent: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 15, // Slightly bigger gap for full size cards
    paddingTop: 10,
    paddingBottom: 50,
  },
  cardWrapper: {
    width: CARD_W, // Use full card width
    height: CARD_H, // Use full card height
    marginBottom: 10,
    zIndex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
