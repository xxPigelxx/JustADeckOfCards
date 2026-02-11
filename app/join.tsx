import AppButton from "@/components/AppButton";
import BurgerMenu from "@/components/BurgerMenu";
import ControlsHint from "@/components/ControlsHint";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Image, StyleSheet, Text, TextInput, View } from "react-native";

export default function Join() {
  const [code, setCode] = useState("");
  const router = useRouter();

  const isCodeValid = code.trim().length === 6;

  const handleJoin = () => {
    router.push({
      pathname: "/gameScreen",
      params: {
        lobbyCode: code,
      },
    });
  };

  return (
    <View style={styles.container}>
      <Image
        source={require("../assets/images/key.png")}
        style={styles.image}
        resizeMode="contain"
      />

      <Text style={styles.title}>Einladungscode</Text>

      <TextInput
        style={styles.input}
        placeholder="Code eingeben"
        placeholderTextColor="#888"
        value={code}
        onChangeText={(text) => {
          const cleanText = text.replace(/\s/g, "").toUpperCase();
          setCode(cleanText);
        }}
        textAlign="center"
        autoCapitalize="characters"
        maxLength={6}
      />

      <Text style={styles.helperText}>Bitte gib den 6-stelligen Code ein</Text>

      <View style={{ height: 150 }} />

      <ControlsHint style={{ marginBottom: 20 }} />

      <AppButton
        title="Spiel beitreten"
        onPress={isCodeValid ? handleJoin : () => {}}
        style={{
          ...styles.button,
          ...(!isCodeValid ? styles.buttonDisabled : {}),
        }}
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
  input: {
    width: "70%",
    height: 45,
    borderColor: "#000",
    borderWidth: 0.5,
    borderRadius: 8,
    backgroundColor: "#fff",
    color: "#000",
    marginTop: 10,
    paddingHorizontal: 10,
    fontSize: 18,
    fontWeight: "bold",
  },

  helperText: {
    marginTop: 8,
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
  button: {
    marginTop: 0,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});
