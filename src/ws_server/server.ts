import { config } from "./config/config";
import { Database } from "./database/index";
import WebSocket, { WebSocketServer } from "ws";
import { handleMessage } from "./handlers/index";

export class BattleshipServer {
  private wss: WebSocketServer;
  private db: Database;
  private port: number;

  constructor(port: number = config.wsPort) {
    this.port = port;
    this.db = new Database();
    this.wss = new WebSocketServer({ port: this.port });
    this.initialize();
  }

  private initialize(): void {
    console.log(`WebSocket server started on ws://localhost:${this.port}`);
    console.log("Server is ready to accept connections");

    this.wss.on("connection", (ws: WebSocket) => {
      this.handleConnection(ws);
    });

    this.wss.on("error", (error: Error) => {
      console.error("WebSocket server error:", error);
    });
  }

  private handleConnection(ws: WebSocket): void {
    console.log("New client connected");

    ws.on("message", (message: string) => {
      this.handleClientMessage(ws, message);
    });

    ws.on("close", () => {
      this.handleClientDisconnect(ws);
    });

    ws.on("error", (error: Error) => {
      console.error("WebSocket connection error:", error);
    });
  }

  private handleClientMessage(ws: WebSocket, message: string): void {
    try {
      const msg = JSON.parse(message.toString());
      handleMessage(ws, msg, this.db, this.wss);
    } catch (error) {
      console.error("Error parsing message:", error);
      console.log(
        "Invalid message received:",
        message.toString().substring(0, 100)
      );
    }
  }

  private handleClientDisconnect(ws: WebSocket): void {
    console.log("Client disconnected");

    this.db.players.removePlayerWebSocket(ws);
  }

  public getDatabase(): Database {
    return this.db;
  }

  public getWebSocketServer(): WebSocketServer {
    return this.wss;
  }

  public close(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.wss.close((error) => {
        if (error) {
          reject(error);
        } else {
          console.log("WebSocket server closed");
          resolve();
        }
      });
    });
  }
}
