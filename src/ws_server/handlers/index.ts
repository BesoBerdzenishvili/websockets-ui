import { Database } from "../database/index.ts";
import { handleAddShips } from "./shipHandler.ts";
import { MESSAGE_TYPES } from "../models/constants.ts";
import { handleRegistration } from "./playerHandler.ts";
import { validateMessage } from "../utils/validation.ts";
import WebSocket, { WebSocketServer } from "ws";
import { handleAttack, handleRandomAttack } from "./gameHandler.ts";
import { handleCreateRoom, handleAddUserToRoom } from "./roomHandler.ts";

interface Message {
  type: string;
  data: any;
  id: number;
}

export function handleMessage(
  ws: WebSocket,
  msg: Message,
  db: Database,
  wss: WebSocketServer
): void {
  if (!validateMessage(msg)) {
    console.log("Result: Invalid message format");
    return;
  }

  console.log("Received command:", msg.type, JSON.stringify(msg.data));

  switch (msg.type) {
    case MESSAGE_TYPES.REG:
      handleRegistration(ws, msg, db, wss);
      break;

    case MESSAGE_TYPES.CREATE_ROOM:
      handleCreateRoom(ws, db, wss);
      break;

    case MESSAGE_TYPES.ADD_USER_TO_ROOM:
      handleAddUserToRoom(ws, msg, db, wss);
      break;

    case MESSAGE_TYPES.ADD_SHIPS:
      handleAddShips(ws, msg, db);
      break;

    case MESSAGE_TYPES.ATTACK:
      handleAttack(ws, msg, db, wss);
      break;

    case MESSAGE_TYPES.RANDOM_ATTACK:
      handleRandomAttack(ws, msg, db, wss);
      break;

    default:
      console.log("Result: Unknown command type:", msg.type);
  }
}

export { handleRegistration } from "./playerHandler.ts";
export { handleCreateRoom, handleAddUserToRoom } from "./roomHandler.ts";
export { handleAddShips } from "./shipHandler.ts";
export {
  handleAttack,
  handleRandomAttack,
  processAttack,
  finishGame,
} from "./gameHandler.ts";
