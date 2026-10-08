import {
  applyAction,
  createGame,
  GameState,
  getPlayerView,
  isGameAction,
  PlayerView,
} from "../../shared/game";
import {
  cleanPlayerName,
  MAX_PLAYERS,
  normalizeRoomCode,
  ROOM_CODE_CHARS,
  ROOM_CODE_LENGTH,
  RoomConfig,
  RoomError,
  RoomInfo,
  RoomStatus,
} from "../../shared/protocol";

// A disconnected player keeps a lobby seat this long
export const LOBBY_SEAT_TIMEOUT_MS = 5 * 60_000;
// A room nobody is connected to is deleted after this long
export const EMPTY_ROOM_TIMEOUT_MS = 10 * 60_000;
// Upper limit for rooms in memory, so mass room creation cannot crash the server
export const MAX_ROOMS = 500;

interface Player {
  secret: string;
  id: string; // public id, key of the hand in the game state
  name: string | null;
  socketId: string | null;
  disconnectedAt: number | null;
}

export interface Room {
  code: string;
  status: RoomStatus;
  config: RoomConfig;
  players: Player[];
  hostId: string;
  game: GameState | null;
  version: number;
  nextPlayerNumber: number;
  emptySince: number | null;
}

type Result<T = object> = ({ ok: true } & T) | { ok: false; error: RoomError };

const isSecret = (value: unknown): value is string =>
  typeof value === "string" && value.length >= 8 && value.length <= 64;

const isCount = (value: unknown, min: number, max: number) =>
  Number.isInteger(value) &&
  (value as number) >= min &&
  (value as number) <= max;

export const isRoomConfig = (value: unknown): value is RoomConfig => {
  if (typeof value !== "object" || value === null) return false;
  const c = value as Record<string, unknown>;
  return (
    typeof c.deckType === "string" &&
    c.deckType.length <= 32 &&
    isCount(c.deckCount, 1, 4) &&
    isCount(c.cardsPerPile, 0, 20) &&
    isCount(c.maxPlayers, 1, MAX_PLAYERS)
  );
};

// All rooms in memory. Knows nothing about sockets except their ids, so the
// server (index.ts) decides whom to send what.
export class RoomManager {
  private rooms = new Map<string, Room>();
  private bySocket = new Map<string, { code: string; secret: string }>();

  constructor(
    private random: () => number = Math.random,
    private now: () => number = Date.now,
    private maxRooms = MAX_ROOMS,
  ) {}

  get roomCount() {
    return this.rooms.size;
  }

  getRoom(code: string) {
    return this.rooms.get(normalizeRoomCode(code));
  }

  create(
    secret: unknown,
    config: unknown,
    socketId: string,
    name?: unknown,
  ): Result<{ room: Room }> {
    if (!isSecret(secret) || !isRoomConfig(config)) {
      return { ok: false, error: "invalid" };
    }
    this.leave(socketId);
    if (this.rooms.size >= this.maxRooms) return { ok: false, error: "busy" };

    const room: Room = {
      code: this.newCode(),
      status: "lobby",
      config,
      players: [],
      hostId: "",
      game: null,
      version: 0,
      nextPlayerNumber: 1,
      emptySince: null,
    };
    this.rooms.set(room.code, room);
    room.hostId = this.addPlayer(room, secret, socketId, name).id;
    return { ok: true, room };
  }

  // `name` is optional; a device that rejoins keeps its name unless it sends
  // a new one while the room is still in the lobby
  join(
    code: unknown,
    secret: unknown,
    socketId: string,
    name?: unknown,
  ): Result<{ room: Room }> {
    if (typeof code !== "string" || !isSecret(secret)) {
      return { ok: false, error: "invalid" };
    }
    const room = this.getRoom(code);
    if (!room) return { ok: false, error: "not_found" };

    // Known device: take the seat back (also during a game)
    const known = room.players.find((p) => p.secret === secret);
    if (known) {
      if (known.socketId !== socketId) this.leave(socketId);
      if (known.socketId) this.bySocket.delete(known.socketId);
      known.socketId = socketId;
      known.disconnectedAt = null;
      if (room.status === "lobby" && name !== undefined) {
        known.name = cleanPlayerName(name);
      }
      room.emptySince = null;
      this.bySocket.set(socketId, { code: room.code, secret });
      this.ensureHost(room);
      return { ok: true, room };
    }

    if (room.status !== "lobby") return { ok: false, error: "started" };
    if (room.players.length >= room.config.maxPlayers) {
      return { ok: false, error: "full" };
    }
    this.leave(socketId);
    this.addPlayer(room, secret, socketId, name);
    return { ok: true, room };
  }

  // Names can only be changed in the waiting room
  setName(socketId: string, name: unknown): Room | null {
    const ctx = this.context(socketId);
    if (!ctx || ctx.room.status !== "lobby") return null;
    ctx.player.name = cleanPlayerName(name);
    return ctx.room;
  }

  // Host deals the cards: one pile per player who has joined
  start(socketId: string): Result<{ room: Room }> {
    const ctx = this.context(socketId);
    if (!ctx) return { ok: false, error: "not_in_room" };
    const { room, player } = ctx;
    if (player.id !== room.hostId) return { ok: false, error: "not_host" };
    if (room.status !== "lobby") return { ok: false, error: "started" };

    room.game = createGame(
      {
        deckType: room.config.deckType,
        deckCount: room.config.deckCount,
        pileCount: room.players.length,
        cardsPerPile: room.config.cardsPerPile,
      },
      room.players.map((p) => p.id),
      this.random,
    );
    room.status = "playing";
    room.version++;
    return { ok: true, room };
  }

