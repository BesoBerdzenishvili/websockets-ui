import { RoomManager } from "./roomManager.ts";
import { GameManager } from "./gameManager.ts";
import { PlayerManager } from "./playerManager.ts";

export class Database {
  public players: PlayerManager;
  public rooms: RoomManager;
  public games: GameManager;

  constructor() {
    this.players = new PlayerManager();
    this.rooms = new RoomManager();
    this.games = new GameManager();
  }

  reset(): void {
    this.players = new PlayerManager();
    this.rooms = new RoomManager();
    this.games = new GameManager();
  }
}
