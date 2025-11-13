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

interface Game {
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

export class GameManager {
  private games: Map<string, Game> = new Map();
  private gameIdCounter = 0;

  createGame(player1Index: string, player2Index: string): Game {
    const gameId = String(this.gameIdCounter++);
    const game: Game = {
      idGame: gameId,
      players: {
        [player1Index]: {
          playerIndex: player1Index,
          ships: [],
          shots: [],
        },
        [player2Index]: {
          playerIndex: player2Index,
          ships: [],
          shots: [],
        },
      },
      currentTurn: player1Index,
      finished: false,
    };

    this.games.set(gameId, game);
    return game;
  }

  getGame(gameId: string): Game | undefined {
    return this.games.get(gameId);
  }

  addShipsToGame(gameId: string, playerIndex: string, ships: Ship[]): boolean {
    const game = this.games.get(gameId);
    if (!game || !game.players[playerIndex]) {
      return false;
    }

    game.players[playerIndex].ships = ships.map((ship) => ({
      ...ship,
      hits: [],
    }));

    return true;
  }

  bothPlayersReady(gameId: string): boolean {
    const game = this.games.get(gameId);
    if (!game) {
      return false;
    }

    return Object.values(game.players).every((p) => p.ships.length > 0);
  }

  recordShot(gameId: string, playerIndex: string, position: Position): boolean {
    const game = this.games.get(gameId);
    if (!game || !game.players[playerIndex]) {
      return false;
    }

    const alreadyShot = game.players[playerIndex].shots.some(
      (shot) => shot.x === position.x && shot.y === position.y
    );

    if (alreadyShot) {
      return false;
    }

    game.players[playerIndex].shots.push(position);
    return true;
  }

  changeTurn(gameId: string): boolean {
    const game = this.games.get(gameId);
    if (!game) {
      return false;
    }

    const playerIndices = Object.keys(game.players);
    const currentIndex = playerIndices.indexOf(game.currentTurn);
    const nextIndex = (currentIndex + 1) % playerIndices.length;
    game.currentTurn = playerIndices[nextIndex];

    return true;
  }

  getOpponentIndex(gameId: string, playerIndex: string): string | null {
    const game = this.games.get(gameId);
    if (!game) {
      return null;
    }

    const playerIndices = Object.keys(game.players);
    return playerIndices.find((index) => index !== playerIndex) || null;
  }

  finishGame(gameId: string): boolean {
    const game = this.games.get(gameId);
    if (!game) {
      return false;
    }

    game.finished = true;
    return true;
  }

  deleteGame(gameId: string): void {
    this.games.delete(gameId);
  }

  findGameByPlayer(playerIndex: string): Game | undefined {
    for (const game of this.games.values()) {
      if (game.players[playerIndex]) {
        return game;
      }
    }
    return undefined;
  }

  isPlayerTurn(gameId: string, playerIndex: string): boolean {
    const game = this.games.get(gameId);
    if (!game) {
      return false;
    }

    return game.currentTurn === playerIndex;
  }

  getPlayerShips(gameId: string, playerIndex: string): Ship[] | null {
    const game = this.games.get(gameId);
    if (!game || !game.players[playerIndex]) {
      return null;
    }

    return game.players[playerIndex].ships;
  }

  getPlayerShots(gameId: string, playerIndex: string): Position[] | null {
    const game = this.games.get(gameId);
    if (!game || !game.players[playerIndex]) {
      return null;
    }

    return game.players[playerIndex].shots;
  }

  getActiveGames(): Game[] {
    return Array.from(this.games.values()).filter((game) => !game.finished);
  }

  getAllGames(): Game[] {
    return Array.from(this.games.values());
  }
}
