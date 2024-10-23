import { gameLogicEventEmitter } from '../utils';
import { GameLogicEvent, STARTING_LIVES } from '../constants';

export class StatusSystem {
    _playerLives;

    constructor () {
        this._playerLives = STARTING_LIVES;
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

        gameLogicEventEmitter.emit(GameLogicEvent.GAME_OVER);
    }

    reset () {
        this.updatePlayerLives(STARTING_LIVES);
    }

    getLives () {
        return this._playerLives;
    }
}
