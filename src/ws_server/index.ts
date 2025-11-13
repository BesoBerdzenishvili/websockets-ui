import { BattleshipServer } from "./server";
import { config } from "./config/config";

export function startWebSocketServer(port?: number): BattleshipServer {
  const serverPort = port || config.wsPort;
  const server = new BattleshipServer(serverPort);
  return server;
}

export { BattleshipServer } from "./server";

export * from "./models/types";
export * from "./models/constants";
