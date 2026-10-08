# Just a Deck of Cards 🃏

A virtual deck of cards for your phone. Just a deck you can play any card game with, together with your friends. There are no fixed rules built in: you deal, draw, play and arrange cards on a shared table, the same way you would with a real deck.

Built with React Native / Expo, plus a small Socket.IO server for online multiplayer.

## Features

- **Online multiplayer**: create a room, share the code, and play on a shared table in real time
- **Resume games**: rejoin a running game after the app was closed
- **Offline mode**: play on a single device without a server
- **Drag & drop controls**: hold a card and drag it onto the table or into your hand; tap a card for more options
- **Custom card design**: pick your own card colours, with a live preview
- **Rulebook**: rules for 15+ classic games (Mau Mau, Skat, Rommé, Durak, Poker, Blackjack, …)
- **Fair play**: the server only sends each player what they may see, so other hands and face-down cards stay hidden

## Screenshots

<!-- Add 2–3 screenshots here, e.g. home screen, game table, card design -->

## Tech stack

| Part   | Tech |
|--------|------|
| App    | Expo 54, React Native 0.81, Expo Router, Reanimated, Gesture Handler |
| Server | Node.js, Socket.IO (hosted on Render) |
| Shared | Game rules & network protocol in TypeScript, used by both the app and the server |
| Tests  | Vitest |

## Project structure

```
app/          Screens (file-based routing via Expo Router)
components/   UI components and hooks (game logic, room connection, camera)
shared/       Game rules and network protocol (used by app + server)
server/       Multiplayer server → see server/README.md
data/         Rulebook content
utils/        Helpers (storage, colours, board geometry)
```

## Getting started

### Requirements

- Node.js 20+
- [Expo Go](https://expo.dev/go) on your phone, or an Android emulator / iOS simulator

### Run the app

```bash
npm install
npx expo start
```

Scan the QR code with Expo Go.

### Server

The app connects to the server set in `EXPO_PUBLIC_SERVER_URL` (in `.env`). Without it, it uses `http://localhost:3000`.

To run the server locally:

```bash
cd server
npm install
npm run dev
```

For testing on a phone in the same Wi‑Fi, create `.env.local` in the project root:

```
EXPO_PUBLIC_SERVER_URL=http://<your PC's IP>:3000
```

and restart Expo with `npx expo start -c`. See [server/README.md](server/README.md) for more, including deployment.

## Tests

```bash
npm test
```

Runs the tests for the game rules, the protocol and the server.
## Demo



https://github.com/user-attachments/assets/6ecfe002-840f-4822-8e04-5ba2a1cb98a8


## Screenshots

## About

A university project by [Nikolai](https://github.com/xxPigelxx), [Leon](https://github.com/BahamaMamaL), [Serge](https://github.com/SergeGraefenstein) & Lion.
