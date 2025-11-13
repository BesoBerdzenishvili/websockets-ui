interface Room {
  roomId: string;
  players: string[];
  gameStarted: boolean;
}

export class RoomManager {
  private rooms: Map<string, Room> = new Map();
  private roomIdCounter = 0;

  createRoom(playerIndex: string): Room {
    const roomId = String(this.roomIdCounter++);
    const room: Room = {
      roomId,
      players: [playerIndex],
      gameStarted: false,
    };

    this.rooms.set(roomId, room);
    return room;
  }

  addPlayerToRoom(roomId: string, playerIndex: string): Room | null {
    const room = this.rooms.get(roomId);

    if (!room) {
      return null;
    }

    if (room.players.length >= 2) {
      return null;
    }

    if (room.gameStarted) {
      return null;
    }

    if (room.players.includes(playerIndex)) {
      return null;
    }

    room.players.push(playerIndex);
    return room;
  }

  getAvailableRooms(): Room[] {
    return Array.from(this.rooms.values()).filter(
      (room) => room.players.length === 1 && !room.gameStarted
    );
  }

  getRoom(roomId: string): Room | undefined {
    return this.rooms.get(roomId);
  }

  markGameStarted(roomId: string): boolean {
    const room = this.rooms.get(roomId);
    if (room) {
      room.gameStarted = true;
      return true;
    }
    return false;
  }

  deleteRoom(roomId: string): void {
    this.rooms.delete(roomId);
  }

  findRoomByPlayer(playerIndex: string): Room | undefined {
    for (const room of this.rooms.values()) {
      if (room.players.includes(playerIndex)) {
        return room;
      }
    }
    return undefined;
  }

  removePlayerFromRoom(roomId: string, playerIndex: string): boolean {
    const room = this.rooms.get(roomId);
    if (!room) {
      return false;
    }

    const index = room.players.indexOf(playerIndex);
    if (index === -1) {
      return false;
    }

    room.players.splice(index, 1);

    if (room.players.length === 0) {
      this.deleteRoom(roomId);
    }

    return true;
  }

  isRoomFull(roomId: string): boolean {
    const room = this.rooms.get(roomId);
    return room ? room.players.length >= 2 : false;
  }

  getAllRooms(): Room[] {
    return Array.from(this.rooms.values());
  }
}
