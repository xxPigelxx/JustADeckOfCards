import AppButton from "@/components/AppButton";
import BurgerMenu from "@/components/BurgerMenu";
import {
  clearLostRoom,
  forgetSavedRoom,
  getSavedRoom,
  resumeRoom,
  roomErrorMessage,
} from "@/components/useRoom";
import { ImageBackground } from "expo-image";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
export default function Index() {
  const { width, height } = useWindowDimensions();

  const logoSize = Math.min(width * 0.8, 400);

  // A game this device was in before the app was closed
  const [savedRoom, setSavedRoom] = useState<string | null>(null);
  const [resuming, setResuming] = useState(false);
  const [resumeError, setResumeError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      getSavedRoom().then(setSavedRoom);
    }, []),
  );

  const handleResume = async () => {
    if (resuming) return;
    setResumeError(null);
    setResuming(true);
    const res = await resumeRoom();
    setResuming(false);
    if (res.ok) {
      // The waiting room goes on to the table if the game is running
      router.push("/invite");
      return;
    }
    clearLostRoom();
    if (res.error === "offline") {
      setResumeError(roomErrorMessage("offline"));
    } else {
      setSavedRoom(null);
      setResumeError("Das Spiel gibt es nicht mehr.");
    }
  };

  const handleForget = () => {
    forgetSavedRoom();
    setSavedRoom(null);
    setResumeError(null);
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <BurgerMenu dontShow="home" />
      <View style={styles.logoContainer}>
        <ImageBackground
          source={require("../assets/images/logo.png")}
          style={{
            width: logoSize,
            height: logoSize,
            justifyContent: "flex-start",
            alignItems: "center",
          }}
          contentFit="contain"
        >
          <Text style={styles.logoText}>Just a Deck of Cards</Text>
        </ImageBackground>
      </View>

      <View style={styles.buttonContainer}>
        {savedRoom && (
          <View style={styles.resumeCard}>
            <Text style={styles.resumeTitle}>Laufendes Spiel {savedRoom}</Text>
            <View style={styles.resumeActions}>
              <Pressable
                onPress={handleResume}
                style={styles.resumeButton}
                hitSlop={6}
              >
                <Text style={styles.resumeButtonText}>
                  {resuming ? "Verbinde…" : "Zurück ins Spiel"}
                </Text>
              </Pressable>
              <Pressable onPress={handleForget} hitSlop={10}>
                <Text style={styles.resumeLeave}>Verlassen</Text>
              </Pressable>
            </View>
          </View>
        )}
        {resumeError && <Text style={styles.resumeError}>{resumeError}</Text>}

        <AppButton
          title="Spiel erstellen"
          onPress={() => router.push("/create")}
        />
        <AppButton
          title="Spiel beitreten"
          onPress={() => router.push("/join")}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  logoContainer: {
    marginTop: 40,
    flex: 1.2,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonContainer: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    rowGap: 30,
    paddingTop: 20,
  },
  resumeCard: {
    backgroundColor: "#fff",
    borderRadius: 15,
    paddingVertical: 12,
    paddingHorizontal: 18,
    alignItems: "center",
    minWidth: 260,
  },
  resumeTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000",
    marginBottom: 10,
  },
  resumeActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
  },
  resumeButton: {
    backgroundColor: "#f1ce5bff",
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  resumeButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#000",
  },
  resumeLeave: {
    fontSize: 15,
    fontWeight: "600",
    color: "#555",
    textDecorationLine: "underline",
  },
  resumeError: {
    marginTop: -16,
    fontSize: 14,
    color: "#b91c1c",
    textAlign: "center",
  },
  logoText: {
    fontSize: 32,
    fontFamily: "MochiBoom",
    color: "#000000ff",
    marginBottom: 20,

    position: "absolute",
    top: -50,
    width: "150%",
    textAlign: "center",
  },
  circleText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  text: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
});
