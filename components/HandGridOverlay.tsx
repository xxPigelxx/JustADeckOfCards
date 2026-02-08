import Card from "@/components/Card";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useState } from "react";
import {
  Dimensions,
  FlatList,
  ListRenderItem,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  SlideInDown,
} from "react-native-reanimated";
import { CARD_H, CARD_W } from "./constants";
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

// Calculate columns based on screen width
const SCREEN_WIDTH = Dimensions.get("window").width;
const GAP = 15;
// Calculate how many cards fit in one row
const NUM_COLUMNS = Math.floor((SCREEN_WIDTH - 40) / (CARD_W + GAP));

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

  // Optimized Render Item
  const renderItem: ListRenderItem<CardData> = useCallback(
    ({ item: card }) => {
      const isHidden = isDraggingAny && card.id !== draggedCardId;

      return (
        <View
          style={[styles.cardWrapper, isHidden && { opacity: 0 }]}
          pointerEvents={isHidden ? "none" : "auto"}
        >
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
    },
    [
      isDraggingAny,
      draggedCardId,
      cardBackColor,
      cardBackPattern,
      onDragStart,
      onDrag,
      onDrop,
      onDragEnd,
      onClose,
    ],
  );

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
          <Text style={styles.title}>Deine Hand ({handCards.length})</Text>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <Ionicons name="chevron-down" size={28} color="white" />
          </Pressable>
        </View>

        <FlatList
          data={handCards}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          numColumns={NUM_COLUMNS}
          // --- Performance Props ---
          initialNumToRender={12}
          maxToRenderPerBatch={8}
          windowSize={5}
          removeClippedSubviews={true}
          // Helps FlatList calculate layout without rendering
          getItemLayout={(data, index) => ({
            length: CARD_H + 10, // Height + marginBottom
            offset: (CARD_H + 10) * Math.floor(index / NUM_COLUMNS),
            index,
          })}
          // --- Styling ---
          style={{
            flex: 1,
            overflow: isDraggingAny ? "visible" : "hidden",
          }}
          contentContainerStyle={styles.gridContent}
          columnWrapperStyle={{ gap: GAP, justifyContent: "center" }}
          showsVerticalScrollIndicator={true}
          scrollEnabled={!isDraggingAny}
        />
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
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 0,
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
    borderBottomColor: "rgba(255,255,255,0.1)",
    zIndex: 10,
    backgroundColor: "#333",
  },
  title: { fontSize: 20, fontWeight: "bold", color: "white" },
  closeButton: { padding: 5 },
  gridContent: {
    paddingTop: 10,
    paddingBottom: 100, // Safe area for scrolling
  },
  cardWrapper: {
    width: CARD_W,
    height: CARD_H,
    marginBottom: 10, // vertical gap between rows
    zIndex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
