import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import AppButton from "./AppButton";

type BurgerMenuProps = {
  dontShow?: "controls" | "rulebook" | "home" | "design" | "";
  onLeave?: () => void;
};

export default function BurgerMenu({ dontShow, onLeave }: BurgerMenuProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      {/* 
         1. The Button itself (stays visible)
         Z-Index needs to be higher than the overlay so it remains clickable to close
      */}
      <Pressable
        onPress={() => setMenuOpen(!menuOpen)}
        style={({ pressed }) => [
          styles.burgerButton,
          menuOpen && { backgroundColor: "#f1ce5bff", zIndex: 99999 }, // High zIndex when open
          pressed && { opacity: 0.6 },
        ]}
      >
        <Text style={styles.text}>{menuOpen ? "✕" : "☰"}</Text>
      </Pressable>

      {/* 
         2. The Overlay + Menu
      */}
      {menuOpen && (
        <Pressable style={styles.overlay} onPress={() => setMenuOpen(false)}>
          {/* Prevent clicks on the menu itself from closing it */}
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
    zIndex: 100, // Default zIndex
    shadowColor: "transparent",
  },
  text: {
    color: "white",
    fontSize: 24,
    fontWeight: "600",
  },

  // The dark background overlay
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Dark semi-transparent
    zIndex: 9000, // High zIndex to cover everything
    alignItems: "flex-end", // Align menu to right
    justifyContent: "flex-end", // Align menu to bottom
  },

  circleMenu: {
    // Position relative to the overlay now
    marginBottom: 100, // Distance from bottom
    marginRight: 40, // Distance from right

    backgroundColor: "white",
    borderRadius: 20,
    padding: 10,
    elevation: 10,
    shadowColor: "transparent",
    alignItems: "center",
  },

  // Refactored button style for cleaner code
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
    fontSize: 14, // Adjusted size (24 was very large for button text)
    fontWeight: "600",
  },
});
