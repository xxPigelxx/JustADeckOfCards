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
      statusBarTranslucent={true}
      onRequestClose={onCancel}
    >
      <Pressable style={styles.overlay} onPress={onCancel}>
        <Pressable style={styles.alertBox} onPress={() => {}}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          <View style={styles.buttonContainer}>
            <AppButton
              title="Nein"
              onPress={onCancel}
              style={{
                ...styles.buttonBase,
                backgroundColor: "#444",
              }}
              textStyle={styles.buttonText}
            />

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
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
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
    borderRadius: 15,
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
