import { useFonts } from 'expo-font';
import { ImageBackground } from "expo-image";
import { router } from "expo-router";
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function Index() {

  const [menuOpen, setMenuOpen] = useState(false);

   const [fontsLoaded] = useFonts({
    'MochiBoom': require('../assets/fonts/MochiBoom.ttf'),
  });
    if (!fontsLoaded) {
        return null;
    }

   return (
    <View style={{ flex: 1 }}>
      
        <Pressable 
            onPress={() => setMenuOpen(!menuOpen)}
            style={({ pressed }) => [
               styles.burgerButton,
               menuOpen && { backgroundColor: "#e6c457ff" },
               pressed && { opacity: 0.6 }
            ]
            }>
          {menuOpen ? (
            <Text style={styles.buttonText}>✕</Text>
          ) : (
            <Text style={styles.buttonText}>☰</Text>)}
          </Pressable>
          {menuOpen && (
            <View style={styles.circleMenu}>
              <Pressable
                style={styles.circleItem}
                onPress={() => {
                  setMenuOpen(false);
                  router.push("/controls");
                }}
              >
                <Text style={styles.circleText}>Controls</Text>
              </Pressable>
              <Pressable
                style={styles.circleItem}
                onPress={() => {
                  setMenuOpen(false);
                  router.push("/rulebook");
                }}
              >
                <Text style={styles.circleText}>Rulebook</Text>
              </Pressable>
            </View>
          )}

      
      <View style={{ alignItems: 'center', paddingTop: 150 }} > 
        <ImageBackground
          source={require('../assets/images/Logo.png')}
          style={{ width: 350, height: 350, justifyContent: 'flex-start', alignItems: 'center' }}
          contentFit="contain"
          >
          <Text style={styles.logoText}>Just A Deck Of Cards</Text>
        </ImageBackground>
      </View>
      <View
        style={styles.container}
      >
        <Pressable 
            onPress={() => router.push("/create")}
            style={({ pressed }) => ({
              ...styles.button,
              opacity:  pressed? .6 :1, 
            })
          }
          >
          <Text style={styles.buttonText}>Create Game</Text>
        </Pressable>
        <Pressable 
            onPress={() => router.push("/join")}
            style={({ pressed }) => ({
              ...styles.button,
              opacity:  pressed? .6 :1, 
            })
          }
          >
          <Text style={styles.buttonText}>Join Game</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  burgerButton: {
    position: "absolute",
    top: 75,
    right: 20,
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
    top: 135,
    right: 20,
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

  container: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    rowGap: 50,
    padding: 20,
  },
  button: {
    backgroundColor: '#000000ff',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 15, 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5, 
    minWidth: 200, 
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  logoText: {
    fontSize: 32,
    fontFamily: 'MochiBoom',
    color: '#000000ff',
    marginTop: 0,
    marginBottom: 100,
  },
});
