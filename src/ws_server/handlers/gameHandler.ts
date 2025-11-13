import {
  checkHit,
  getSurroundingCells,
  allShipsSunk,
  recordHit,
  getRandomUnusedPosition,
} from "../utils/gameLogic.ts";
import { Database } from "../database/index.ts";
import { broadcastTurn } from "./shipHandler.ts";
import { broadcastUpdateWinners } from "./playerHandler.ts";
import WebSocket, { WebSocketServer } from "ws";
import { validateAttackPosition } from "../utils/validation.ts";
import { MESSAGE_TYPES, ATTACK_STATUS } from "../models/constants.ts";
import { broadcastToGame, createMessage } from "../utils/broadcast.ts";

interface AttackData {
  gameId: string;
  x: number;
  y: number;
  indexPlayer: string;
}

interface FinishData {
  winPlayer: string;
}

interface RandomAttackData {
  gameId: string;
  indexPlayer: string;
}

interface Message {
  type: string;
  data: any;
  id: number;
}

interface Position {
  x: number;
  y: number;
}

interface AttackResponse {
  position: Position;
  currentPlayer: string;
  status: "miss" | "shot" | "killed";
}

export function handleAttack(
  ws: WebSocket,
  msg: Message,
  db: Database,
  wss: WebSocketServer
): void {
  const player = db.players.getPlayerByWs(ws);

  if (!player) {
    console.log("Result: Attack failed - player not found");
    return;
  }

  const data: AttackData = JSON.parse(msg.data as string);
  const position: Position = { x: data.x, y: data.y };

  processAttack(data.gameId, data.indexPlayer, position, db, wss);
}

export function handleRandomAttack(
  ws: WebSocket,
  msg: Message,
  db: Database,
  wss: WebSocketServer
): void {
  const player = db.players.getPlayerByWs(ws);

  if (!player) {
    console.log("Result: Random attack failed - player not found");
    return;
  }

  const data: RandomAttackData = JSON.parse(msg.data as string);
  const game = db.games.getGame(data.gameId);

  if (!game) {
    console.log(`Result: Random attack failed - game ${data.gameId} not found`);
    return;
  }

  const shotPositions = game.players[data.indexPlayer].shots;

  const position = getRandomUnusedPosition(shotPositions);

  console.log(
    `Result: Random attack at position (${position.x}, ${position.y})`
  );

  processAttack(data.gameId, data.indexPlayer, position, db, wss);
}

export function processAttack(
  gameId: string,
  attackerIndex: string,
  position: Position,
  db: Database,
  wss: WebSocketServer
): void {
  const game = db.games.getGame(gameId);

  if (!game) {
    console.log(`Result: Attack failed - game ${gameId} not found`);
    return;
  }

  if (game.finished) {
    console.log("Result: Attack failed - game already finished");
    return;
  }

  if (!db.games.isPlayerTurn(gameId, attackerIndex)) {
    console.log("Result: Attack failed - not player's turn");
    return;
  }

  if (!validateAttackPosition(position)) {
    console.log("Result: Attack failed - invalid position");
    return;
  }

  if (!db.games.recordShot(gameId, attackerIndex, position)) {
    console.log("Result: Attack failed - position already shot");
    return;
  }

  const enemyIndex = db.games.getOpponentIndex(gameId, attackerIndex);
  if (!enemyIndex) {
    console.log("Result: Attack failed - opponent not found");
    return;
  }

  const enemyShips = game.players[enemyIndex].ships;

  const hitResult = checkHit(position, enemyShips);

  let status: "miss" | "shot" | "killed" = ATTACK_STATUS.MISS;

  if (hitResult.hit && hitResult.ship) {
    recordHit(hitResult.ship, position);

    if (hitResult.isKilled) {
      status = ATTACK_STATUS.KILLED;
      console.log(
        `Result: Attack at (${position.x}, ${position.y}) - KILLED ship`
      );
    } else {
      status = ATTACK_STATUS.SHOT;
      console.log(
        `Result: Attack at (${position.x}, ${position.y}) - HIT ship`
      );
    }
  } else {
    console.log(`Result: Attack at (${position.x}, ${position.y}) - MISS`);
  }
  const attackData = JSON.stringify({
    position,
    currentPlayer: attackerIndex,
    status,
  } as AttackResponse);
  const attackMessage: Message = createMessage(
    MESSAGE_TYPES.ATTACK,
    attackData
  );

  broadcastToGame(game, db, attackMessage);

  if (status === ATTACK_STATUS.KILLED && hitResult.ship) {
    const surroundingCells = getSurroundingCells(hitResult.ship);

    surroundingCells.forEach((cell) => {
      const cellsData = JSON.stringify({
        position: cell,
        currentPlayer: attackerIndex,
        status: ATTACK_STATUS.MISS,
      } as AttackResponse);
      const missMessage: Message = createMessage(
        MESSAGE_TYPES.ATTACK,
        cellsData
      );

      broadcastToGame(game, db, missMessage);
    });

    console.log(
      `Result: Marked ${surroundingCells.length} surrounding cells as miss`
    );
  }

  if (allShipsSunk(enemyShips)) {
    finishGame(game, attackerIndex, db, wss);
  } else {
    if (status === ATTACK_STATUS.MISS) {
      db.games.changeTurn(gameId);
    }

    broadcastTurn(game, db);
  }
}

export function finishGame(
  game: any,
  winnerIndex: string,
  db: Database,
  wss: WebSocketServer
): void {
  db.games.finishGame(game.idGame);
  db.players.incrementWins(winnerIndex);

  const winner = db.players.getPlayerByIndex(winnerIndex);
  console.log(
    `Result: Game ${game.idGame} finished - Winner: ${winner?.name} (${winnerIndex})`
  );
  const winnerData = JSON.stringify({
    winPlayer: winnerIndex,
  } as FinishData);
  const finishMessage: Message = createMessage(
    MESSAGE_TYPES.FINISH,
    winnerData
  );

  broadcastToGame(game, db, finishMessage);

  broadcastUpdateWinners(db, wss);
}
