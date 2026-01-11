import React, { useRef } from "react";
import { Animated, PanResponder, StyleSheet, Text, View } from "react-native";

type Props = {
  value: number;
  onChange: (val: number) => void;
};

export default function CustomSlider({ value, onChange }: Props) {
  const sliderWidth = 320;
  const max = 10;

  const pan = useRef(new Animated.Value(0)).current;
  const current = useRef(0);

  const clamp = (val: number, min: number, max: number) =>
    Math.min(Math.max(val, min), max);

  const updatePosition = (dx: number) => {
    const newX = clamp(current.current + dx, 0, sliderWidth);
    pan.setValue(newX - current.current);
    onChange(Math.round((newX / sliderWidth) * max));
    return newX;
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        pan.setOffset(current.current);
        pan.setValue(0);
      },
      onPanResponderMove: (_, gesture) => {
        updatePosition(gesture.dx);
      },
      onPanResponderRelease: (_, gesture) => {
        current.current = updatePosition(gesture.dx);
        pan.flattenOffset();
      },
    })
  ).current;

  return (
    <View style={styles.container}>
      <View style={[styles.track, { width: sliderWidth }]} />
      <Animated.View
        {...panResponder.panHandlers}
        style={[styles.thumb, { transform: [{ translateX: pan }] }]}
      />
      <View style={[styles.numbers, { width: sliderWidth }]}>
        {Array.from({ length: max + 1 }, (_, i) => (
          <Text key={i} style={styles.number}>
            {i}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    marginTop: 20, 
  },
  
  track: { 
    height: 8, 
    backgroundColor: "#ffffffff", 
    borderRadius: 20, 
  },
  
  thumb: {
    position: "absolute",
    top: -10,
    width: 28,
    height: 28,
    backgroundColor: "#000000ff",
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#00000030",
  },
  numbers: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    marginTop: 10, 
  },
  
  number: { 
    fontSize: 12, 
    color: "#000", 
  },
});
