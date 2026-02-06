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
};

export default function CustomSlider({
  value,
  onValueChange,
  minimumValue = 0,
  maximumValue = 10,
  step = 1,
}: Props) {
  // 1. State für die dynamische Breite des Containers
  const [sliderWidth, setSliderWidth] = useState(0);

  // 2. Ref für die Breite, damit der PanResponder immer den aktuellen Wert hat (ohne Re-Render-Probleme)
  const widthRef = useRef(0);

  const range = maximumValue - minimumValue;
  const numberWidth = 40;

  // Hilfsfunktion: Position basierend auf aktueller Breite berechnen
  const getPositionFromValue = (val: number, width: number) => {
    if (range === 0 || width === 0) return 0;
    return ((val - minimumValue) / range) * width;
  };

  const pan = useRef(new Animated.Value(0)).current;
  const startPos = useRef(0);
  const isDragging = useRef(false);

  // Layout-Handler: Wird gefeuert, sobald React Native die Größe berechnet hat
  const onLayout = (event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    // Wir ziehen ein kleines Padding ab, falls nötig, oder nehmen die volle Breite
    const usableWidth = width;

    setSliderWidth(usableWidth);
    widthRef.current = usableWidth;
  };

  // 3. Füll-Leiste: InputRange muss dynamisch sein. Da interpolate keine dynamischen Werte mag,
  // tricksen wir etwas: Wir nutzen 0 bis 1 (Prozent) oder aktualisieren es nur, wenn width da ist.
  // Einfacher: Wir verzichten auf Interpolation für Width und nutzen Flex oder Prozent,
  // ODER wir setzen die width einfach direkt im Style, da pan ein absoluter Wert ist.
  // Hier behalten wir die Logik bei, aber schützen gegen 0.
  const fillWidth = pan.interpolate({
    inputRange: [0, sliderWidth || 1], // Schutz vor 0
    outputRange: [0, sliderWidth || 1],
    extrapolate: "clamp",
  });

  // 4. Update der Position, wenn sich Value ODER Breite ändert (z.B. Rotation)
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
        // WICHTIG: Hier widthRef.current nutzen statt state
        const currentWidth = widthRef.current;
        if (currentWidth === 0) return;

        const currentPos = startPos.current + gesture.dx;

        // Begrenzung der Bewegung
        if (currentPos >= 0 && currentPos <= currentWidth) {
          pan.setValue(gesture.dx);
        }

        // Berechnung des Werts basierend auf Position
        const rawValue =
          (Math.max(0, Math.min(currentPos, currentWidth)) / currentWidth) *
            range +
          minimumValue;

        const steppedValue = Math.round(rawValue / step) * step;

        if (steppedValue !== value) {
          onValueChange(steppedValue);
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

        // Snap Animation zur nächsten Step-Position
        const snappedPos = getPositionFromValue(clampedValue, currentWidth);

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
    <View style={styles.container}>
      {/* Dieser View bestimmt die Breite. onLayout misst sie. */}
      <View
        onLayout={onLayout}
        style={{ width: "100%", height: 60, justifyContent: "center" }}
      >
        {/* Erst rendern, wenn wir eine Breite haben, sonst springt die UI */}
        {sliderWidth > 0 && (
          <View
            style={{ width: sliderWidth, height: "100%", position: "relative" }}
          >
            {/* Hintergrund-Track */}
            <View style={[styles.track, { width: sliderWidth }]} />

            {/* Füll-Leiste */}
            <Animated.View style={[styles.fill, { width: fillWidth }]} />

            {/* Thumb (Knopf) */}
            {/* Thumb (Knopf) */}
            <Animated.View
              {...panResponder.panHandlers}
              style={[styles.thumb, { transform: [{ translateX: pan }] }]}
              // NEU: Touch-Fläche um 20px in alle Richtungen vergrößern
              hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
            />

            {/* Zahlen */}
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
                    style={[
                      styles.number,
                      {
                        // Wir zentrieren die Zahl exakt unter dem Punkt
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
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%", // Nimmt jetzt 100% des Eltern-Elements ein
    alignItems: "center",
    marginTop: 10,
    backgroundColor: "transparent",
    paddingHorizontal: 20, // Optional: Abstand zum Rand des Screens
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
    left: -14, // Hälfte der Breite (28/2), damit der Thumb zentriert auf dem Wert sitzt
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
