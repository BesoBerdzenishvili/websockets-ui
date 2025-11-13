import {
  sendToPlayer,
  broadcastToGame,
  createMessage,
} from "../utils/broadcast.ts";
import { Database } from "../database/index.ts";
import { MESSAGE_TYPES } from "../models/constants.ts";
import WebSocket from "ws";
import { validateShipPlacement } from "../utils/validation.ts";
interface Message {
  type: string;
  data: any;
  id: number;
}
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

interface AddShipsData {
  gameId: string;
  ships: Ship[];
  indexPlayer: string;
}

interface StartGameData {
  ships: Ship[];
  currentPlayerIndex: string;
}

interface TurnData {
  currentPlayer: string;
}

export function handleAddShips(
  ws: WebSocket,
  msg: Message,
  db: Database
): void {
  const player = db.players.getPlayerByWs(ws);

  if (!player) {
    console.log("Result: Add ships failed - player not found");
    return;
  }

  const data: AddShipsData = msg.data;
  const game = db.games.getGame(data.gameId);

  if (!game) {
    console.log(`Result: Add ships failed - game ${data.gameId} not found`);
    return;
  }

  if (!validateShipPlacement(data.ships)) {
    console.log(
      `Result: Add ships failed - invalid ship placement for player ${player.name}`
    );
    return;
  }

  const success = db.games.addShipsToGame(
    data.gameId,
    data.indexPlayer,
    data.ships
  );

  if (!success) {
    console.log(`Result: Add ships failed for player ${player.name}`);
    return;
  }

  console.log(
    `Result: Ships added for player ${player.name} (${data.indexPlayer}) in game ${data.gameId}`
  );

  if (db.games.bothPlayersReady(data.gameId)) {
    startGame(game, db);
  }
}

export function startGame(game: any, db: Database): void {
  console.log(`Result: Starting game ${game.idGame}`);

  Object.keys(game.players).forEach((playerIndex) => {
    const player = db.players.getPlayerByIndex(playerIndex);
    if (player && player.ws) {
      const playerShips = game.players[playerIndex].ships;

      const response: Message = createMessage(MESSAGE_TYPES.START_GAME, {
        ships: playerShips,
        currentPlayerIndex: playerIndex,
      } as StartGameData);

      sendToPlayer(player.ws, response);
      console.log(
        `Result: Sent start_game to player ${player.name} (${playerIndex})`
      );
    }
  });

  broadcastTurn(game, db);
}

export function broadcastTurn(game: any, db: Database): void {
  const turnMessage: Message = createMessage(MESSAGE_TYPES.TURN, {
    currentPlayer: game.currentTurn,
  } as TurnData);

  broadcastToGame(game, db, turnMessage);

  const currentPlayer = db.players.getPlayerByIndex(game.currentTurn);
  console.log(
    `Result: Turn broadcast - current player: ${currentPlayer?.name} (${game.currentTurn})`
  );
}
