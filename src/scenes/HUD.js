import { Scene } from 'phaser';
import { crossSceneEventEmitter } from '../utils'
import { CrossSceneEvent } from '../constants';

export class HUD extends Scene {
    _scoreValueText;
    _livesText;

    constructor () {
        super('HUD');
    }

    create (data) {
        const { lives } = data;
        crossSceneEventEmitter.on(CrossSceneEvent.UPDATE_SCORE, this.onUpdateScore, this);
        crossSceneEventEmitter.on(CrossSceneEvent.UPDATE_LIVES, this.onUpdateLives, this);
        this._score = 0;
        this._livesText = this.add.text(20, 20, this.createLivesTextString(lives));
        this.add.text (20, 50, 'Score');
        this._scoreValueText = this.add.text (20, 70, '0');
    }

    createLivesTextString(value) {
        return `Lives: ${value ?? 0}`;
    }

    onUpdateScore (nextPointsValue) {
        this._scoreValueText.text = String(nextPointsValue);
    }

    onUpdateLives (nextLivesValue) {
        this._livesText.text = this.createLivesTextString(String(nextLivesValue));
    }
}
