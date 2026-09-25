import { startServer } from "./index";

// Render sets PORT; locally the server runs on 3000
const port = Number(process.env.PORT) || 3000;
startServer(port);
console.log(`Just a Deck of Cards server listening on port ${port}`);
