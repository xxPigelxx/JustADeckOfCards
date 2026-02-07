// components/ColorPickerModal.tsx
import AppButton from "@/components/AppButton";
import CustomSlider from "@/components/Slider";
import { hexToRgb, rgbToHex } from "@/utils/colorUtils";
import React, { useEffect, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

interface ColorPickerModalProps {
  visible: boolean;
  initialColor: string;
  onClose: () => void;
  onSelectColor: (color: string) => void;
}

export default function ColorPickerModal({
  visible,
  initialColor,
  onClose,
  onSelectColor,
}: ColorPickerModalProps) {
  const [red, setRed] = useState(0);
  const [green, setGreen] = useState(0);
  const [blue, setBlue] = useState(0);

  // Wenn Modal öffnet, Slider auf aktuelle Farbe setzen
  // Nur beim Öffnen (visible wechselt von false auf true) die Werte setzen.
  // Wir ignorieren Änderungen an initialColor, während das Modal offen ist.
  useEffect(() => {
    if (visible) {
      const rgb = hexToRgb(initialColor);
      setRed(rgb.r);
      setGreen(rgb.g);
      setBlue(rgb.b);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]); // initialColor aus Dependency Array entfernt!

  // Wenn Slider bewegt werden, Farbe update an Parent senden (optional,
  // oder erst beim Speichern. Hier machen wir es 'live' für Vorschau,
  // oder wir haben lokalen State und 'Übernehmen' Button).
  // Im originalen Code hast du 'Übernehmen' gedrückt um zu schließen,
  // aber die Farbe wurde live im 'useEffect' des Parents gesetzt.
  // Sauberer: Wir nutzen einen lokalen State für Vorschau im Modal,
  // und geben die Farbe erst bei 'Übernehmen' zurück?
  // -> Um nah am Original zu bleiben: Wir updaten live, damit man es sieht?
  // BESSER: Wir updaten live, damit der User Feedback hat.

  useEffect(() => {
    if (visible) {
      const newHex = rgbToHex(red, green, blue);
      // Nur senden, wenn es sich geändert hat (vermeidet Loops)
      onSelectColor(newHex);
    }
  }, [red, green, blue]);

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      statusBarTranslucent={true}
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable
          style={styles.pickerContainer}
          onPress={(e) => e.stopPropagation()}
        >
          <Text style={styles.pickerTitle}>Farbmischer</Text>

          <View
            style={[
              styles.modalPreview,
              { backgroundColor: `rgb(${red},${green},${blue})` },
            ]}
          />

          <SliderRow label="R" val={red} setVal={setRed} color="#ef4444" />
          <SliderRow label="G" val={green} setVal={setGreen} color="#10b981" />
          <SliderRow label="B" val={blue} setVal={setBlue} color="#3b82f6" />

          <AppButton
            title="Übernehmen"
            onPress={onClose}
            style={{ marginTop: 20 }}
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// Kleine Hilfskomponente für die Slider-Zeilen (DRY!)
const SliderRow = ({ label, val, setVal, color }: any) => (
  <View style={styles.sliderRow}>
    <Text style={[styles.sliderLabel, { color }]}>{label}</Text>
    <View style={{ flex: 1, paddingTop: 22 }}>
      <CustomSlider
        value={val}
        onValueChange={setVal}
        minimumValue={0}
        maximumValue={255}
        trackColor={color}
        thumbColor={color}
      />
    </View>
    <Text style={styles.valueText}>{Math.round(val)}</Text>
  </View>
);

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  pickerContainer: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    elevation: 5,
  },
  pickerTitle: { fontSize: 24, fontFamily: "MochiBoom", marginBottom: 15 },
  modalPreview: {
    width: "100%",
    height: 60,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#eee",
    marginBottom: 20,
  },
  sliderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 5,
    width: "100%",
    height: 60,
  },
  sliderLabel: {
    fontWeight: "bold",
    fontSize: 16,
    width: 20,
    marginRight: 10,
  },
  valueText: {
    width: 50,
    textAlign: "right",
    fontSize: 12,
    color: "#666",
  },
});
