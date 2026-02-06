import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  LayoutChangeEvent,
  PanResponder,
  StyleSheet,
  Text,
  View,
} from "react-native";

type Props = {
  value: number;
  onValueChange: (val: number) => void;
  minimumValue?: number;
  maximumValue?: number;
  step?: number;
  trackColor?: string;
  thumbColor?: string;
};

export default function CustomSlider({
  value,
  onValueChange,
  minimumValue = 0,
  maximumValue = 10,
  step = 1,
  trackColor = "#F2E8DF",
  thumbColor = "#000000",
}: Props) {
  const [sliderWidth, setSliderWidth] = useState(0);
  const widthRef = useRef(0);

  // FIX: Wir speichern value und callback in Refs, damit der PanResponder
  // immer die aktuellen Werte sieht (verhindert Endlosschleifen durch Stale Closures)
  const valueRef = useRef(value);
  const onValueChangeRef = useRef(onValueChange);

  // Bei jedem Render Refs aktualisieren
  valueRef.current = value;
  onValueChangeRef.current = onValueChange;

  const range = maximumValue - minimumValue;
  const showNumbers = range <= 20;

  const getPositionFromValue = (val: number, width: number) => {
    if (range === 0 || width === 0) return 0;
    return ((val - minimumValue) / range) * width;
  };

  const pan = useRef(new Animated.Value(0)).current;
  const startPos = useRef(0);
  const isDragging = useRef(false);

  const onLayout = (event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    setSliderWidth(width);
    widthRef.current = width;
  };

  const fillWidth = pan.interpolate({
    inputRange: [0, sliderWidth || 1],
    outputRange: [0, sliderWidth || 1],
    extrapolate: "clamp",
  });

  // Synchronisiere Pan-Position, wenn Value sich von außen ändert
  useEffect(() => {
    if (!isDragging.current && sliderWidth > 0) {
      const newPos = getPositionFromValue(value, sliderWidth);
      pan.setValue(newPos);
    }
  }, [value, minimumValue, maximumValue, sliderWidth]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,

      onPanResponderGrant: () => {
        isDragging.current = true;
        // @ts-ignore
        startPos.current = pan._value;
        pan.setOffset(startPos.current);
        pan.setValue(0);
      },

      onPanResponderMove: (_, gesture) => {
        const currentWidth = widthRef.current;
        if (currentWidth === 0) return;

        const currentPos = startPos.current + gesture.dx;

        // Clamp Position für visuelles Feedback
        if (currentPos >= 0 && currentPos <= currentWidth) {
          pan.setValue(gesture.dx);
        } else {
          const clamped = Math.max(0, Math.min(currentPos, currentWidth));
          pan.setValue(clamped - startPos.current);
        }

        const clampedPos = Math.max(0, Math.min(currentPos, currentWidth));
        const rawValue = (clampedPos / currentWidth) * range + minimumValue;
        const steppedValue = Math.round(rawValue / step) * step;

        // FIX: Nutze Refs für Vergleich und Callback
        if (steppedValue !== valueRef.current) {
          onValueChangeRef.current(steppedValue);
        }
      },

      onPanResponderRelease: (_, gesture) => {
        isDragging.current = false;
        pan.flattenOffset();

        const currentWidth = widthRef.current;
        // @ts-ignore
        let currentPos = pan._value;
        if (currentPos < 0) currentPos = 0;
        if (currentPos > currentWidth) currentPos = currentWidth;

        const rawValue = (currentPos / currentWidth) * range + minimumValue;
        const steppedValue = Math.round(rawValue / step) * step;
        const clampedValue = Math.min(
          Math.max(steppedValue, minimumValue),
          maximumValue,
        );

        const snappedPos = getPositionFromValue(clampedValue, currentWidth);

        Animated.spring(pan, {
          toValue: snappedPos,
          useNativeDriver: false,
          speed: 20,
          bounciness: 0,
        }).start();

        // FIX: Auch hier Ref nutzen
        if (clampedValue !== valueRef.current) {
          onValueChangeRef.current(clampedValue);
        }
      },
    }),
  ).current;

  // Render Helpers
  const numbers = showNumbers
    ? Array.from({ length: range + 1 }, (_, i) => minimumValue + i)
    : [];

  const activeTrackStyle = [
    styles.fill,
    { width: fillWidth },
    trackColor ? { backgroundColor: trackColor } : {},
  ];

  const thumbStyle = [
    styles.thumb,
    { transform: [{ translateX: pan }] },
    thumbColor
      ? { backgroundColor: thumbColor, borderColor: "white", borderWidth: 2 }
      : {},
  ];

  return (
    <View style={styles.container}>
      <View
        onLayout={onLayout}
        style={{ width: "100%", height: 60, justifyContent: "center" }}
      >
        {sliderWidth > 0 && (
          <View
            style={{ width: sliderWidth, height: "100%", position: "relative" }}
          >
            <View style={[styles.track, { width: sliderWidth }]} />
            <Animated.View style={activeTrackStyle} />
            <Animated.View
              {...panResponder.panHandlers}
              style={thumbStyle}
              hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
            />
            {showNumbers && (
              <View
                style={{
                  width: "100%",
                  height: 20,
                  position: "absolute",
                  top: 30,
                }}
              >
                {numbers.map((num) => {
                  const leftPos = getPositionFromValue(num, sliderWidth);
                  return (
                    <Text
                      key={num}
                      style={[styles.number, { left: leftPos - 20, width: 40 }]}
                    >
                      {num}
                    </Text>
                  );
                })}
              </View>
            )}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
    marginTop: 10,
    backgroundColor: "transparent",
  },
  track: {
    position: "absolute",
    top: 10,
    left: 0,
    height: 8,
    backgroundColor: "#ffffff",
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  fill: {
    position: "absolute",
    top: 10,
    left: 0,
    height: 8,
    backgroundColor: "#F2E8DF",
    borderRadius: 4,
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
