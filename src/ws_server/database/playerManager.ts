import WebSocket from "ws";

interface Player {
  name: string;
  password: string;
  index: string;
  wins: number;
  ws?: WebSocket;
}

export class PlayerManager {
  private players: Map<string, Player> = new Map();
  private playerIndexCounter = 0;

  registerPlayer(
    name: string,
    password: string,
    ws: WebSocket
  ): { player: Player; error: boolean; errorText: string } {
    const existing = this.players.get(name);

    if (existing) {
      if (existing.password === password) {
        existing.ws = ws;
        return { player: existing, error: false, errorText: "" };
      } else {
        return {
          player: existing,
          error: true,
          errorText: "Wrong password",
        };
      }
    }

    const player: Player = {
      name,
      password,
      index: String(this.playerIndexCounter++),
      wins: 0,
      ws,
    };

    this.players.set(name, player);
    return { player, error: false, errorText: "" };
  }

  getPlayer(name: string): Player | undefined {
    return this.players.get(name);
  }

  getPlayerByIndex(index: string): Player | undefined {
    for (const player of this.players.values()) {
      if (player.index === index) {
        return player;
      }
    }
    return undefined;
  }

  getPlayerByWs(ws: WebSocket): Player | undefined {
    for (const player of this.players.values()) {
      if (player.ws === ws) {
        return player;
      }
    }
    return undefined;
  }

  getAllPlayers(): Player[] {
    return Array.from(this.players.values());
  }

  incrementWins(playerIndex: string): void {
    const player = this.getPlayerByIndex(playerIndex);
    if (player) {
      player.wins++;
    }
  }

  getLeaderboard(): Array<{ name: string; wins: number }> {
    return this.getAllPlayers()
      .map((p) => ({ name: p.name, wins: p.wins }))
      .sort((a, b) => b.wins - a.wins);
  }

  updatePlayerWebSocket(playerIndex: string, ws: WebSocket): boolean {
    const player = this.getPlayerByIndex(playerIndex);
    if (player) {
      player.ws = ws;
      return true;
    }
    return false;
  }

  removePlayerWebSocket(ws: WebSocket): void {
    const player = this.getPlayerByWs(ws);
    if (player) {
      player.ws = undefined;
    }
  }
}
