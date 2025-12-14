import React from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';

export const MatrixContext = React.createContext<any>(null);

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

type BoardProps = {
    children: React.ReactNode;
    boardWidth: number;
    boardHeight: number;
};

export default function ZoomableBoard({ children, boardWidth, boardHeight }: BoardProps) {
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedX = useSharedValue(0);
  const savedY = useSharedValue(0);

  const INITIAL_LEFT = (SCREEN_W - boardWidth) / 2;
  const INITIAL_TOP = (SCREEN_H - boardHeight) / 2;

  const panGesture = Gesture.Pan()
    .averageTouches(true)
    .onUpdate((e) => {
      translateX.value = savedX.value + e.translationX;
      translateY.value = savedY.value + e.translationY;
    })
    .onEnd(() => {
      savedX.value = translateX.value;
      savedY.value = translateY.value;
    });

  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = Math.max(0.6, Math.min(savedScale.value * e.scale, 2.5));
    })
    .onEnd(() => {
      savedScale.value = scale.value;
    });

  const composedGesture = Gesture.Simultaneous(panGesture, pinchGesture);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  return (
    <MatrixContext.Provider value={{ scale }}>
      <View style={styles.viewport}>
        <GestureDetector gesture={composedGesture}>
          <Animated.View style={[
              styles.boardBase, 
              { 
                  width: boardWidth, 
                  height: boardHeight,
                  left: INITIAL_LEFT,
                  top: INITIAL_TOP,
              }, 
              animatedStyle
          ]}>
             <View style={styles.gridLines} />
             {children}
          </Animated.View>
        </GestureDetector>
      </View>
    </MatrixContext.Provider>
  );
}

const styles = StyleSheet.create({
  viewport: {
    flex: 1,
    overflow: 'hidden',
  },
  boardBase: {
    position: 'absolute',
    backgroundColor: '#1a1a1a',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#333',
  },
  gridLines: {
     ...StyleSheet.absoluteFillObject,
     borderWidth: 1,
     borderColor: '#333',
     borderStyle: 'dashed',
     opacity: 0.2,
  }
});
