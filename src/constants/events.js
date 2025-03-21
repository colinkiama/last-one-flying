export const CrossSceneEvent = {
  UPDATE_SCORE: 'update-score',
  UPDATE_LIVES: 'update-lives',
  SHAKE_SCREEN: 'shake-screen',
  PAUSE_GAME: 'pause-game',
  RESUME_GAME: 'resume-game',
  QUIT_GAME: 'quit-game',
  HUD_DESTROYED: 'hud-destroyed',
  RESET_GAME: 'reset-game',
  SCORE_RESET: 'score-reset',
  PAUSE_REQUESTED: 'pause-requested',
};

export const GameLogicEvent = {
  PLAYER_FIRE: 'player-fire',
  ENEMY_FIRE: 'enemy-fire',
  ENEMY_DEATH: 'enemy-death',
  PLAYER_DEATH: 'player-death',
  SHIP_DESTROYED: 'ship-destroyed',
  SCORE_UPDATED: 'score-updated',
  LIVES_UPDATED: 'lives-updated',
  GAME_OVER: 'game-over',
  GRACE_PERIOD_STARTED: 'grace-period-started',
  GRACE_PERIOD_ENDED: 'grace-period-ended',
};
