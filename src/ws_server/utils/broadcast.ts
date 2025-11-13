import { Database } from "../database/index.ts";
import WebSocket, { WebSocketServer } from "ws";

interface Position {
  x: number;
  y: number;
}

interface Ship {
  position: Position;
  direction: boolean;
  length: number;
  type: "small" | "medium" | "large" | "huge";
  hits: Position[];
}

interface Player {
  name: string;
  password: string;
  index: string;
  wins: number;
  ws?: WebSocket;
}

interface Game {
  idGame: string;
  players: {
    [playerId: string]: {
      playerIndex: string;
      ships: Ship[];
      shots: Position[];
    };
  };
  currentTurn: string;
  finished: boolean;
}

interface Message {
  type: string;
  data: any;
  id: number;
}

export function sendToPlayer(ws: WebSocket, message: Message): void {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(message));
  }
}

export function broadcastToAll(wss: WebSocketServer, message: Message): void {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      sendToPlayer(client, message);
    }
  });
}

export function broadcastToPlayers(players: Player[], message: Message): void {
  players.forEach((player) => {
    if (player.ws && player.ws.readyState === WebSocket.OPEN) {
      sendToPlayer(player.ws, message);
    }
  });
}

export function broadcastToGame(
  game: Game,
  db: Database,
  message: Message
): void {
  Object.keys(game.players).forEach((playerIndex) => {
    const player = db.players.getPlayerByIndex(playerIndex);
    if (player && player.ws) {
      sendToPlayer(player.ws, message);
    }
  });
}

export function createMessage(type: string, data: any): Message {
  return {
    type,
    data,
    id: 0,
  };
}
