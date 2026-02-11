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

  useEffect(() => {
    if (visible) {
      const rgb = hexToRgb(initialColor);
      setRed(rgb.r);
      setGreen(rgb.g);
      setBlue(rgb.b);
    }
  }, [visible]);

  useEffect(() => {
    if (visible) {
      const newHex = rgbToHex(red, green, blue);
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
