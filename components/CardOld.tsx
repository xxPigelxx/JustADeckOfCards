import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

type CardProps = {
  id: string;
  rank: string;
  suit: string;
  x: number;
  y: number;
  zIndex?: number;
  isFaceUp?: boolean;
  badgeCount?: number; // New prop for stack count badge
  onDrop: (id: string, x: number, y: number) => void;
  onDrag?: (id: string, x: number, y: number) => void; 
  onDragStart?: () => void;
  onDragEnd?: () => void;
  onTap?: () => void;
};

const CARD_W = 60;
const CARD_H = 80;

export default function Card({
  id,
  rank,
  suit,
  x,
  y,
  zIndex = 1,
  isFaceUp = true,
  badgeCount = 0, // Default to 0 (no badge)
  onDrop,
  onDrag,
  onDragStart,
  onDragEnd,
  onTap,
}: CardProps) {
  const translateX = useSharedValue(x);
  const translateY = useSharedValue(y);
  const isDragging = useSharedValue(false);
  const scale = useSharedValue(1);
  const rotateZ = useSharedValue(0);

  const tapGesture = Gesture.Tap()
    .maxDuration(250)
    .onEnd(() => {
      if (onTap) runOnJS(onTap)();
    });

  const dragGesture = Gesture.Pan()
    .onStart(() => {
      isDragging.value = true;
      scale.value = withSpring(1.1);
      rotateZ.value = withTiming(0);
      if (onDragStart) runOnJS(onDragStart)();
    })
    .onUpdate((event) => {
      translateX.value = event.translationX + x;
      translateY.value = event.translationY + y;
      if (onDrag) {
        runOnJS(onDrag)(id, event.absoluteX, event.absoluteY);
      }
    })
    .onEnd((event) => {
      isDragging.value = false;
      scale.value = withSpring(1);
      const absX = event.absoluteX;
      const absY = event.absoluteY;
      runOnJS(onDrop)(id, absX, absY);
      if (onDragEnd) runOnJS(onDragEnd)();
      
      translateX.value = withSpring(0);
      translateY.value = withSpring(0);
    });

  const gesture = Gesture.Race(dragGesture, tapGesture);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
      { rotateZ: `${rotateZ.value}deg` },
    ],
    zIndex: isDragging.value ? 9999 : zIndex,
  }));

  const isRed = suit === "♥" || suit === "♦";

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[styles.card, animatedStyle, !isFaceUp && styles.cardBack]}>
        
        {/* Badge: Renders if badgeCount > 1 */}
        {badgeCount > 1 && (
            <View style={styles.badgeContainer}>
                <Text style={styles.badgeText}>{badgeCount}</Text>
            </View>
        )}

        {isFaceUp ? (
            <>
                {/* Top Left Corner */}
                <View style={styles.corner}>
                <Text style={[styles.rankText, { color: isRed ? "red" : "black" }]}>
                    {rank}
                </Text>
                <Text style={[styles.suitText, { color: isRed ? "red" : "black" }]}>
                    {suit}
                </Text>
                </View>

                {/* Center Big Suit */}
                <View style={styles.centerContent}>
                    <Text style={[styles.bigSuit, { color: isRed ? "red" : "black" }]}>
                        {suit}
                    </Text>
                </View>

                {/* Bottom Right Corner (Rotated) */}
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
            // Card Back Design
            <View style={styles.backPattern}>
                <View style={styles.innerBack} />
            </View>
        )}
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_W,
    height: CARD_H,
    backgroundColor: "white",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 2,
    // Shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
    justifyContent: 'space-between'
  },
  // Badge Styles
  badgeContainer: {
    position: 'absolute',
    top: -8, 
    right: -8,
    backgroundColor: '#f1ce5bff',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100, 
    elevation: 5
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold'
  },
  // Face Down Styles
  cardBack: {
      backgroundColor: '#fff', 
      justifyContent: 'center', 
      alignItems: 'center',
      padding: 4
  },
  backPattern: {
      flex: 1,
      width: '100%',
      backgroundColor: '#3b82f6', // Blue Back
      borderRadius: 4,
      justifyContent: 'center', 
      alignItems: 'center'
  },
  innerBack: {
      width: 20, height: 20,
      backgroundColor: '#60a5fa',
      borderRadius: 10,
      opacity: 0.5
  },
  // Face Up Styles
  corner: {
    alignItems: "center",
    width: 20,
  },
  bottomRight: {
    alignSelf: 'flex-end',
    transform: [{ rotate: '180deg' }]
  },
  rankText: {
    fontSize: 12,
    fontWeight: "bold",
    lineHeight: 12,
  },
  suitText: {
    fontSize: 12,
    lineHeight: 12,
  },
  centerContent: {
      position: 'absolute',
      top: 0, left: 0, right: 0, bottom: 0,
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: -1
  },
  bigSuit: {
      fontSize: 32,
      opacity: 0.1
  }
});
