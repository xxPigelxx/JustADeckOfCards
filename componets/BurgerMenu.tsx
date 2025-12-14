import { router } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import AppButton from './AppButton';

type BurgerMenuProps = {
    dontShow?: "controls" | "rulebook" | "home" | "";
}

export default function BurgerMenu( { dontShow }: BurgerMenuProps) {

    const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <Pressable 
        onPress={() => setMenuOpen(!menuOpen)}
        style={({ pressed }) => [
          styles.burgerButton,
          menuOpen && { backgroundColor: "#f1ce5bff" },
          pressed && { opacity: 0.6 }
        ]}
      >
            <Text style={styles.text}>
                {menuOpen? "✕" : "☰"}
            </Text>
      </Pressable>
      {menuOpen && (
        <View style={styles.circleMenu}>

            {dontShow !== "controls" &&(
                <AppButton
                        title="Controls"
                        onPress={() => { 
                        setMenuOpen(false);
                        router.push("/controls");
                        }}
                        style={{ ...styles.circleItem, minWidth: 90, paddingHorizontal: 0, paddingVertical: 0 }}
                        textStyle={styles.circleText}
                />
            )}

            {dontShow !== "rulebook" &&(
                <AppButton
                        title="Rulebook"
                        onPress={() => { 
                        setMenuOpen(false);
                        router.push("/rulebook");
                        }}
                        style={{ ...styles.circleItem, minWidth: 90, paddingHorizontal: 0, paddingVertical: 0 }}
                        textStyle={styles.circleText}
                />
            )}
            {dontShow !== "home" && (
                <AppButton
                    title="Home"
                    onPress={() => {
                      setMenuOpen(false);
                      router.replace("/");
                    }}
                    style={{
                      ...styles.circleItem,
                      minWidth: 90,
                      paddingHorizontal: 0,
                      paddingVertical: 0,
                    }}
                    textStyle={styles.circleText}
            />
          )}
        </View>
      )}
    </>
  )
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
  },

  burgerIcon: {
    color: "white",
    fontSize: 26,
    lineHeight: 26,
  },

  circleMenu: {
    position: "absolute",
    bottom: 100,
    right: 40,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 10,
    elevation: 10,
    zIndex: 99,
    alignItems: "center",
  },

  circleItem: {
    width: 90,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#111",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 6,
  },

  circleText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  text: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});