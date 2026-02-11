import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, ViewStyle } from "react-native";

interface Props {
  onPress: () => void;
  style?: ViewStyle;
}

export default function HandGridToggleButton({ onPress, style }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.button, style, pressed && styles.pressed]}
    >
      {({ pressed }) => <Ionicons name="chevron-up" size={24} color="white" />}
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
    shadowColor: "transparent",
  },
  pressed: {
    backgroundColor: "#f1ce5bff",
  },
});
