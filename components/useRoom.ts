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
import { loadPlayerName, savePlayerName } from "@/utils/playerName";
import { loadPlayerSecret } from "@/utils/playerSecret";
import { useSyncExternalStore } from "react";
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
}

// One connection for the whole app, so the room survives screen changes
let socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;
let snapshot: RoomSnapshot = { room: null, view: null, connected: false };
const listeners = new Set<() => void>();

const update = (patch: Partial<RoomSnapshot>) => {
  snapshot = { ...snapshot, ...patch };
  listeners.forEach((listener) => listener());
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
        if (!res.ok) update({ room: null, view: null });
      });
    }
  });
  s.on("disconnect", () => update({ connected: false }));
  s.on("room:update", (room) => update({ room }));
  s.on("game:view", ({ view }) => update({ view }));
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
  update({ room: null, view: null });
  const [secret, name] = await Promise.all([
    loadPlayerSecret(),
    loadPlayerName(),
  ]);
  return request<{ code: string }>((s) =>
    s.emitWithAck("room:create", { secret, config, name }),
  );
};

export const joinRoom = async (code: string) => {
  update({ room: null, view: null });
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
  update({ room: null, view: null });
};

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
