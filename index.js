import { httpServer } from "./src/http_server/index.js";
import { startWebSocketServer } from "./src/ws_server/index.ts";

const WS_PORT = process.env.WS_PORT || 3000;
const HTTP_PORT = process.env.HTTP_PORT || 8181;

console.log(`Starting static HTTP server on port ${HTTP_PORT}...`);
httpServer.listen(HTTP_PORT, () => {
  console.log(`HTTP server is running on http://localhost:${HTTP_PORT}`);
});

console.log(`Starting WebSocket server on port ${WS_PORT}...`);
startWebSocketServer(WS_PORT);

process.on("SIGINT", () => {
  console.log("\nShutting down servers...");
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("\nShutting down servers...");
  process.exit(0);
});
