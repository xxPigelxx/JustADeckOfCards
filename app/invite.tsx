import AppButton from "@/components/AppButton";
import BurgerMenu from "@/components/BurgerMenu";
import ControlsHint from "@/components/ControlsHint";
import {
  leaveRoom,
  roomErrorMessage,
  startGame,
  useRoom,
} from "@/components/useRoom";
import { Feather } from "@expo/vector-icons";
import { useNavigation, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";

// Waiting room for host and guests until the host starts the game
export default function Invite() {
  const router = useRouter();
  const navigation = useNavigation();
  const { room } = useRoom();
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const goingToGame = useRef(false);

  const isHost = !!room && room.you === room.hostId;

  // The host started: everyone goes to the table
  useEffect(() => {
    if (room?.status !== "playing") return;
    goingToGame.current = true;
    router.replace({ pathname: "/gameScreen", params: { mode: "online" } });
  }, [room?.status, router]);

  // Going back (or home) from the waiting room leaves the room
  useEffect(
    () =>
      navigation.addListener("beforeRemove", () => {
        if (!goingToGame.current) leaveRoom();
      }),
    [navigation],
  );

  const handleStart = async () => {
    if (starting) return;
    setError(null);
    setStarting(true);
    const res = await startGame();
    setStarting(false);
    if (!res.ok) setError(roomErrorMessage(res.error));
  };

  return (
    <View style={styles.container}>
      <Image
        source={require("../assets/images/key.png")}
        style={styles.image}
        resizeMode="contain"
      />

      <Text style={styles.title}>Einladungscode</Text>

      <View style={styles.codeField}>
        <Text style={styles.codeText}>{room?.code ?? "Verbinde…"}</Text>
      </View>

      <View style={styles.playerBadge}>
        <Feather
          name="users"
          size={24}
          color="black"
          style={{ marginRight: 8 }}
        />
        <Text style={styles.text}>
          Spieler: {room ? room.players.length : "–"} /{" "}
          {room ? room.config.maxPlayers : "–"}
        </Text>
      </View>

      <ControlsHint style={{ marginTop: 100 }} />

      {error && <Text style={styles.errorText}>{error}</Text>}

      {isHost ? (
        <AppButton
          title={starting ? "Starte…" : "Spiel starten"}
          onPress={handleStart}
          style={styles.button}
        />
      ) : (
        <Text style={styles.waitingText}>
          {room ? "Warte auf den Host…" : ""}
        </Text>
      )}

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
  waitingText: {
    marginTop: 40,
    fontSize: 16,
    fontWeight: "600",
    color: "#555",
  },
  errorText: {
    marginTop: 16,
    fontSize: 14,
    color: "#b91c1c",
    textAlign: "center",
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
