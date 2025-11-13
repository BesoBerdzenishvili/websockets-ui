import { Database } from "../database";
import { MESSAGE_TYPES } from "../models/constants";
import { broadcastUpdateRoom } from "./playerHandler";
import WebSocket, { Server as WebSocketServer } from "ws";
import { sendToPlayer, createMessage } from "../utils/broadcast";
import { Message, AddUserToRoomData, CreateGameData } from "../models/types";

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

  const data: AddUserToRoomData = msg.data;
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
        const response: Message = createMessage(MESSAGE_TYPES.CREATE_GAME, {
          idGame: game.idGame,
          idPlayer: playerIndex,
        } as CreateGameData);

        sendToPlayer(p.ws, response);
        console.log(
          `Result: Sent create_game to player ${p.name} (${playerIndex})`
        );
      }
    });

    broadcastUpdateRoom(db, wss);
  }
}
