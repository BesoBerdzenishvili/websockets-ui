import { Database } from "../database/index";
import { Message } from "../models/types";
import { handleAddShips } from "./shipHandler";
import { MESSAGE_TYPES } from "../models/constants";
import { handleRegistration } from "./playerHandler";
import { validateMessage } from "../utils/validation";
import WebSocket, { Server as WebSocketServer } from "ws";
import { handleAttack, handleRandomAttack } from "./gameHandler";
import { handleCreateRoom, handleAddUserToRoom } from "./roomHandler";

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
      handleCreateRoom(ws, msg, db, wss);
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

export { handleRegistration } from "./playerHandler";
export { handleCreateRoom, handleAddUserToRoom } from "./roomHandler";
export { handleAddShips } from "./shipHandler";
export {
  handleAttack,
  handleRandomAttack,
  processAttack,
  finishGame,
} from "./gameHandler";
