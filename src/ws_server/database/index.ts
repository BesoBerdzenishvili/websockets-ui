import { RoomManager } from "./roomManager";
import { GameManager } from "./gameManager";
import { PlayerManager } from "./playerManager";

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
