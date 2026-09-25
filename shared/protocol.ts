import { GameAction, PlayerId, PlayerView } from "./game/types";

// Messages between app and server (Socket.IO).
//
// Every device has a secret id (stored on the device) that lets it rejoin
// its seat. Other players only ever see the public id ("p1", "p2", ...),
// which is also the key of the player's hand in the game state.

export const MAX_PLAYERS = 8;

export interface RoomConfig {
  deckType: string;
  deckCount: number;
  cardsPerPile: number;
  maxPlayers: number;
}

export type RoomStatus = "lobby" | "playing";

export interface RoomPlayer {
  id: PlayerId; // public id
  seat: number; // 1-based, shown as "Spieler n"
  connected: boolean;
}

export interface RoomInfo {
  code: string;
  status: RoomStatus;
  config: RoomConfig;
  players: RoomPlayer[];
  hostId: PlayerId;
  you: PlayerId; // public id of the receiving player
}

export type RoomError =
  "invalid" | "not_found" | "full" | "started" | "not_host" | "not_in_room";

export type Ack<T = object> =
  ({ ok: true } & T) | { ok: false; error: RoomError };

export interface ClientToServerEvents {
  "room:create": (
    data: { secret: string; config: RoomConfig },
    ack: (res: Ack<{ code: string }>) => void,
  ) => void;
  "room:join": (
    data: { secret: string; code: string },
    ack: (res: Ack<{ code: string }>) => void,
  ) => void;
  "room:start": (ack: (res: Ack) => void) => void;
  "room:leave": () => void;
  "game:action": (action: GameAction) => void;
}

export interface ServerToClientEvents {
  "room:update": (room: RoomInfo) => void;
  "game:view": (data: { view: PlayerView; version: number }) => void;
}

// Room codes: 6 characters without look-alikes (no 0/O, 1/I/L)
export const ROOM_CODE_CHARS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
export const ROOM_CODE_LENGTH = 6;

export const normalizeRoomCode = (code: string) =>
  code.replace(/\s/g, "").toUpperCase();
