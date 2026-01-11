import AppButton from '@/componets/AppButton';
import BurgerMenu from '@/componets/BurgerMenu';
import { ImageBackground } from "expo-image";
import { router } from "expo-router";
import { useState } from 'react';
import { StyleSheet, Text, View } from "react-native";

export default function Index() {

  const [menuOpen, setMenuOpen] = useState(false);

   return (
    <View style={{ flex: 1 }}>
      <BurgerMenu dontShow='home'/>
      <View style={{ alignItems: 'center', paddingTop: 120 }} > 
        <ImageBackground
          source={require('../assets/images/logo.png')}
          style={{ width: 330, height: 370, justifyContent: 'flex-start', alignItems: 'center' }}
          contentFit="contain"
          >
          <Text style={styles.logoText}>Just a Deck of Cards</Text>
        </ImageBackground>
      </View>
      <View style={styles.container}>
        <AppButton title='Spiel erstellen' onPress={() => router.push("/create")}/>
        <AppButton title='Spiel beitreten' onPress={() => router.push("/join")}/>
        {/* <AppButton title='Game' onPress={() => router.push("/gameScreen")}/> */}
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
    marginTop: -10,
    rowGap: 40,
    padding: 0,
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000000ff',
    marginTop: -10,
    marginBottom: 100,
  },

  text: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});
