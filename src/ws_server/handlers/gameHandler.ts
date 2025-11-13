import {
  Message,
  AttackData,
  RandomAttackData,
  Position,
  AttackResponse,
  FinishData,
} from "../models/types";
import {
  checkHit,
  getSurroundingCells,
  allShipsSunk,
  recordHit,
  getRandomUnusedPosition,
} from "../utils/gameLogic";
import { Database } from "../database";
import { broadcastTurn } from "./shipHandler";
import { broadcastUpdateWinners } from "./playerHandler";
import WebSocket, { Server as WebSocketServer } from "ws";
import { validateAttackPosition } from "../utils/validation";
import { MESSAGE_TYPES, ATTACK_STATUS } from "../models/constants";
import { broadcastToGame, createMessage } from "../utils/broadcast";

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

  const data: AttackData = msg.data;
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

  const data: RandomAttackData = msg.data;
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

  const attackMessage: Message = createMessage(MESSAGE_TYPES.ATTACK, {
    position,
    currentPlayer: attackerIndex,
    status,
  } as AttackResponse);

  broadcastToGame(game, db, attackMessage);

  if (status === ATTACK_STATUS.KILLED && hitResult.ship) {
    const surroundingCells = getSurroundingCells(hitResult.ship);

    surroundingCells.forEach((cell) => {
      const missMessage: Message = createMessage(MESSAGE_TYPES.ATTACK, {
        position: cell,
        currentPlayer: attackerIndex,
        status: ATTACK_STATUS.MISS,
      } as AttackResponse);

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

  const finishMessage: Message = createMessage(MESSAGE_TYPES.FINISH, {
    winPlayer: winnerIndex,
  } as FinishData);

  broadcastToGame(game, db, finishMessage);

  broadcastUpdateWinners(db, wss);
}
