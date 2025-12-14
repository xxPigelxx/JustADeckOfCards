import AppButton from '@/componets/AppButton';
import BurgerMenu from '@/componets/BurgerMenu';
import { useFonts } from 'expo-font';
import { ImageBackground } from "expo-image";
import { router } from "expo-router";
import { useState } from 'react';
import { StyleSheet, Text, View } from "react-native";

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
      <BurgerMenu dontShow='home'/>
      <View style={{ alignItems: 'center', paddingTop: 150 }} > 
        <ImageBackground
          source={require('../assets/images/Logo.png')}
          style={{ width: 350, height: 350, justifyContent: 'flex-start', alignItems: 'center' }}
          contentFit="contain"
          >
          <Text style={styles.logoText}>Just A Deck Of Cards</Text>
        </ImageBackground>
      </View>
      <View style={styles.container}>
        <AppButton title='Create Game' onPress={() => router.push("/create")}/>
        <AppButton title='Join Game' onPress={() => router.push("/join")}/>
        <AppButton title='Game' onPress={() => router.push("/gameScreen")}/>
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
  logoText: {
    fontSize: 32,
    fontFamily: 'MochiBoom',
    color: '#000000ff',
    marginTop: 0,
    marginBottom: 100,
  },

  text: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});
