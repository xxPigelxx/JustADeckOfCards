import { createServer } from "node:http";
import { AddressInfo } from "node:net";
import { Server } from "socket.io";
import {
  Ack,
  ClientToServerEvents,
  ServerToClientEvents,
} from "../../shared/protocol";
import { Room, RoomManager } from "./rooms";

const CLEANUP_INTERVAL_MS = 60_000;

// Calls a client's ack callback if it sent one
const reply = <T extends object>(ack: unknown, res: Ack<T>) => {
  if (typeof ack === "function") ack(res);
};

export const startServer = (port: number, rooms = new RoomManager()) => {
  const http = createServer((req, res) => {
    // Health check for Render, also used by the app to wake the server up
    if (req.url === "/health") {
      res.writeHead(200, {
        "Content-Type": "text/plain",
        "Access-Control-Allow-Origin": "*",
      });
      res.end("ok");
      return;
    }
    res.writeHead(404);
    res.end();
  });

  const io = new Server<ClientToServerEvents, ServerToClientEvents>(http, {
    cors: { origin: "*" },
  });

  const sendRoom = (room: Room | null) => {
    if (!room) return;
    rooms
      .roomUpdates(room)
      .forEach(({ socketId, info }) =>
        io.to(socketId).emit("room:update", info),
      );
  };

  const sendViews = (room: Room | null) => {
    if (!room) return;
    rooms
      .gameViews(room)
      .forEach(({ socketId, view, version }) =>
        io.to(socketId).emit("game:view", { view, version }),
      );
  };

  io.on("connection", (socket) => {
    socket.on("room:create", (data, ack) => {
      const res = rooms.create(
        data?.secret,
        data?.config,
        socket.id,
        data?.name,
      );
      if (!res.ok) return reply(ack, res);
      reply(ack, { ok: true, code: res.room.code });
      sendRoom(res.room);
    });

    socket.on("room:join", (data, ack) => {
      const res = rooms.join(data?.code, data?.secret, socket.id, data?.name);
      if (!res.ok) return reply(ack, res);
      reply(ack, { ok: true, code: res.room.code });
      sendRoom(res.room);
      sendViews(res.room);
    });

    socket.on("room:setName", (name) =>
      sendRoom(rooms.setName(socket.id, name)),
    );

    socket.on("room:start", (ack) => {
      const res = rooms.start(socket.id);
      if (!res.ok) return reply(ack, res);
      reply(ack, { ok: true });
      sendRoom(res.room);
      sendViews(res.room);
    });

    socket.on("game:action", (action) => {
      const res = rooms.act(socket.id, action);
      if (!res) return;
      if (res.changed) {
        sendViews(res.room);
      } else {
        // Rejected: correct the sender's local prediction
        const view = rooms.viewFor(res.room, res.player);
        if (view) socket.emit("game:view", { view, version: res.room.version });
      }
    });

    socket.on("room:leave", () => sendRoom(rooms.leave(socket.id)));

    socket.on("disconnect", () => sendRoom(rooms.disconnect(socket.id)));
  });

  const cleanup = setInterval(
    () => rooms.cleanup().forEach(sendRoom),
    CLEANUP_INTERVAL_MS,
  );
  cleanup.unref();

  http.listen(port);

  return {
    io,
    rooms,
    port: () => (http.address() as AddressInfo).port,
    close: () =>
      new Promise<void>((resolve) => {
        clearInterval(cleanup);
        io.close(() => resolve());
      }),
  };
};
