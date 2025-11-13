import { config } from "./config/config.ts";
import { BattleshipServer } from "./server.ts";

export function startWebSocketServer(port?: number): BattleshipServer {
  const serverPort = port || config.wsPort;
  const server = new BattleshipServer(serverPort);
  return server;
}

export { BattleshipServer } from "./server.ts";

export * from "./models/types.ts";
export * from "./models/constants.ts";
