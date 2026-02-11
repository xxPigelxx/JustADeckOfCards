import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, ViewStyle } from "react-native";

interface BackButtonProps {
  style?: ViewStyle;
}

export default function BackButton({ style }: BackButtonProps) {
  const router = useRouter();

  return (
    <Pressable
      onPress={() => router.back()}
      style={({ pressed }) => [
        styles.burgerButton,
        style,
        { backgroundColor: pressed ? "#f1ce5bff" : "#000" },
        pressed && { opacity: 0.8 },
      ]}
    >
      <Ionicons name="arrow-back" size={26} color="white" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  burgerButton: {
    position: "absolute",
    bottom: 40,
    right: 40,
    width: 48,
    height: 48,
    borderRadius: 24,

    alignItems: "center",
    justifyContent: "center",

    elevation: 8,
    zIndex: 100,
    shadowColor: "transparent",
  },
});
