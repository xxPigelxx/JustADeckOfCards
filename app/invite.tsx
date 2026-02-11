import AppButton from "@/components/AppButton";
import BurgerMenu from "@/components/BurgerMenu";
import ControlsHint from "@/components/ControlsHint";
import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";

export default function Invite() {
  const [code, setCode] = useState("");
  const router = useRouter();

  const params = useLocalSearchParams();

  const playerCount = params.playerCount || 4;

  const generateCode = () => {
    const randomNum = Math.floor(Math.random() * 1000000);
    return randomNum.toString().padStart(6, "0");
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

      <View style={styles.playerBadge}>
        <Feather
          name="users"
          size={24}
          color="black"
          style={{ marginRight: 8 }}
        />
        <Text style={styles.text}>Spieler Anzahl: {playerCount}</Text>
      </View>

      <ControlsHint style={{ marginTop: 120 }} />
      <AppButton
        title="Spiel starten"
        onPress={() => {
          router.push({
            pathname: "/gameScreen",
            params: {
              ...params,
              lobbyCode: code,
            },
          });
        }}
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
  text: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
    textAlign: "center",
  },
  codeField: {
    width: "70%",
    height: 45,
    borderColor: "#000",
    borderWidth: 0.5,
    borderRadius: 15,
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
  playerBadge: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    backgroundColor: "#ffffffff",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 15,
  },
});
