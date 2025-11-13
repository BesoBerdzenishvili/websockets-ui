import { getShipPositions } from "./gameLogic.ts";
import { BOARD_SIZE, SHIP_LENGTHS } from "../models/constants.ts";

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

export function validateShipPlacement(ships: Ship[]): boolean {
  if (!ships || ships.length === 0) {
    return false;
  }

  for (const ship of ships) {
    if (!validateSingleShip(ship)) {
      return false;
    }
  }

  if (hasOverlappingShips(ships)) {
    return false;
  }

  return true;
}

function validateSingleShip(ship: Ship): boolean {
  if (!SHIP_LENGTHS[ship.type]) {
    return false;
  }

  if (ship.length !== SHIP_LENGTHS[ship.type]) {
    return false;
  }

  const positions = getShipPositions(ship);
  for (const pos of positions) {
    if (!isValidPosition(pos)) {
      return false;
    }
  }

  return true;
}

function hasOverlappingShips(ships: Ship[]): boolean {
  const occupiedPositions: Position[] = [];

  for (const ship of ships) {
    const positions = getShipPositions(ship);

    for (const pos of positions) {
      if (
        occupiedPositions.some(
          (occupied) => occupied.x === pos.x && occupied.y === pos.y
        )
      ) {
        return true;
      }
      occupiedPositions.push(pos);
    }
  }

  return false;
}

export function validateAttackPosition(position: Position): boolean {
  return isValidPosition(position);
}

export function isValidPosition(position: Position): boolean {
  return (
    position.x >= 0 &&
    position.x < BOARD_SIZE &&
    position.y >= 0 &&
    position.y < BOARD_SIZE
  );
}

export function validateCredentials(name: string, password: string): boolean {
  return (
    typeof name === "string" &&
    name.length > 0 &&
    typeof password === "string" &&
    password.length > 0
  );
}

export function validateMessage(msg: any): boolean {
  return (
    msg &&
    typeof msg.type === "string" &&
    msg.hasOwnProperty("data") &&
    typeof msg.id === "number"
  );
}
