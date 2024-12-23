import { Scene, Display } from 'phaser';
import { crossSceneEventEmitter } from '../utils/events.js';
import { CrossSceneEvent } from '../constants/events.js';
import {
  HEALTH_ICON_DIMENSIONS,
  HUD_PADDING,
  PAUSE_BUTTON_DIMENSIONS,
} from '../constants/HUD.js';
import { HealthBar } from '../UI/HealthBar.js';

export class HUD extends Scene {
  _scoreValueText;
  _pauseButton;
  _healthIcon;
  _healthBar;

  constructor() {
    super('HUD');
  }

  create(data) {
    const { lives } = data;
    crossSceneEventEmitter.on(
      CrossSceneEvent.UPDATE_SCORE,
      this.onUpdateScore,
      this,
    );
    crossSceneEventEmitter.on(
      CrossSceneEvent.UPDATE_LIVES,
      this.onUpdateLives,
      this,
    );
    // TODO: Make screen shake also occur in HUD.
    // Pass the intensity values into the HUD via crossSceneEventEmitter so screen shake
    // can also effect the HUD
    this._score = 0;
    this.anims.create({
      key: 'flicker',
      frames: this.anims.generateFrameNumbers('health-point', {
        start: 0,
        end: 1,
      }),
      frameRate: 3,
      repeat: -1,
    });

    this._pauseButton = this.add.image(
      HUD_PADDING.horizontalPadding + PAUSE_BUTTON_DIMENSIONS.width / 2,
      HUD_PADDING.verticalPadding + PAUSE_BUTTON_DIMENSIONS.height / 2,
      'pause-button',
    );
    this._healthIcon = this.add.image(
      this._pauseButton.x +
        PAUSE_BUTTON_DIMENSIONS.width / 2 +
        HEALTH_ICON_DIMENSIONS.horizontalMargin +
        HEALTH_ICON_DIMENSIONS.width / 2,
      this._pauseButton.y,
      'health-icon',
    );

    this._healthBar = new HealthBar(
      this,
      this._healthIcon.x +
        HEALTH_ICON_DIMENSIONS.width / 2 +
        HEALTH_ICON_DIMENSIONS.horizontalMargin,
      this._pauseButton.y,
    );

    const scoreLabel = this.add
      .bitmapText(0, 0, 'font', 'Score', 14, 2)
      .setOrigin(1, 0);
    scoreLabel.x = this.cameras.main.width - HUD_PADDING.horizontalPadding;
    scoreLabel.y = HUD_PADDING.verticalPadding;

    this._scoreValueText = this.add
      .bitmapText(0, 0, 'font', '0', 18, 2)
      .setOrigin(1, 0);
    this._scoreValueText.x =
      this.cameras.main.width - HUD_PADDING.horizontalPadding;
    this._scoreValueText.y = scoreLabel.y + scoreLabel.height / 2 + 8;
  }

  createLivesTextString(value) {
    return `Lives: ${value ?? 0}`;
  }

  onUpdateScore(nextPointsValue) {
    this._scoreValueText.text = String(nextPointsValue);
  }

  onUpdateLives(nextLivesValue) {
    this._healthBar.setLives(nextLivesValue);
  }

  reset() {
    this._healthBar.reset();
  }
}
