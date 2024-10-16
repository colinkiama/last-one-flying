import { Scene } from 'phaser';
import { crossSceneEventEmitter } from '../utils'
import { CrossSceneEvent } from '../constants';

export class HUD extends Scene {
    _scoreValueText;

    constructor () {
        super('HUD');
    }

    create () {
        this._score = 0;
        this.add.text (20, 20, 'Score');
        this._scoreValueText = this.add.text (20, 40, '0');
        crossSceneEventEmitter.on(CrossSceneEvent.UPDATE_SCORE, this.incrementPoints, this);
    }

    incrementPoints (nextPointsValue) {
        this._scoreValueText.text = String(nextPointsValue);
    }
}
