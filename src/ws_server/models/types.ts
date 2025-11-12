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
  type: "small" | "medium" | "large" | "huge";
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
