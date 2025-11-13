import { Database } from "../database/index.ts";
import { MESSAGE_TYPES } from "../models/constants.ts";
import { broadcastUpdateRoom } from "./playerHandler.ts";
import WebSocket, { WebSocketServer } from "ws";
import { sendToPlayer, createMessage } from "../utils/broadcast.ts";

interface Message {
  type: string;
  data: any;
  id: number;
}

interface AddUserToRoomData {
  indexRoom: string;
}

interface CreateGameData {
  idGame: string;
  idPlayer: string;
}

export function handleCreateRoom(
  ws: WebSocket,
  db: Database,
  wss: WebSocketServer
): void {
  const player = db.players.getPlayerByWs(ws);

  if (!player) {
    console.log("Result: Room creation failed - player not found");
    return;
  }

  const room = db.rooms.createRoom(player.index);

  console.log(
    `Result: Room ${room.roomId} created by player ${player.name} (${player.index})`
  );

  broadcastUpdateRoom(db, wss);
}

export function handleAddUserToRoom(
  ws: WebSocket,
  msg: Message,
  db: Database,
  wss: WebSocketServer
): void {
  const player = db.players.getPlayerByWs(ws);

  if (!player) {
    console.log("Result: Add user to room failed - player not found");
    return;
  }

  const data: AddUserToRoomData = JSON.parse(msg.data as string);
  const room = db.rooms.addPlayerToRoom(data.indexRoom, player.index);

  if (!room) {
    console.log(
      `Result: Failed to add player ${player.name} to room ${data.indexRoom}`
    );
    return;
  }

  console.log(
    `Result: Player ${player.name} (${player.index}) added to room ${room.roomId}`
  );

  if (room.players.length === 2) {
    const game = db.games.createGame(room.players[0], room.players[1]);
    db.rooms.markGameStarted(room.roomId);

    console.log(`Result: Game ${game.idGame} created for room ${room.roomId}`);

    room.players.forEach((playerIndex) => {
      const p = db.players.getPlayerByIndex(playerIndex);
      if (p && p.ws) {
        const msgData = JSON.stringify({
          idGame: game.idGame,
          idPlayer: playerIndex,
        } as CreateGameData);
        const response: Message = createMessage(
          MESSAGE_TYPES.CREATE_GAME,
          msgData
        );

        sendToPlayer(p.ws, response);
        console.log(
          `Result: Sent create_game to player ${p.name} (${playerIndex})`
        );
      }
    });

    broadcastUpdateRoom(db, wss);
  }
}
