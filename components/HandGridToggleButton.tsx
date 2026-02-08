import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, ViewStyle } from "react-native";

interface Props {
  onPress: () => void;
  style?: ViewStyle; // Allows the parent to position it (absolute, bottom, etc.)
}

export default function HandGridToggleButton({ onPress, style }: Props) {
  return (
    <Pressable
      onPress={onPress}
      // Pass the 'pressed' state to the style
      style={({ pressed }) => [
        styles.button,
        style, // Apply external positioning (bottom/left)
        pressed && styles.pressed, // Apply yellow background when pressed
      ]}
    >
      {({ pressed }) => (
        <Ionicons
          name="chevron-up"
          size={24}
          // Turn icon black on yellow background, white on black background
          color="white"
        />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: "black",
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
    // iOS Shadow
    shadowColor: "transparent",
  },
  pressed: {
    backgroundColor: "#f1ce5bff", // Yellow/Gold
  },
});
