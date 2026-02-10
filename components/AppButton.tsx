import React from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";

interface AppButtonProps {
  title: string;
  icon?: React.ReactNode;
  onPress: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export default function AppButton({
  title,
  icon,
  onPress,
  style,
  textStyle,
}: AppButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        style,
        pressed && { opacity: 0.6, backgroundColor: "#f1ce5bff" },
      ]}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        {!icon && <Text style={[styles.buttonText, textStyle]}>{title}</Text>}
        {icon}
      </View>
    </Pressable>
  );
}
const styles = StyleSheet.create({
  button: {
    backgroundColor: "#000000ff",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 15,
    shadowColor: "transparent",
    elevation: 5,
    minWidth: 200,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
});
