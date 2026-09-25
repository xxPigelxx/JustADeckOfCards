import AppButton from "@/components/AppButton";
import BurgerMenu from "@/components/BurgerMenu";
import ControlsHint from "@/components/ControlsHint";
import { joinRoom, roomErrorMessage } from "@/components/useRoom";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Image, StyleSheet, Text, TextInput, View } from "react-native";

export default function Join() {
  const [code, setCode] = useState("");
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const isCodeValid = code.trim().length === 6;

  // Join the room on the server, then wait for the host in the waiting room
  const handleJoin = async () => {
    if (joining) return;
    setError(null);
    setJoining(true);
    const res = await joinRoom(code);
    setJoining(false);
    if (res.ok) router.push("/invite");
    else setError(roomErrorMessage(res.error));
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
          setError(null);
        }}
        textAlign="center"
        autoCapitalize="characters"
        maxLength={6}
      />

      <Text style={[styles.helperText, error && styles.errorText]}>
        {error ?? "Bitte gib den 6-stelligen Code ein"}
      </Text>

      <View style={{ height: 150 }} />

      <ControlsHint style={{ marginBottom: 20 }} />

      <AppButton
        title={joining ? "Verbinde…" : "Spiel beitreten"}
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
    borderRadius: 15,
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
  errorText: {
    color: "#b91c1c",
    fontWeight: "600",
  },
  button: {
    marginTop: 0,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});
