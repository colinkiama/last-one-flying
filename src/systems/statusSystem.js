import { gameLogicEventEmitter } from '../utils';
import { GameLogicEvent } from '../constants';

export class StatusSystem {
    _playerLives;

    constructor () {
        this._playerLives = 3;
    }

    loseLife () {
        this.updatePlayerLives(this._playerLives - 1);
    }

    updatePlayerLives (newValue) {
        if (newValue === this._playerLives) {
            return;
        }

        this._playerLives = newValue;
        gameLogicEventEmitter.emit(GameLogicEvent.LIVES_UPDATED, this._playerLives);

        if (this._playerLives > 0) {
            return;
        }
    }
}
