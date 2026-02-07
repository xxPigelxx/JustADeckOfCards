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
      // Der Style ist jetzt eine Funktion, die den Zustand 'pressed' bekommt
      style={({ pressed }) => [
        styles.burgerButton, // Basis-Style (Form, Schatten, Position)
        style, // Externe Overrides (z.B. top/left)
        // Farbe ändern: Schwarz (Standard) oder Gelb (Gedrückt)
        { backgroundColor: pressed ? "#f1ce5bff" : "#000" },
        // Optional: Deckkraft ändern für noch mehr Feedback
        pressed && { opacity: 0.8 },
      ]}
    >
      {/* Icon direkt im Pressable, kein extra View nötig */}
      <Ionicons name="arrow-back" size={26} color="white" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  burgerButton: {
    // Layout & Position
    position: "absolute",
    bottom: 40,
    right: 40,
    width: 48,
    height: 48,
    borderRadius: 24,

    // Inhalt zentrieren
    alignItems: "center",
    justifyContent: "center",

    // Schatten (Android + iOS)
    elevation: 8,
    zIndex: 100,
    shadowColor: "transparent",
  },
});