  // Applies a player's action. `changed` is false for invalid actions; the
  // sender should then get the current view to undo its local prediction.
  act(socketId: string, action: unknown) {
    const ctx = this.context(socketId);
    if (!ctx || !ctx.room.game) return null;
    const { room, player } = ctx;
    const game = room.game!;
    const next = isGameAction(action)
      ? applyAction(game, player.id, action, this.random)
      : game;
    const changed = next !== game;
    if (changed) {
      room.game = next;
      room.version++;
    }
    return { room, player, changed };
  }

  // Player leaves on purpose: gone from the lobby, seat and hand stay in a game
  leave(socketId: string): Room | null {
    const ctx = this.context(socketId);
    if (!ctx) return null;
    const { room, player } = ctx;
    this.bySocket.delete(socketId);
    if (room.status === "lobby") {
      room.players = room.players.filter((p) => p !== player);
    } else {
      player.socketId = null;
      player.disconnectedAt = this.now();
    }
    return this.afterPlayerLeft(room);
  }

  // Connection lost: the player keeps the seat for a while
  disconnect(socketId: string): Room | null {
    const ctx = this.context(socketId);
    if (!ctx) return null;
    this.bySocket.delete(socketId);
    ctx.player.socketId = null;
    ctx.player.disconnectedAt = this.now();
    return this.afterPlayerLeft(ctx.room);
  }

  // Removes expired lobby seats and abandoned rooms; returns changed rooms
  cleanup(): Room[] {
    const now = this.now();
    const changed: Room[] = [];
    for (const room of [...this.rooms.values()]) {
      if (room.status === "lobby") {
        const before = room.players.length;
        room.players = room.players.filter(
          (p) =>
            p.socketId !== null ||
            now - (p.disconnectedAt ?? now) < LOBBY_SEAT_TIMEOUT_MS,
        );
        if (room.players.length !== before) {
          this.ensureHost(room);
          changed.push(room);
        }
      }
      const expired =
        room.emptySince !== null &&
        now - room.emptySince >= EMPTY_ROOM_TIMEOUT_MS;
      if (room.players.length === 0 || expired) this.rooms.delete(room.code);
    }
    return changed.filter((r) => this.rooms.has(r.code));
  }

  // --- What each player receives ---

  infoFor(room: Room, player: Player): RoomInfo {
    return {
      code: room.code,
      status: room.status,
      config: room.config,
      hostId: room.hostId,
      you: player.id,
      players: room.players.map((p, i) => ({
        id: p.id,
        seat: i + 1,
        name: p.name,
        connected: p.socketId !== null,
      })),
    };
  }

  // Room info for every connected player
  roomUpdates(room: Room) {
    return this.connected(room).map((p) => ({
      socketId: p.socketId!,
      info: this.infoFor(room, p),
    }));
  }

  viewFor(room: Room, player: Player): PlayerView | null {
    return room.game ? getPlayerView(room.game, player.id) : null;
  }

  // Game view for every connected player (each sees only what they may)
  gameViews(room: Room) {
    if (!room.game) return [];
    return this.connected(room).map((p) => ({
      socketId: p.socketId!,
      view: getPlayerView(room.game!, p.id),
      version: room.version,
    }));
  }

  // --- Helpers ---

  private context(socketId: string) {
    const entry = this.bySocket.get(socketId);
    if (!entry) return null;
    const room = this.rooms.get(entry.code);
    const player = room?.players.find((p) => p.secret === entry.secret);
    if (!room || !player) {
      this.bySocket.delete(socketId);
      return null;
    }
    return { room, player };
  }

  private connected(room: Room) {
    return room.players.filter((p) => p.socketId !== null);
  }

  private addPlayer(
    room: Room,
    secret: string,
    socketId: string,
    name?: unknown,
  ) {
    const player: Player = {
      secret,
      id: `p${room.nextPlayerNumber++}`,
      name: cleanPlayerName(name),
      socketId,
      disconnectedAt: null,
    };
    room.players.push(player);
    room.emptySince = null;
    this.bySocket.set(socketId, { code: room.code, secret });
    return player;
  }

  private afterPlayerLeft(room: Room): Room | null {
    if (room.players.length === 0) {
      this.rooms.delete(room.code);
      return null;
    }
    this.ensureHost(room);
    if (this.connected(room).length === 0) room.emptySince = this.now();
    return room;
  }

  // The host must be connected; otherwise the next connected player takes over
  private ensureHost(room: Room) {
    const host = room.players.find((p) => p.id === room.hostId);
    if (host?.socketId) return;
    const next = this.connected(room)[0] ?? (host ? null : room.players[0]);
    if (next) room.hostId = next.id;
  }

  private newCode() {
    let code: string;
    do {
      code = "";
      for (let i = 0; i < ROOM_CODE_LENGTH; i++) {
        code +=
          ROOM_CODE_CHARS[Math.floor(this.random() * ROOM_CODE_CHARS.length)];
      }
    } while (this.rooms.has(code));
    return code;
  }
}
