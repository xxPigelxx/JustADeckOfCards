import { Dimensions, Platform, StatusBar } from "react-native";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");

// --- PLATFORM CONSTANTS ---
export const ANDROID_BAR =
  Platform.OS === "android" ? StatusBar.currentHeight || 24 : 0;
export const IOS_BAR = Platform.OS === "ios" ? 47 : 0;
export const WEB_BAR = Platform.OS === "web" ? 20 : 0;
export const SAFE_TOP = ANDROID_BAR + IOS_BAR + WEB_BAR;

// --- CONFIGURATION ---
export const CARD_W = 60;
export const CARD_H = 80;
export const BOARD_PADDING = 10;
export const GAP = 4;
export const TOP_OFFSET = 0;
export const GRID_MARGIN_TOP = 20;
export const VISIBLE_STACK_LIMIT = 3;
export const STACK_OFFSET = 3;
export const HAND_HEIGHT = 150;
export const HAND_CARD_TOP = 30;
export const BOARD_HEIGHT = SCREEN_H - HAND_HEIGHT;
export const FAN_SPREAD = 25;
export const FAN_ANGLE = 5;
export const FAN_CURVE = 3;
export const SLOT_W = CARD_W;
export const SLOT_H = CARD_H;
// --- BOARD (fixed size, larger than the screen; the camera moves over it) ---
export const BOARD_COLS = 20;
export const BOARD_ROWS = 20;
export const TOTAL_SLOTS = BOARD_ROWS * BOARD_COLS;
export const GRID_OFFSET_X = 20;
export const GRID_WIDTH = BOARD_COLS * (SLOT_W + GAP) - GAP;
export const GRID_HEIGHT = BOARD_ROWS * (SLOT_H + GAP) - GAP;
export const BOARD_CONTENT_W = GRID_OFFSET_X * 2 + GRID_WIDTH;
export const BOARD_CONTENT_H = GRID_MARGIN_TOP * 2 + GRID_HEIGHT;

export const SCREEN_DIMS = { width: SCREEN_W, height: SCREEN_H };
