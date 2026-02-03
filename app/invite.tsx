import AppButton from "@/components/AppButton";
import BurgerMenu from "@/components/BurgerMenu";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";

export default function Invite() {
  const [code, setCode] = useState("");
  const router = useRouter();

  const generateCode = () => {
    const randomNum = Math.floor(Math.random() * 10000);
    return randomNum.toString().padStart(4, "0");
  };

  useEffect(() => {
    setCode(generateCode());
  }, []);

  return (
    <View style={styles.container}>
      <Image
        source={require("../assets/images/key.png")}
        style={styles.image}
        resizeMode="contain"
      />

      <Text style={styles.title}>Einladungscode</Text>

      <View style={styles.codeField}>
        <Text style={styles.codeText}>{code}</Text>
      </View>

      <AppButton
        title="Spiel starten"
        onPress={() => router.push("/gameScreen")}
        style={styles.button}
      />
      <BurgerMenu />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: "flex-start",
    alignItems: "center",
  },
  image: {
    width: 230,
    height: 350,
    marginTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
    textAlign: "center",
    marginTop: -40,
  },
  codeField: {
    width: "70%",
    height: 45,
    borderColor: "#000",
    borderWidth: 0.5,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    marginTop: 10,
  },
  codeText: {
    color: "#000",
    fontSize: 18,
    fontWeight: "bold",
  },
  button: {
    marginTop: 30,
  },
});
