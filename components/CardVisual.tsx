import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { CARD_H, CARD_W } from "./constants";

type CardVisualProps = {
  rank: string;
  suit: string;
  isFaceUp?: boolean;
  backColor?: string;
  backPattern?: string;
};

const getPatternIcon = (
  id: string,
): keyof typeof MaterialCommunityIcons.glyphMap | null => {
  switch (id) {
    case "checker":
      return "checkerboard";
    case "stripes":
      return "reorder-vertical";
    case "dots":
      return "dots-grid";
    case "diamond":
      return "cards-diamond";
    case "waves":
      return "waves";
    case "stars":
      return "star-four-points";
    case "hexagon":
      return "hexagon-slice-6";
    case "heart":
      return "heart";
    case "club":
      return "cards-club";
    case "spade":
      return "cards-spade";
    case "crown":
      return "crown";
    case "skull":
      return "skull";
    case "ghost":
      return "ghost";
    case "fire":
      return "fire";
    case "lightning":
      return "lightning-bolt";
    case "paw":
      return "paw";
    case "music":
      return "music-note";
    case "flower":
      return "flower";
    case "spider":
      return "spider-web";
    default:
      return null;
  }
};

export default function CardVisual({
  rank,
  suit,
  isFaceUp = true,
  backColor = "#3b82f6",
  backPattern = "none",
}: CardVisualProps) {
  // 1. Check for Joker
  const isJoker = rank === "JK";

  const isRed = suit === "♥" || suit === "♦";
  // Joker color (Purple), otherwise Red or Black
  const textColor = isJoker ? "#581c87" : isRed ? "red" : "black";

  const patternIcon = getPatternIcon(backPattern);

  return (
    <View style={styles.cardOuter}>
      {/* Inner Container with overflow hidden for the pattern */}
      <View
        style={[
          styles.innerContainer,
          !isFaceUp
            ? { backgroundColor: backColor }
            : { backgroundColor: "white" },
        ]}
      >
        {isFaceUp ? (
          /* --- FRONT SIDE --- */
          <>
            {isJoker ? (
              /* --- A) NEW JOKER DESIGN (JK + STAR) --- */
              <View style={styles.jokerContainer}>
                {/* Top Left Corner */}
                <View
                  style={[
                    styles.corner,
                    { position: "absolute", top: 4, left: 4 },
                  ]}
                >
                  <Text
                    style={[styles.rankText, { color: textColor, fontSize: 9 }]}
                  >
                    JK
                  </Text>
                  <MaterialCommunityIcons
                    name="star"
                    size={12}
                    color={textColor}
                  />
                </View>

                {/* Bottom Right Corner */}
                <View
                  style={[
                    styles.corner,
                    {
                      position: "absolute",
                      bottom: 4,
                      right: 4,
                      transform: [{ rotate: "180deg" }],
                    },
                  ]}
                >
                  <Text
                    style={[styles.rankText, { color: textColor, fontSize: 9 }]}
                  >
                    JK
                  </Text>
                  <MaterialCommunityIcons
                    name="star"
                    size={12}
                    color={textColor}
                  />
                </View>

                {/* Center Content */}
                <View style={styles.centerContent}>
                  {/* Big Star */}
                  <MaterialCommunityIcons
                    name="star"
                    size={42}
                    color={textColor}
                  />
                  <Text
                    style={[
                      styles.suitText,
                      {
                        color: textColor,
                        marginTop: 4,
                        fontSize: 10,
                        fontWeight: "bold",
                      },
                    ]}
                  >
                    JOKER
                  </Text>
                </View>
              </View>
            ) : (
              /* --- B) STANDARD CARD DESIGN (2-A) --- */
              <>
                <View style={styles.corner}>
                  <Text style={[styles.rankText, { color: textColor }]}>
                    {rank}
                  </Text>
                  <Text style={[styles.suitText, { color: textColor }]}>
                    {suit}
                  </Text>
                </View>
                <View style={styles.centerContent}>
                  <Text style={[styles.bigSuit, { color: textColor }]}>
                    {suit}
                  </Text>
                </View>
                <View style={[styles.corner, styles.bottomRight]}>
                  <Text style={[styles.rankText, { color: textColor }]}>
                    {rank}
                  </Text>
                  <Text style={[styles.suitText, { color: textColor }]}>
                    {suit}
                  </Text>
                </View>
              </>
            )}
          </>
        ) : (
          /* --- BACK SIDE --- */
          <View style={styles.patternWrapper}>
            {patternIcon ? (
              <View style={{ opacity: 0.15, transform: [{ scale: 1.5 }] }}>
                <MaterialCommunityIcons
                  name={patternIcon}
                  size={Math.min(CARD_W, CARD_H) * 0.6}
                  color="white"
                />
              </View>
            ) : (
              <View style={styles.defaultDot} />
            )}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardOuter: {
    width: CARD_W,
    height: CARD_H,
    backgroundColor: "white",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 3, // Thick white border
    shadowColor: "transparent", // Kein Schatten
    elevation: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  innerContainer: {
    flex: 1,
    width: "100%",
    borderRadius: 4,
    overflow: "hidden", // Clips the pattern
    justifyContent: "space-between",
  },
  patternWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  defaultDot: {
    width: 14,
    height: 14,
    backgroundColor: "white",
    borderRadius: 7,
    opacity: 0.4,
  },
  corner: { alignItems: "center", width: 16, marginTop: 2, marginLeft: 2 }, // Slightly wider for JK
  bottomRight: {
    alignSelf: "flex-end",
    transform: [{ rotate: "180deg" }],
    marginTop: 0,
    marginBottom: 2,
    marginRight: 2,
  },
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

  // Joker Container
  jokerContainer: {
    flex: 1,
    width: "100%",
    height: "100%",
    position: "relative",
  },
});
