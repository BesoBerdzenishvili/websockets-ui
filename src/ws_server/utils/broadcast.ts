import { Database } from "../database";
import { Message, Player, Game } from "../models/types";
import WebSocket, { Server as WebSocketServer } from "ws";

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
