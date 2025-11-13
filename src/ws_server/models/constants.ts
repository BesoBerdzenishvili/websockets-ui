export const BOARD_SIZE = 10;

export const SHIP_LENGTHS = {
  small: 1,
  medium: 2,
  large: 3,
  huge: 4,
} as const;

export const MESSAGE_TYPES = {
  REG: "reg",
  UPDATE_WINNERS: "update_winners",

  CREATE_ROOM: "create_room",
  ADD_USER_TO_ROOM: "add_user_to_room",
  UPDATE_ROOM: "update_room",
  CREATE_GAME: "create_game",

  ADD_SHIPS: "add_ships",
  START_GAME: "start_game",

  ATTACK: "attack",
  RANDOM_ATTACK: "randomAttack",
  TURN: "turn",
  FINISH: "finish",
} as const;

export const ATTACK_STATUS = {
  MISS: "miss",
  SHOT: "shot",
  KILLED: "killed",
} as const;
