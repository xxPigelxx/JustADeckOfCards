import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { CARD_H, CARD_W } from "./constants";

type CardVisualProps = {
  rank: string;
  suit: string;
  isFaceUp?: boolean;
  badgeCount?: number;
};

export default function CardVisual({
  rank,
  suit,
  isFaceUp = true,
  badgeCount = 0,
}: CardVisualProps) {
  const isRed = suit === "♥" || suit === "♦";

  return (
    <View style={[styles.card, !isFaceUp && styles.cardBack]}>
      {badgeCount > 1 && (
        <View style={styles.badgeContainer}>
          <Text style={styles.badgeText}>{badgeCount}</Text>
        </View>
      )}

      {isFaceUp ? (
        <>
          <View style={styles.corner}>
            <Text style={[styles.rankText, { color: isRed ? "red" : "black" }]}>
              {rank}
            </Text>
            <Text style={[styles.suitText, { color: isRed ? "red" : "black" }]}>
              {suit}
            </Text>
          </View>

          <View style={styles.centerContent}>
            <Text style={[styles.bigSuit, { color: isRed ? "red" : "black" }]}>
              {suit}
            </Text>
          </View>

          <View style={[styles.corner, styles.bottomRight]}>
            <Text style={[styles.rankText, { color: isRed ? "red" : "black" }]}>
              {rank}
            </Text>
            <Text style={[styles.suitText, { color: isRed ? "red" : "black" }]}>
              {suit}
            </Text>
          </View>
        </>
      ) : (
        <View style={styles.backPattern}>
          <View style={styles.innerBack} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_W,
    height: CARD_H,
    backgroundColor: "white",
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 1, // Weniger Padding
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.0,
    elevation: 1,
    justifyContent: "space-between",
  },
  badgeContainer: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: "#f1ce5bff",
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100,
    elevation: 5,
  },
  badgeText: { color: "white", fontSize: 9, fontWeight: "bold" },
  cardBack: {
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    padding: 2,
  },
  backPattern: {
    flex: 1,
    width: "100%",
    backgroundColor: "#3b82f6",
    borderRadius: 3,
  },
  innerBack: {
    width: 14,
    height: 14,
    backgroundColor: "#60a5fa",
    borderRadius: 7,
    opacity: 0.5,
  },

  // Angepasste Größen für kleine Karten:
  corner: { alignItems: "center", width: 14 },
  bottomRight: { alignSelf: "flex-end", transform: [{ rotate: "180deg" }] },
  rankText: { fontSize: 10, fontWeight: "bold", lineHeight: 10 },
  suitText: { fontSize: 10, lineHeight: 10 },
  centerContent: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: -1,
  },
  bigSuit: { fontSize: 24, opacity: 0.1 },
});
