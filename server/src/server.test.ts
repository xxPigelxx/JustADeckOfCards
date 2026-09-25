import { io as connect, Socket } from "socket.io-client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { GameAction, PlayerView } from "../../shared/game";
import {
  Ack,
  ClientToServerEvents,
  RoomConfig,
  RoomInfo,
  ServerToClientEvents,
} from "../../shared/protocol";
import { startServer } from "./index";

type Client = Socket<ServerToClientEvents, ClientToServerEvents>;

const CONFIG: RoomConfig = {
  deckType: "52 Karten",
  deckCount: 1,
  cardsPerPile: 3,
  maxPlayers: 4,
};

// A test player: remembers the latest room info and game view it received
const player = (url: string) => {
  const socket: Client = connect(url, { transports: ["websocket"] });
  const state = {
    socket,
    room: null as RoomInfo | null,
    view: null as PlayerView | null,
  };
  socket.on("room:update", (room) => (state.room = room));
  socket.on("game:view", ({ view }) => (state.view = view));
  return state;
};

const until = async (check: () => boolean, ms = 2000) => {
  const end = Date.now() + ms;
  while (!check()) {
    if (Date.now() > end) throw new Error("timed out");
    await new Promise((r) => setTimeout(r, 10));
  }
};

const emitAck = <T extends object>(
  send: (ack: (res: Ack<T>) => void) => void,
) => new Promise<Ack<T>>((resolve) => send(resolve));

describe("server", () => {
  let server: ReturnType<typeof startServer>;
  let url: string;
  const clients: Client[] = [];

  beforeEach(() => {
    server = startServer(0);
    url = `http://localhost:${server.port()}`;
  });

  afterEach(async () => {
    clients.splice(0).forEach((c) => c.disconnect());
    await server.close();
  });

  const join = () => {
    const p = player(url);
    clients.push(p.socket);
    return p;
  };

  it("answers the health check", async () => {
    const res = await fetch(`${url}/health`);
    expect(res.status).toBe(200);
    expect(await res.text()).toBe("ok");
  });

  it("lets two players share a table with private hands", async () => {
    const host = join();
    const guest = join();

    const created = await emitAck<{ code: string }>((ack) =>
      host.socket.emit(
        "room:create",
        { secret: "secret-host", config: CONFIG },
        ack,
      ),
    );
    expect(created.ok).toBe(true);
    const code = created.ok ? created.code : "";

    const joined = await emitAck<{ code: string }>((ack) =>
      guest.socket.emit("room:join", { secret: "secret-guest", code }, ack),
    );
    expect(joined.ok).toBe(true);
    await until(() => host.room?.players.length === 2);
    expect(host.room?.you).toBe("p1");
    expect(guest.room?.you).toBe("p2");
    expect(guest.room?.hostId).toBe("p1");

    // Only the host may start
    expect(
      await emitAck((ack) => guest.socket.emit("room:start", ack)),
    ).toEqual({ ok: false, error: "not_host" });
    expect(
      (await emitAck((ack) => host.socket.emit("room:start", ack))).ok,
    ).toBe(true);
    await until(() => !!host.view && !!guest.view);

    // Face-down cards are sent without rank and suit
    expect(host.view!.board.every((c) => c.rank === "" && c.suit === "")).toBe(
      true,
    );

    // Host takes their pile: host sees the cards, guest only the count
    const pile = host.view!.board.find((c) => c.zIndex === 1)!.slot;
    const take: GameAction = { type: "takeStack", slot: pile };
    host.socket.emit("game:action", take);
    await until(() => host.view!.hand.length === 3);
    await until(() => guest.view!.handCounts.p1 === 3);
    expect(host.view!.hand.every((c) => c.rank !== "")).toBe(true);
    expect(guest.view!.hand).toHaveLength(0);
    expect(JSON.stringify(guest.view)).not.toContain(host.view!.hand[0].id);
  });

  it("rejects unknown room codes", async () => {
    const guest = join();
    const res = await emitAck((ack) =>
      guest.socket.emit(
        "room:join",
        { secret: "secret-guest", code: "ZZZZZZ" },
        ack,
      ),
    );
    expect(res).toEqual({ ok: false, error: "not_found" });
  });

  it("gives a player their seat back after reconnecting", async () => {
    const host = join();
    const created = await emitAck<{ code: string }>((ack) =>
      host.socket.emit(
        "room:create",
        { secret: "secret-host", config: CONFIG },
        ack,
      ),
    );
    const code = created.ok ? created.code : "";
    await emitAck((ack) => host.socket.emit("room:start", ack));
    await until(() => !!host.view);

    host.socket.disconnect();
    const again = join();
    const res = await emitAck((ack) =>
      again.socket.emit("room:join", { secret: "secret-host", code }, ack),
    );
    expect(res.ok).toBe(true);
    await until(() => !!again.view && again.room?.you === "p1");
    expect(again.room?.hostId).toBe("p1");
  });
});
