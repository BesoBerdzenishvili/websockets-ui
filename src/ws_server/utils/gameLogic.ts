import { BOARD_SIZE } from "../models/constants.ts";

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

export function getShipPositions(ship: Ship): Position[] {
  const positions: Position[] = [];
  for (let i = 0; i < ship.length; i++) {
    positions.push({
      x: ship.position.x + (ship.direction ? 0 : i),
      y: ship.position.y + (ship.direction ? i : 0),
    });
  }
  return positions;
}

export function getSurroundingCells(ship: Ship): Position[] {
  const shipPositions = getShipPositions(ship);
  const surrounding: Position[] = [];

  shipPositions.forEach((pos) => {
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        const x = pos.x + dx;
        const y = pos.y + dy;

        if (x >= 0 && x < BOARD_SIZE && y >= 0 && y < BOARD_SIZE) {
          const isShipCell = shipPositions.some(
            (sp) => sp.x === x && sp.y === y
          );
          const alreadyAdded = surrounding.some((s) => s.x === x && s.y === y);

          if (!isShipCell && !alreadyAdded) {
            surrounding.push({ x, y });
          }
        }
      }
    }
  });

  return surrounding;
}

export function checkHit(
  position: Position,
  ships: Ship[]
): { hit: boolean; ship?: Ship; isKilled?: boolean } {
  for (const ship of ships) {
    const shipPositions = getShipPositions(ship);
    const hit = shipPositions.find(
      (pos) => pos.x === position.x && pos.y === position.y
    );

    if (hit) {
      const wouldBeKilled = ship.hits.length + 1 === ship.length;

      return {
        hit: true,
        ship,
        isKilled: wouldBeKilled,
      };
    }
  }

  return { hit: false };
}

export function isShipSunk(ship: Ship): boolean {
  return ship.hits.length === ship.length;
}

export function allShipsSunk(ships: Ship[]): boolean {
  return ships.every((ship) => isShipSunk(ship));
}

export function getRandomUnusedPosition(usedPositions: Position[]): Position {
  let position: Position;
  let attempts = 0;
  const maxAttempts = 100;

  do {
    position = {
      x: Math.floor(Math.random() * BOARD_SIZE),
      y: Math.floor(Math.random() * BOARD_SIZE),
    };
    attempts++;

    if (attempts >= maxAttempts) {
      for (let y = 0; y < BOARD_SIZE; y++) {
        for (let x = 0; x < BOARD_SIZE; x++) {
          const pos = { x, y };
          if (!isPositionUsed(pos, usedPositions)) {
            return pos;
          }
        }
      }
    }
  } while (isPositionUsed(position, usedPositions));

  return position;
}

export function isPositionUsed(
  position: Position,
  usedPositions: Position[]
): boolean {
  return usedPositions.some(
    (pos) => pos.x === position.x && pos.y === position.y
  );
}

export function positionsEqual(pos1: Position, pos2: Position): boolean {
  return pos1.x === pos2.x && pos1.y === pos2.y;
}

export function recordHit(ship: Ship, position: Position): void {
  if (!ship.hits.some((hit) => positionsEqual(hit, position))) {
    ship.hits.push(position);
  }
}
