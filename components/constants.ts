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
export const BOARD_HEIGHT = SCREEN_H - HAND_HEIGHT;
export const FAN_SPREAD = 25;
export const FAN_ANGLE = 5;
export const FAN_CURVE = 3;
export const SLOT_W = CARD_W;
export const SLOT_H = CARD_H;
export const ACTUAL_BOARD_W = SCREEN_W - BOARD_PADDING * 2;
export const AVAILABLE_HEIGHT =
  BOARD_HEIGHT - SAFE_TOP - TOP_OFFSET - GRID_MARGIN_TOP - BOARD_PADDING;

export const COLS = Math.floor(ACTUAL_BOARD_W / (SLOT_W + GAP));
export const ROWS = Math.floor(AVAILABLE_HEIGHT / (SLOT_H + GAP));
export const TOTAL_SLOTS = ROWS * COLS;
export const GRID_WIDTH = COLS * (SLOT_W + GAP) - GAP;
export const GRID_OFFSET_X = (ACTUAL_BOARD_W - GRID_WIDTH) / 2;

export const SCREEN_DIMS = { width: SCREEN_W, height: SCREEN_H };
