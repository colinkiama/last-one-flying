import { gameLogicEventEmitter } from '../utils/events.js';
import { GameLogicEvent } from '../constants/events.js';
import { ScoreUpdateType } from '../constants/score.js';

export class ScoreSystem {
  _score;

  constructor() {
    this._score = 0;
  }

  update(updateType) {
    const oldScore = this._score;
    switch (updateType) {
      case ScoreUpdateType.ENEMY_HIT:
        this._score += 100;
        break;
      case ScoreUpdateType.RESET:
        this._score = 0;
        break;
      default:
        throw new Error(`Score update type '${updateType}' is not recognised'`);
    }

    if (oldScore === this._score) {
      return;
    }

    gameLogicEventEmitter.emit(GameLogicEvent.SCORE_UPDATED, this._score);
  }

  reset() {
    this.update(ScoreUpdateType.RESET);
  }

  getScore() {
    return this._score;
  }
}
