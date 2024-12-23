import { gameLogicEventEmitter } from '../utils/events.js';
import { GameLogicEvent } from '../constants/events.js';

export class StatusSystem {
  _playerLives;
  _startingLives;

  constructor(lives) {
    this._startingLives = lives;
    this._playerLives = lives;
  }

  loseLife() {
    this.updatePlayerLives(this._playerLives - 1);
  }

  updatePlayerLives(newValue) {
    if (newValue === this._playerLives) {
      return;
    }

    this._playerLives = newValue;
    gameLogicEventEmitter.emit(GameLogicEvent.LIVES_UPDATED, this._playerLives);

    if (this._playerLives > 0) {
      return;
    }

    gameLogicEventEmitter.emit(GameLogicEvent.GAME_OVER);
  }

  reset() {
    this.updatePlayerLives(this._startingLives);
  }

  getLives() {
    return this._playerLives;
  }
}
