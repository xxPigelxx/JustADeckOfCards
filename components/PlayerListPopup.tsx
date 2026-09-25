import * as C from "@/components/constants";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

export type PlayerRow = {
  id: string;
  label: string;
  cards: number;
  connected: boolean;
  isYou: boolean;
  isHost: boolean;
};

type PlayerListPopupProps = {
  visible: boolean;
  players: PlayerRow[];
  onClose: () => void;
};

// Players at the table and how many cards each has in their hand
export default function PlayerListPopup({
  visible,
  players,
  onClose,
}: PlayerListPopupProps) {
  if (!visible) return null;

  return (
    <View style={StyleSheet.absoluteFill}>
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      <View style={styles.popup}>
        <Text style={styles.title}>Spieler</Text>
        {players.map((p) => (
          <View key={p.id} style={styles.row}>
            <View
              style={[styles.dot, !p.connected && { backgroundColor: "#bbb" }]}
            />
            <Text style={styles.name} numberOfLines={1}>
              {p.label}
              {p.isYou ? " (du)" : ""}
            </Text>
            {p.isHost && (
              <MaterialCommunityIcons name="crown" size={16} color="#854d0e" />
            )}
            <Text style={styles.cards}>
              {p.cards} {p.cards === 1 ? "Karte" : "Karten"}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  popup: {
    position: "absolute",
    top: C.SAFE_TOP + 30,
    alignSelf: "center",
    width: 260,
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    elevation: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: "800",
    color: "#333",
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#22c55e",
  },
  name: {
    flexShrink: 1,
    fontSize: 15,
    color: "#000",
  },
  cards: {
    marginLeft: "auto",
    fontSize: 14,
    fontWeight: "600",
    color: "#555",
  },
});
