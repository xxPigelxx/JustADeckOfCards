import * as C from "@/components/constants";
import { Point, setCameraSource } from "@/utils/boardGeometry";
import { useEffect, useRef } from "react";
import { Platform } from "react-native";
import { Gesture } from "react-native-gesture-handler";
import {
  runOnJS,
  runOnUI,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

export const START_ZOOM = 1;
export const MAX_ZOOM = 2;

// Board position on one axis: centered if it is smaller than the viewport,
// otherwise its edges may not move inside the viewport
const clampAxis = (
  pos: number,
  viewSize: number,
  contentSize: number,
  zoom: number,
) => {
  "worklet";
  const size = contentSize * zoom;
  if (size <= viewSize) return (viewSize - size) / 2;
  return Math.min(0, Math.max(viewSize - size, pos));
};

// Camera for the board: x/y move the board content, zoom scales it
// (around its top-left corner). Fingers pan, two fingers pinch-zoom.
// startFocus is the board point shown in the center at the start,
// onMove is called whenever the user starts moving or zooming the board.
export const useCamera = (startFocus: Point, onMove?: () => void) => {
  const x = useSharedValue(0);
  const y = useSharedValue(0);
  const zoom = useSharedValue(START_ZOOM);

  // Smallest zoom shows the whole board, set once the viewport is measured
  const minZoom = useSharedValue(START_ZOOM);
  const viewW = useSharedValue(0);
  const viewH = useSharedValue(0);
  const initialized = useRef(false);

  const lastScale = useSharedValue(1);
  const lastPanX = useSharedValue(0);
  const lastPanY = useSharedValue(0);

  useEffect(() => {
    setCameraSource(() => ({ x: x.value, y: y.value, zoom: zoom.value }));
  }, [x, y, zoom]);

  const clampZoom = (value: number) => {
    "worklet";
    return Math.min(MAX_ZOOM, Math.max(minZoom.value, value));
  };

  const clampPosition = () => {
    "worklet";
    x.value = clampAxis(x.value, viewW.value, C.BOARD_CONTENT_W, zoom.value);
    y.value = clampAxis(y.value, viewH.value, C.BOARD_CONTENT_H, zoom.value);
  };

  // Zoom by factor while the point (fx, fy) stays in place on screen
  const zoomAround = (factor: number, fx: number, fy: number) => {
    "worklet";
    const next = clampZoom(zoom.value * factor);
    const k = next / zoom.value;
    x.value = fx - (fx - x.value) * k;
    y.value = fy - (fy - y.value) * k;
    zoom.value = next;
    clampPosition();
  };

  // Web zooms with the +/- buttons (a mouse cannot pinch)
  const pinch = Gesture.Pinch()
    .enabled(Platform.OS !== "web")
    .onStart(() => {
      lastScale.value = 1;
      if (onMove) runOnJS(onMove)();
    })
    .onUpdate((event) => {
      zoomAround(event.scale / lastScale.value, event.focalX, event.focalY);
      lastScale.value = event.scale;
    });

  // One or two fingers (or the mouse). Cards block this gesture (see Card
  // blocksGesture), so it only moves the board when it starts on an empty spot.
  // The larger start distance lets a card's drag win on the web as well,
  // where the blocking is not reliable.
  const pan = Gesture.Pan()
    .minDistance(10)
    .onStart(() => {
      lastPanX.value = 0;
      lastPanY.value = 0;
      if (onMove) runOnJS(onMove)();
    })
    .onUpdate((event) => {
      x.value += event.translationX - lastPanX.value;
      y.value += event.translationY - lastPanY.value;
      lastPanX.value = event.translationX;
      lastPanY.value = event.translationY;
      clampPosition();
    });

  const gesture = Gesture.Simultaneous(pinch, pan);

  // Animated move to a camera position (kept inside the bounds)
  const animateTo = (next: number, nextX: number, nextY: number) => {
    "worklet";
    x.value = withTiming(
      clampAxis(nextX, viewW.value, C.BOARD_CONTENT_W, next),
    );
    y.value = withTiming(
      clampAxis(nextY, viewH.value, C.BOARD_CONTENT_H, next),
    );
    zoom.value = withTiming(next);
  };

  // Zoom buttons (web): zoom around the viewport center
  const zoomAroundCenter = (factor: number) => {
    "worklet";
    const fx = viewW.value / 2;
    const fy = viewH.value / 2;
    const next = clampZoom(zoom.value * factor);
    const k = next / zoom.value;
    animateTo(next, fx - (fx - x.value) * k, fy - (fy - y.value) * k);
  };

  // Back to the start view: startFocus centered at START_ZOOM
  const centerOnStart = () => {
    "worklet";
    animateTo(
      START_ZOOM,
      viewW.value / 2 - startFocus.x * START_ZOOM,
      viewH.value / 2 - startFocus.y * START_ZOOM,
    );
  };

  const zoomBy = (factor: number) => {
    onMove?.();
    runOnUI(zoomAroundCenter)(factor);
  };

  const resetView = () => {
    onMove?.();
    runOnUI(centerOnStart)();
  };

  // Runs on the UI thread: writes to shared values from JS arrive there
  // asynchronously, so reading them back on JS (for clamping) would see
  // old values and undo the start position
  const applyViewport = (width: number, height: number, center: boolean) => {
    "worklet";
    viewW.value = width;
    viewH.value = height;
    minZoom.value = Math.min(
      START_ZOOM,
      width / C.BOARD_CONTENT_W,
      height / C.BOARD_CONTENT_H,
    );
    if (center) {
      zoom.value = START_ZOOM;
      x.value = width / 2 - startFocus.x * START_ZOOM;
      y.value = height / 2 - startFocus.y * START_ZOOM;
    }
    clampPosition();
  };

  const setViewportSize = (width: number, height: number) => {
    // Center on startFocus at the first real layout (may be 0 at first)
    const center = !initialized.current && width > 0 && height > 0;
    if (center) initialized.current = true;
    runOnUI(applyViewport)(width, height, center);
  };

  return {
    x,
    y,
    zoom,
    gesture,
    panGesture: pan,
    zoomBy,
    resetView,
    setViewportSize,
  };
};

export type CameraControls = ReturnType<typeof useCamera>;
