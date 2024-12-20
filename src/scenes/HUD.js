import { Scene } from 'phaser';
import { crossSceneEventEmitter } from '../utils'
import { 
    CrossSceneEvent,
    HEALTH_ICON_DIMENSIONS,
    HUD_PADDING,
    PAUSE_BUTTON_DIMENSIONS
} from '../constants';

export class HUD extends Scene {
    _scoreValueText;
    _livesText;
    _pauseButton;
    _healthIcon;
    _healthPoints;

    constructor() {
        super('HUD');
    }

    create(data) {
        const { lives } = data;
        crossSceneEventEmitter.on(CrossSceneEvent.UPDATE_SCORE, this.onUpdateScore, this);
        crossSceneEventEmitter.on(CrossSceneEvent.UPDATE_LIVES, this.onUpdateLives, this);
        this._score = 0;
        // this._livesText = this.add.text(20, 20, this.createLivesTextString(lives));
        // this.add.text (20, 50, 'Score');
        // this._scoreValueText = this.add.text (20, 70, '0');
        
        this._pauseButton = this.add.image(
            PAUSE_BUTTON_DIMENSIONS.width / 2 + HUD_PADDING.horizontalPadding,
            PAUSE_BUTTON_DIMENSIONS.height / 2 + HUD_PADDING.verticalPadding,
            'pause-button'
        );
        this._healthIcon = this.add.image(
            this._pauseButton.x + PAUSE_BUTTON_DIMENSIONS.horizontalMargin + HEALTH_ICON_DIMENSIONS.width,
            this._pauseButton.y,
            'health-icon'
        );

        this.anims.create({
            key: 'blink',
            frames: this.anims.generateFrameNumbers('health-point', { start: 0, end: 1 }),
            frameRate: 3,
            repeat: -1
        });
    }

    createLivesTextString(value) {
        return `Lives: ${value ?? 0}`;
    }

    onUpdateScore(nextPointsValue) {
        // this._scoreValueText.text = String(nextPointsValue);
    }

    onUpdateLives(nextLivesValue) {
        // this._livesText.text = this.createLivesTextString(String(nextLivesValue));
    }
}
