import {
  sendToPlayer,
  broadcastToAll,
  createMessage,
} from "../utils/broadcast.ts";
import { Database } from "../database/index.ts";
import { MESSAGE_TYPES } from "../models/constants.ts";
import { validateCredentials } from "../utils/validation.ts";
import WebSocket, { WebSocketServer } from "ws";

interface WinnerInfo {
  name: string;
  wins: number;
}

interface RegistrationResponse {
  name: string;
  index: string;
  error: boolean;
  errorText: string;
}

interface Message {
  type: string;
  data: any;
  id: number;
}

interface RegistrationData {
  name: string;
  password: string;
}

export function handleRegistration(
  ws: WebSocket,
  msg: Message,
  db: Database,
  wss: WebSocketServer
): void {
  const data: RegistrationData = JSON.parse(msg.data as string);

  if (!validateCredentials(data.name, data.password)) {
    const response: Message = {
      type: MESSAGE_TYPES.REG,
      data: {
        name: data.name || "",
        index: "",
        error: true,
        errorText: "Invalid name or password",
      } as RegistrationResponse,
      id: 0,
    };
    sendToPlayer(ws, response);
    console.log("Result: Registration failed - invalid credentials");
    return;
  }

  const result = db.players.registerPlayer(data.name, data.password, ws);

  const userData = JSON.stringify({
    name: result.player.name,
    index: result.player.index,
    error: result.error,
    errorText: result.errorText,
  } as RegistrationResponse);

  const response: Message = {
    type: MESSAGE_TYPES.REG,
    data: userData,
    id: 0,
  };

  sendToPlayer(ws, response);

  if (result.error) {
    console.log(
      `Result: Registration failed for ${data.name} - ${result.errorText}`
    );
  } else {
    console.log(
      `Result: Registration successful for ${data.name} (index: ${result.player.index})`
    );

    broadcastUpdateRoom(db, wss);
    broadcastUpdateWinners(db, wss);
  }
}

export function broadcastUpdateWinners(
  db: Database,
  wss: WebSocketServer
): void {
  const winners: WinnerInfo[] = db.players.getLeaderboard();

  const message: Message = createMessage(MESSAGE_TYPES.UPDATE_WINNERS, winners);

  broadcastToAll(wss, message);
  console.log("Result: Winners table updated and broadcast");
}

export function broadcastUpdateRoom(db: Database, wss: WebSocketServer): void {
  const availableRooms = db.rooms.getAvailableRooms();

  const roomData = availableRooms.map((room) => ({
    roomId: room.roomId,
    roomUsers: room.players
      .map((playerIndex) => {
        const player = db.players.getPlayerByIndex(playerIndex);
        return player ? { name: player.name, index: player.index } : null;
      })
      .filter(Boolean),
  }));

  const message: Message = createMessage(MESSAGE_TYPES.UPDATE_ROOM, roomData);

  broadcastToAll(wss, message);
  console.log("Result: Room list updated and broadcast");
}
