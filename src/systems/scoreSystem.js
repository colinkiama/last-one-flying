import { gameLogicEventEmitter } from '../utils';
import { GameLogicEvent, ScoreUpdateType } from '../constants';

export class ScoreSystem {
    _score;

    constructor () {
        this._score = 0;
    }

    update (updateType) {
        const oldScore = this._score;
        switch (updateType) {
            case ScoreUpdateType.ENEMY_HIT:
                this._score += 100;
                break;
            default:
                throw new Error(`Score update type '${updateType}' is not recognised'`);
        }

        if (oldScore === this._score) {
            return;
        }

        gameLogicEventEmitter.emit(GameLogicEvent.SCORE_UPDATED, this._score);
    }

    reset () {
        this._score = 0;
        gameLogicEventEmitter.emit(GameLogicEvent.SCORE_UPDATED, this._score);
    }

    getScore () {
        return this._score;
    }
}
