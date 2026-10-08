import { describe, expect, it } from "vitest";
import { RoomConfig } from "../../shared/protocol";
import {
  EMPTY_ROOM_TIMEOUT_MS,
  LOBBY_SEAT_TIMEOUT_MS,
  RoomManager,
} from "./rooms";

const CONFIG: RoomConfig = {
  deckType: "52 Karten",
  deckCount: 1,
  cardsPerPile: 3,
  maxPlayers: 3,
};

const setup = () => {
  let time = 0;
  const rooms = new RoomManager(Math.random, () => time);
  const advance = (ms: number) => (time += ms);
  const created = rooms.create("secret-host", CONFIG, "s-host");
  if (!created.ok) throw new Error("create failed");
  return { rooms, room: created.room, advance };
};

describe("RoomManager", () => {
  it("creates a room with a readable code and the creator as host", () => {
    const { room } = setup();
    expect(room.code).toMatch(/^[A-HJ-NP-Z2-9]{6}$/);
    expect(room.players).toHaveLength(1);
    expect(room.hostId).toBe(room.players[0].id);
  });

  it("rejects invalid input", () => {
    const rooms = new RoomManager();
    expect(rooms.create("short", CONFIG, "s1")).toEqual({
      ok: false,
      error: "invalid",
    });
    expect(
      rooms.create("secret-12345", { ...CONFIG, maxPlayers: 99 }, "s1"),
    ).toEqual({ ok: false, error: "invalid" });
    expect(rooms.join("ABCDEF", "secret-12345", "s1")).toEqual({
      ok: false,
      error: "not_found",
    });
  });

  it("refuses new rooms once the room limit is reached", () => {
    const rooms = new RoomManager(Math.random, Date.now, 2);
    expect(rooms.create("secret-aaaa", CONFIG, "s1").ok).toBe(true);
    expect(rooms.create("secret-bbbb", CONFIG, "s2").ok).toBe(true);
    expect(rooms.create("secret-cccc", CONFIG, "s3")).toEqual({
      ok: false,
      error: "busy",
    });
    // Creating again from the same socket replaces its own room
    expect(rooms.create("secret-aaaa", CONFIG, "s1").ok).toBe(true);
    expect(rooms.roomCount).toBe(2);
  });

  it("lets players join with the code (any case) until the room is full", () => {
    const { rooms, room } = setup();
    expect(rooms.join(room.code.toLowerCase(), "secret-p2", "s2").ok).toBe(
      true,
    );
    expect(rooms.join(room.code, "secret-p3", "s3").ok).toBe(true);
    expect(rooms.join(room.code, "secret-p4", "s4")).toEqual({
      ok: false,
      error: "full",
    });
    expect(room.players.map((p) => p.id)).toEqual(["p1", "p2", "p3"]);
  });

  it("only lets the host start, and deals one pile per player", () => {
    const { rooms, room } = setup();
    rooms.join(room.code, "secret-p2", "s2");
    expect(rooms.start("s2")).toEqual({ ok: false, error: "not_host" });
    expect(rooms.start("s-host").ok).toBe(true);
    expect(room.status).toBe("playing");
    expect(Object.keys(room.game!.hands)).toEqual(["p1", "p2"]);
    expect(room.game!.board).toHaveLength(52);
    expect(rooms.join(room.code, "secret-late", "s9")).toEqual({
      ok: false,
      error: "started",
    });
  });

  it("applies valid actions and reports invalid ones", () => {
    const { rooms, room } = setup();
    rooms.start("s-host");
    const card = room.game!.board[0];
    const moved = rooms.act("s-host", {
      type: "moveToHand",
      cardId: card.id,
      index: 0,
    });
    expect(moved?.changed).toBe(true);
    expect(room.version).toBe(2);
    expect(rooms.act("s-host", { type: "hack" })?.changed).toBe(false);
    expect(rooms.act("s-host", { type: "flipSlot", slot: 9999 })?.changed).toBe(
      false,
    );
    expect(room.version).toBe(2);
  });

  it("gives a reconnecting device its seat and hand back", () => {
    const { rooms, room } = setup();
    rooms.join(room.code, "secret-p2", "s2");
    rooms.start("s-host");
    const card = room.game!.board[0];
    rooms.act("s2", { type: "moveToHand", cardId: card.id, index: 0 });

    rooms.disconnect("s2");
    expect(rooms.join(room.code, "secret-p2", "s2-new").ok).toBe(true);
    const view = rooms.viewFor(room, room.players[1])!;
    expect(view.hand.map((c) => c.id)).toEqual([card.id]);
  });

  it("passes the host role on when the host disconnects", () => {
    const { rooms, room } = setup();
    rooms.join(room.code, "secret-p2", "s2");
    rooms.disconnect("s-host");
    expect(room.hostId).toBe("p2");
    rooms.join(room.code, "secret-host", "s-host-2");
    expect(room.hostId).toBe("p2");
  });

  it("stores player names and lets them change only in the lobby", () => {
    const { rooms, room } = setup();
    rooms.join(room.code, "secret-p2", "s2", "  Max ");
    const info = rooms.infoFor(room, room.players[1]);
    expect(info.players.map((p) => p.name)).toEqual([null, "Max"]);

    rooms.setName("s-host", "Anna");
    expect(room.players[0].name).toBe("Anna");
    rooms.setName("s2", "   ");
    expect(room.players[1].name).toBeNull();

    rooms.start("s-host");
    expect(rooms.setName("s-host", "Nope")).toBeNull();
    expect(room.players[0].name).toBe("Anna");

    // Rejoining during the game keeps the name
    rooms.disconnect("s-host");
    rooms.join(room.code, "secret-host", "s-host-2", "Other");
    expect(room.players[0].name).toBe("Anna");
  });

  it("removes a player who leaves the lobby", () => {
    const { rooms, room } = setup();
    rooms.join(room.code, "secret-p2", "s2");
    rooms.leave("s2");
    expect(room.players.map((p) => p.id)).toEqual(["p1"]);
    rooms.leave("s-host");
    expect(rooms.roomCount).toBe(0);
  });

  it("frees lobby seats and deletes abandoned rooms after a while", () => {
    const { rooms, room, advance } = setup();
    rooms.join(room.code, "secret-p2", "s2");
    rooms.disconnect("s2");
    advance(LOBBY_SEAT_TIMEOUT_MS);
    rooms.cleanup();
    expect(room.players.map((p) => p.id)).toEqual(["p1"]);

    rooms.start("s-host");
    rooms.disconnect("s-host");
    advance(EMPTY_ROOM_TIMEOUT_MS - 1);
    rooms.cleanup();
    expect(rooms.roomCount).toBe(1);
    advance(1);
    rooms.cleanup();
    expect(rooms.roomCount).toBe(0);
  });
});
