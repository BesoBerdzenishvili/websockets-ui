import WebSocket from "ws";

export interface Player {
  name: string;
  password: string;
  index: string;
  wins: number;
  ws?: WebSocket;
}

export interface Position {
  x: number;
  y: number;
}

export interface Ship {
  position: Position;
  direction: boolean;
  length: number;
  type: ShipType;
  hits: Position[];
}

export interface Room {
  roomId: string;
  players: string[];
  gameStarted: boolean;
}

export interface Game {
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

export interface Message {
  type: string;
  data: any;
  id: number;
}

export type ShipType = "small" | "medium" | "large" | "huge";
export type AttackStatus = "miss" | "shot" | "killed";

export interface RegistrationData {
  name: string;
  password: string;
}

export interface RegistrationResponse {
  name: string;
  index: string;
  error: boolean;
  errorText: string;
}

export interface CreateGameData {
  idGame: string;
  idPlayer: string;
}

export interface AddUserToRoomData {
  indexRoom: string;
}

export interface AddShipsData {
  gameId: string;
  ships: Ship[];
  indexPlayer: string;
}

export interface AttackData {
  gameId: string;
  x: number;
  y: number;
  indexPlayer: string;
}

export interface RandomAttackData {
  gameId: string;
  indexPlayer: string;
}

export interface AttackResponse {
  position: Position;
  currentPlayer: string;
  status: AttackStatus;
}

export interface TurnData {
  currentPlayer: string;
}

export interface FinishData {
  winPlayer: string;
}

export interface WinnerInfo {
  name: string;
  wins: number;
}

export interface RoomInfo {
  roomId: string;
  roomUsers: Array<{
    name: string;
    index: string;
  }>;
}

export interface StartGameData {
  ships: Ship[];
  currentPlayerIndex: string;
}
