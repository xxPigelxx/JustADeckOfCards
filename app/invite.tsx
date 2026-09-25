import AppButton from "@/components/AppButton";
import BurgerMenu from "@/components/BurgerMenu";
import ControlsHint from "@/components/ControlsHint";
import {
  leaveRoom,
  roomErrorMessage,
  setPlayerName,
  startGame,
  useRoom,
} from "@/components/useRoom";
import { MAX_NAME_LENGTH, playerLabel } from "@/shared/protocol";
import { loadPlayerName } from "@/utils/playerName";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

// Waiting room for host and guests until the host starts the game
export default function Invite() {
  const router = useRouter();
  const navigation = useNavigation();
  const { room, connected, lost } = useRoom();
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

  // Optional name, filled in from the last game; sent shortly after typing
  const [name, setName] = useState("");
  const nameEdited = useRef(false);

  useEffect(() => {
    loadPlayerName().then((saved) => setName(saved ?? ""));
  }, []);

  useEffect(() => {
    if (!nameEdited.current) return;
    const timer = setTimeout(() => setPlayerName(name), 400);
    return () => clearTimeout(timer);
  }, [name]);

  const handleStart = async () => {
    if (starting) return;
    setError(null);
    setStarting(true);
    setPlayerName(name);
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
        <Text style={styles.codeText}>
          {room?.code ?? (lost ? "–" : "Verbinde…")}
        </Text>
      </View>

      <TextInput
        style={styles.nameInput}
        placeholder="Dein Name (optional)"
        placeholderTextColor="#888"
        value={name}
        onChangeText={(text) => {
          nameEdited.current = true;
          setName(text);
        }}
        onBlur={() => setPlayerName(name)}
        maxLength={MAX_NAME_LENGTH}
        textAlign="center"
        returnKeyType="done"
      />

      <View style={styles.playerCard}>
        <View style={styles.playerHeader}>
          <Feather
            name="users"
            size={20}
            color="black"
            style={{ marginRight: 8 }}
          />
          <Text style={styles.text}>
            Spieler: {room ? room.players.length : "–"} /{" "}
            {room ? room.config.maxPlayers : "–"}
          </Text>
        </View>
        <ScrollView style={styles.playerList}>
          {room?.players.map((p) => (
            <View key={p.id} style={styles.playerRow}>
              <View
                style={[
                  styles.dot,
                  !p.connected && { backgroundColor: "#bbb" },
                ]}
              />
              <Text style={styles.playerName} numberOfLines={1}>
                {playerLabel(p)}
                {p.id === room.you ? " (du)" : ""}
              </Text>
              {p.id === room.hostId && (
                <MaterialCommunityIcons
                  name="crown"
                  size={18}
                  color="#854d0e"
                />
              )}
            </View>
          ))}
        </ScrollView>
      </View>

      <ControlsHint style={{ marginTop: 24 }} />

      {lost && (
        <Text style={styles.errorText}>
          Dieses Spiel gibt es nicht mehr. Gehe zurück und erstelle ein neues.
        </Text>
      )}
      {room && !connected && (
        <Text style={styles.errorText}>
          Verbindung unterbrochen – verbinde neu…
        </Text>
      )}
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
    width: 180,
    height: 250,
    marginTop: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
    textAlign: "center",
    marginTop: -30,
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
    marginTop: 20,
  },
  waitingText: {
    marginTop: 24,
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
  nameInput: {
    width: "70%",
    height: 40,
    borderColor: "#000",
    borderWidth: 0.5,
    borderRadius: 15,
    backgroundColor: "#fff",
    color: "#000",
    marginTop: 10,
    paddingHorizontal: 10,
    fontSize: 15,
  },
  playerCard: {
    width: "70%",
    marginTop: 10,
    backgroundColor: "#fff",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 15,
  },
  playerHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  playerList: {
    maxHeight: 130,
  },
  playerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 3,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#22c55e",
  },
  playerName: {
    flexShrink: 1,
    fontSize: 15,
    color: "#000",
  },
});
