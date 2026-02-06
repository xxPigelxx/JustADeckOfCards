import React from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import AppButton from "./AppButton";

type CustomAlertProps = {
  visible: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function CustomAlert({
  visible,
  title,
  message,
  onConfirm,
  onCancel,
}: CustomAlertProps) {
  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="fade"
      onRequestClose={onCancel}
    >
      {/* 1. ÄNDERUNG: Overlay ist jetzt Pressable und ruft onCancel auf */}
      <Pressable style={styles.overlay} onPress={onCancel}>
        {/* 2. ÄNDERUNG: Die Box ist auch Pressable (ohne Aktion), 
            damit Klicks HIER DRIN das Modal NICHT schließen */}
        <Pressable style={styles.alertBox} onPress={() => {}}>
          {/* Titel */}
          <Text style={styles.title}>{title}</Text>

          {/* Nachricht */}
          <Text style={styles.message}>{message}</Text>

          {/* Buttons Container */}
          <View style={styles.buttonContainer}>
            {/* NEIN Button (Grau) */}
            <AppButton
              title="Nein"
              onPress={onCancel}
              style={{
                ...styles.buttonBase,
                backgroundColor: "#444",
              }}
              textStyle={styles.buttonText}
            />

            {/* JA Button (Rot) */}
            <AppButton
              title="Ja"
              onPress={onConfirm}
              style={{
                ...styles.buttonBase,
                backgroundColor: "#d9534f",
              }}
              textStyle={styles.buttonText}
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  alertBox: {
    width: 320,
    backgroundColor: "#222",
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: "#444",
    elevation: 10,
    alignItems: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 12,
    textAlign: "center",
  },
  message: {
    fontSize: 16,
    color: "#ccc",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    gap: 15,
  },
  buttonBase: {
    flex: 1,
    minWidth: 100,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "white",
    textAlign: "center",
  },
});
