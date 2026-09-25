import { GameAction, PlayerView } from "@/shared/game/types";
import {
  Ack,
  cleanPlayerName,
  ClientToServerEvents,
  normalizeRoomCode,
  RoomConfig,
  RoomError,
  RoomInfo,
  ServerToClientEvents,
} from "@/shared/protocol";
import { loadCurrentRoom, saveCurrentRoom } from "@/utils/currentRoom";
import { loadPlayerName, savePlayerName } from "@/utils/playerName";
import { loadPlayerSecret } from "@/utils/playerSecret";
import { useSyncExternalStore } from "react";
import { AppState } from "react-native";
import { io, Socket } from "socket.io-client";

export const SERVER_URL =
  process.env.EXPO_PUBLIC_SERVER_URL ?? "http://localhost:3000";

// Long enough for a sleeping Render server to wake up (~1 min)
const REQUEST_TIMEOUT_MS = 70_000;

export type ClientError = RoomError | "offline";
export type ClientAck<T = object> =
  ({ ok: true } & T) | { ok: false; error: ClientError };

interface RoomSnapshot {
  room: RoomInfo | null;
  view: PlayerView | null;
  connected: boolean;
  // The room we were in no longer exists (everyone left, server restarted)
  lost: boolean;
}

// One connection for the whole app, so the room survives screen changes
let socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;
let snapshot: RoomSnapshot = {
  room: null,
  view: null,
  connected: false,
  lost: false,
};
const listeners = new Set<() => void>();
let savedCode: string | null = null;

const update = (patch: Partial<RoomSnapshot>) => {
  snapshot = { ...snapshot, ...patch };
  listeners.forEach((listener) => listener());
};

// Remembers the room on the device (for resuming after an app restart)
const rememberRoom = (code: string | null) => {
  if (code === savedCode) return;
  savedCode = code;
  saveCurrentRoom(code);
};

const roomGone = () => {
  forgetSavedRoom();
  update({ room: null, view: null, lost: true });
};

const getSocket = () => {
  if (socket) return socket;
  const s: Socket<ServerToClientEvents, ClientToServerEvents> = io(SERVER_URL, {
    transports: ["websocket"],
  });
  s.on("connect", async () => {
    update({ connected: true });
    // After a lost connection the server needs to know who we are again
    if (snapshot.room) {
      const secret = await loadPlayerSecret();
      s.emit("room:join", { secret, code: snapshot.room.code }, (res) => {
        if (!res.ok) roomGone();
      });
    }
  });
  s.on("disconnect", () => update({ connected: false }));
  s.on("room:update", (room) => {
    rememberRoom(room.code);
    update({ room });
  });
  s.on("game:view", ({ view }) => update({ view }));

  // Phones drop the connection in the background: reconnect right away when
  // the app is back instead of waiting for the next retry
  AppState.addEventListener("change", (state) => {
    if (state === "active" && !s.connected) s.connect();
  });

  socket = s;
  return s;
};

const request = async <T extends object>(
  send: (
    s: ReturnType<ReturnType<typeof getSocket>["timeout"]>,
  ) => Promise<Ack<T>>,
): Promise<ClientAck<T>> => {
  try {
    return await send(getSocket().timeout(REQUEST_TIMEOUT_MS));
  } catch {
    return { ok: false, error: "offline" };
  }
};

export const createRoom = async (config: RoomConfig) => {
  update({ room: null, view: null, lost: false });
  const [secret, name] = await Promise.all([
    loadPlayerSecret(),
    loadPlayerName(),
  ]);
  return request<{ code: string }>((s) =>
    s.emitWithAck("room:create", { secret, config, name }),
  );
};

export const joinRoom = async (code: string) => {
  update({ room: null, view: null, lost: false });
  const [secret, name] = await Promise.all([
    loadPlayerSecret(),
    loadPlayerName(),
  ]);
  return request<{ code: string }>((s) =>
    s.emitWithAck("room:join", {
      secret,
      code: normalizeRoomCode(code),
      name,
    }),
  );
};

// Remembers the name and tells the room (only possible in the waiting room)
export const setPlayerName = (value: string) => {
  const name = cleanPlayerName(value);
  savePlayerName(name);
  socket?.emit("room:setName", name);
};

export const startGame = () => request((s) => s.emitWithAck("room:start"));

export const leaveRoom = () => {
  socket?.emit("room:leave");
  forgetSavedRoom();
  update({ room: null, view: null });
};

// --- Resuming after the app was closed or the page reloaded ---

// Code of a room this device was in before, if any
export const getSavedRoom = loadCurrentRoom;

export const forgetSavedRoom = () => {
  savedCode = null;
  saveCurrentRoom(null);
};

// Rejoins the saved room: the server gives this device its seat and hand back
export const resumeRoom = async (): Promise<ClientAck<{ code: string }>> => {
  const code = await loadCurrentRoom();
  if (!code) return { ok: false, error: "not_found" };
  const res = await joinRoom(code);
  if (!res.ok && res.error !== "offline") {
    forgetSavedRoom();
    update({ lost: true });
  }
  return res;
};

export const clearLostRoom = () => update({ lost: false });

export const sendAction = (action: GameAction) =>
  socket?.emit("game:action", action);

// A sleeping server (Render free tier) needs about a minute to start, so the
// app pings it at start while the user is still choosing a game
export const warmUpServer = () => {
  fetch(`${SERVER_URL}/health`).catch(() => {});
};

export const roomErrorMessage = (error: ClientError) => {
  switch (error) {
    case "not_found":
      return "Kein Spiel mit diesem Code gefunden.";
    case "full":
      return "Das Spiel ist bereits voll.";
    case "started":
      return "Das Spiel hat bereits begonnen.";
    case "not_host":
      return "Nur der Host kann das Spiel starten.";
    case "offline":
      return "Server nicht erreichbar. Versuche es später erneut oder spiele offline.";
    default:
      return "Etwas ist schiefgelaufen. Bitte versuche es erneut.";
  }
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

// Current room, game view and connection state; re-renders on changes
export const useRoom = () => useSyncExternalStore(subscribe, () => snapshot);
