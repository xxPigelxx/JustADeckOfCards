# Just a Deck of Cards – multiplayer server

Node + Socket.IO server that holds the game rooms. The game rules live in
`../shared/game` and are used by both the app and the server.

## Run locally

```bash
cd server
npm install
npm run dev        # http://localhost:3000, restarts on changes
```

`http://localhost:3000/health` answers `ok`. For the app on a phone in the
same Wi‑Fi, create `.env.local` in the project root:

```
EXPO_PUBLIC_SERVER_URL=http://<your PC's IP>:3000
```

and restart Expo with `npx expo start -c`.

## Tests

From the project root: `npm test` (game rules and server).

## Deploy (Render)

The Blueprint `render.yaml` in the project root describes the service
(free plan, region Frankfurt). In Render: **New → Blueprint →** this repo.
Only changes in `server/`, `shared/` or `render.yaml` trigger a redeploy –
a redeploy ends all running games, because rooms are kept in memory.

The free plan sleeps after 15 minutes without traffic; the first request then
takes about a minute. The app sends a wake-up request when it starts.
