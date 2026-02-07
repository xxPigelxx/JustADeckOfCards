import React from "react";
import { Modal, Pressable, StyleSheet, Text } from "react-native";
import AppButton from "./AppButton";

interface InfoAlertProps {
  visible: boolean;
  title: string;
  message: string;
  onClose: () => void;
}

export default function InfoAlert({
  visible,
  title,
  message,
  onClose,
}: InfoAlertProps) {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable
          style={styles.alertBox}
          onPress={(e) => e.stopPropagation()} // Klick auf Box schließt NICHT
        >
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          <AppButton
            title="OK"
            onPress={onClose}
            style={styles.button}
            textStyle={{ fontSize: 16 }} // Kleinerer Text im Button
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)", // Leicht abgedunkelt
    justifyContent: "center",
    alignItems: "center",
  },
  alertBox: {
    width: "80%",
    maxWidth: 320,
    backgroundColor: "#fff", // Light Mode
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    // Schatten für Tiefe
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: "#333",
    marginBottom: 12,
    textAlign: "center",
    // fontFamily: "MochiBoom", // Falls du den Font überall willst, einkommentieren
  },
  message: {
    fontSize: 15,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  button: {
    minWidth: 100, // Nicht zu riesig
    height: 44, // Kompakter
  },
});
