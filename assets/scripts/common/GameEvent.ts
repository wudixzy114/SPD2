export enum GameEvent {
  // Input Events
  INPUT_MOVE_INTENT = "input.move.intent",
  INPUT_WAIT_INTENT = "input.wait.intent",

  // Game State Events
  GAME_START = "game.start",
  GAME_OVER = "game.over",

  // Player/Actor Events
  PLAYER_TURN_START = "player.turn.start",
  PLAYER_ACTION_DONE = "player.action.done",

  // UI Events
  LOG_MESSAGE_ADDED = "log.message.added",
}
