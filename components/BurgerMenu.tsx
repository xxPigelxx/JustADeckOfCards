import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import AppButton from "./AppButton";

type BurgerMenuProps = {
  dontShow?: "controls" | "rulebook" | "home" | "design" | "";
  onLeave?: () => void;
  // Game screen only: move the board camera back to the start view
  onResetView?: () => void;
  // Game screen only: players and how many cards they hold
  onShowPlayers?: () => void;
};

export default function BurgerMenu({
  dontShow,
  onLeave,
  onResetView,
  onShowPlayers,
}: BurgerMenuProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <Pressable
        onPress={() => setMenuOpen(!menuOpen)}
        style={({ pressed }) => [
          styles.burgerButton,
          menuOpen && { backgroundColor: "#f1ce5bff", zIndex: 99999 },
          pressed && { opacity: 0.6 },
        ]}
      >
        <Text style={styles.text}>{menuOpen ? "✕" : "☰"}</Text>
      </Pressable>

      {menuOpen && (
        <Pressable style={styles.overlay} onPress={() => setMenuOpen(false)}>
          <Pressable
            style={styles.circleMenu}
            onPress={(e) => e.stopPropagation()}
          >
            {dontShow !== "design" && (
              <AppButton
                title="Design"
                icon={<Feather name="edit-2" size={22} color="white" />}
                onPress={() => {
                  setMenuOpen(false);
                  router.push("/design");
                }}
                style={styles.menuButton}
                textStyle={styles.circleText}
              />
            )}

            {dontShow !== "controls" && (
              <AppButton
                title="Controls"
                icon={<Feather name="help-circle" size={22} color="white" />}
                onPress={() => {
                  setMenuOpen(false);
                  router.push("/controls");
                }}
                style={styles.menuButton}
                textStyle={styles.circleText}
              />
            )}

            {dontShow !== "rulebook" && (
              <AppButton
                title="Rulebook"
                icon={<Feather name="book" size={22} color="white" />}
                onPress={() => {
                  setMenuOpen(false);
                  router.push("/rulebook");
                }}
                style={styles.menuButton}
                textStyle={styles.circleText}
              />
            )}

            {onShowPlayers && (
              <AppButton
                title="Spieler"
                icon={<Feather name="users" size={22} color="white" />}
                onPress={() => {
                  setMenuOpen(false);
                  onShowPlayers();
                }}
                style={styles.menuButton}
                textStyle={styles.circleText}
              />
            )}

            {onResetView && (
              <AppButton
                title="Reset View"
                icon={<Feather name="crosshair" size={22} color="white" />}
                onPress={() => {
                  setMenuOpen(false);
                  onResetView();
                }}
                style={styles.menuButton}
                textStyle={styles.circleText}
              />
            )}

            {dontShow !== "home" && (
              <AppButton
                title="Home"
                icon={<Feather name="home" size={22} color="white" />}
                onPress={() => {
                  setMenuOpen(false);
                  if (onLeave) {
                    onLeave();
                  } else {
                    router.replace("/");
                  }
                }}
                style={styles.menuButton}
                textStyle={styles.circleText}
              />
            )}
          </Pressable>
        </Pressable>
      )}
    </>
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
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
    elevation: 8,
    zIndex: 100,
    shadowColor: "transparent",
  },
  text: {
    color: "white",
    fontSize: 24,
    fontWeight: "600",
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 9000,
    alignItems: "flex-end",
    justifyContent: "flex-end",
  },

  circleMenu: {
    marginBottom: 100,
    marginRight: 40,

    backgroundColor: "white",
    borderRadius: 20,
    padding: 10,
    elevation: 10,
    shadowColor: "transparent",
    alignItems: "center",
  },

  menuButton: {
    width: 90,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#111",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 6,
    paddingHorizontal: 0,
    paddingVertical: 0,
    minWidth: 90,
  },

  circleText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
});
