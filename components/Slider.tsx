import React, { useEffect, useRef } from "react";
import { Animated, PanResponder, StyleSheet, Text, View } from "react-native";

type Props = {
  value: number;
  onValueChange: (val: number) => void;
  minimumValue?: number;
  maximumValue?: number;
  step?: number;
};

export default function CustomSlider({
  value,
  onValueChange,
  minimumValue = 0,
  maximumValue = 10,
  step = 1,
}: Props) {
  const sliderWidth = 320;
  const range = maximumValue - minimumValue;
  const numberWidth = 40;

  const getPositionFromValue = (val: number) => {
    if (range === 0) return 0;
    return ((val - minimumValue) / range) * sliderWidth;
  };

  const pan = useRef(new Animated.Value(getPositionFromValue(value))).current;
  const startPos = useRef(0);

  useEffect(() => {
    const newPos = getPositionFromValue(value);
    pan.setValue(newPos);
  }, [value, minimumValue, maximumValue]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,

      onPanResponderGrant: () => {
        // @ts-ignore
        startPos.current = pan._value;
        pan.setOffset(startPos.current);
        pan.setValue(0);
      },

      onPanResponderMove: (_, gesture) => {
        const currentPos = startPos.current + gesture.dx;

        if (currentPos >= 0 && currentPos <= sliderWidth) {
          pan.setValue(gesture.dx);
        }

        const rawValue =
          (Math.max(0, Math.min(currentPos, sliderWidth)) / sliderWidth) *
            range +
          minimumValue;
        const steppedValue = Math.round(rawValue / step) * step;
        if (steppedValue !== value) {
          onValueChange(steppedValue);
        }
      },

      onPanResponderRelease: (_, gesture) => {
        pan.flattenOffset();
        // @ts-ignore
        let currentPos = pan._value;

        if (currentPos < 0) currentPos = 0;
        if (currentPos > sliderWidth) currentPos = sliderWidth;

        const rawValue = (currentPos / sliderWidth) * range + minimumValue;
        const steppedValue = Math.round(rawValue / step) * step;
        const clampedValue = Math.min(
          Math.max(steppedValue, minimumValue),
          maximumValue,
        );

        const snappedPos = getPositionFromValue(clampedValue);

        Animated.spring(pan, {
          toValue: snappedPos,
          useNativeDriver: false,
          speed: 20,
          bounciness: 0,
        }).start();

        onValueChange(clampedValue);
      },
    }),
  ).current;

  const showAllNumbers = range <= 10;
  const numbers = showAllNumbers
    ? Array.from({ length: range + 1 }, (_, i) => minimumValue + i)
    : [minimumValue, maximumValue];

  return (
    <View style={styles.centerContainer}>
      {/* Höhe etwas reduziert (60), Hintergrund entfernt */}
      <View
        style={{
          width: sliderWidth,
          height: 60,
          position: "relative",
          backgroundColor: "transparent",
        }}
      >
        <View style={styles.track} />

        <Animated.View
          {...panResponder.panHandlers}
          style={[styles.thumb, { transform: [{ translateX: pan }] }]}
        />

        {/* marginTop auf 30 reduziert (war 45) */}
        <View style={{ width: "100%", height: 20, marginTop: 30 }}>
          {numbers.map((num) => {
            const leftPos = getPositionFromValue(num);
            return (
              <Text
                key={num}
                style={[
                  styles.number,
                  {
                    left: leftPos - numberWidth / 2,
                    width: numberWidth,
                  },
                ]}
              >
                {num}
              </Text>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    alignItems: "center",
    marginTop: 10,
    backgroundColor: "transparent", // Sicherstellen, dass hier kein BG ist
  },
  track: {
    position: "absolute",
    top: 10,
    left: 0,
    right: 0,
    height: 8,
    backgroundColor: "#ffffff",
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  thumb: {
    position: "absolute",
    top: 0,
    left: -14,
    width: 28,
    height: 28,
    backgroundColor: "#000000",
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.5)",
    elevation: 5,
    shadowColor: "transparent",
    zIndex: 10,
  },
  number: {
    position: "absolute",
    fontSize: 12,
    color: "#000",
    textAlign: "center",
  },
});
