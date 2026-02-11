import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View, ViewStyle } from "react-native";

type ControlsHintProps = {
  style?: ViewStyle;
};

export default function ControlsHint({ style }: ControlsHintProps) {
  return (
    <View style={[styles.hintContainer, style]}>
      {/* Info Icon links */}
      <Feather
        name="info"
        size={24}
        color="#666"
        style={{ marginRight: 8, marginTop: -4 }}
      />

      {/* Textblock */}
      <Text style={styles.hintText}>
        Tipp: Steuerung & Regeln findest du im Menü{" "}
        <Text style={{ fontWeight: "bold" }}>☰</Text>
        {"\n"}unter {/* Controls Icon */}
        <Feather name="help-circle" size={14} color="#666" /> und{" "}
        {/* Book Icon */}
        <Feather name="book" size={14} color="#666" />.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  hintContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
    opacity: 0.8,
  },
  hintText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
  },
});
