import { Scene } from 'phaser';
import { crossSceneEventEmitter } from '../utils/events.js';
import { CrossSceneEvent } from '../constants/events.js';
import {
  HEALTH_ICON_DIMENSIONS,
  HUD_PADDING,
  PAUSE_BUTTON_DIMENSIONS,
} from '../constants/HUD.js';
import { HealthBar } from '../UI/HealthBar.js';
import { VFXSystem } from '../systems/vfxSystem.js';
import { SceneKey } from '../constants/scene.js';
import { MENU_ITEM_CONFIG } from '../constants/menu.js';
import { RegistryKey } from '../constants/data.js';

export class HUD extends Scene {
  _scoreValueText;
  _pauseButton;
  _healthIcon;
  _healthBar;
  _vfxSystem;
  _highScoreLabelText;

  constructor() {
    super(SceneKey.HUD);
  }

  create(data) {
    const { lives } = data;
    if (!this.anims.exists('flicker')) {
      this.anims.create({
        key: 'flicker',
        frames: this.anims.generateFrameNumbers('health-point', {
          start: 0,
          end: 1,
        }),
        frameRate: 3,
        repeat: -1,
      });
    }

    this._pauseButton = this.add
      .image(
        HUD_PADDING.horizontalPadding + PAUSE_BUTTON_DIMENSIONS.width / 2,
        HUD_PADDING.verticalPadding + PAUSE_BUTTON_DIMENSIONS.height / 2,
        'pause-button',
      )
      .setInteractive(MENU_ITEM_CONFIG);

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
      lives,
    );

    const scoreLabel = this.add
      .text(0, 0, 'Score', {
        fontFamily: 'usuzi',
        fontSize: 16,
        color: '#ffffff',
      })
      .setOrigin(1, 0);
    scoreLabel.x = this.cameras.main.width - HUD_PADDING.horizontalPadding;
    scoreLabel.y = HUD_PADDING.verticalPadding;

    this._scoreValueText = this.add
      .text(
        this.cameras.main.width - HUD_PADDING.horizontalPadding,
        scoreLabel.y + scoreLabel.height,
        '0',
        {
          fontFamily: 'usuzi',
          fontSize: 24,
          color: '#ffffff',
        },
      )
      .setOrigin(1, 0);

    this._highScoreLabelText = this.add
      .text(
        this.cameras.main.width - HUD_PADDING.horizontalPadding,
        this._scoreValueText.y + this._scoreValueText.height,
        'BEST',
        {
          fontFamily: 'usuzi',
          fontSize: 12,
          color: '#ffffff',
        },
      )
      .setVisible(false)
      .setOrigin(1, 0);

    this._vfxSystem = new VFXSystem(this);

    this.subscribeToEvents();
  }

  subscribeToEvents() {
    this._pauseButton.on('pointerup', this.onPause, this);

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

    crossSceneEventEmitter.on(
      CrossSceneEvent.SHAKE_SCREEN,
      this.onScreenShakeRequest,
      this,
    );

    crossSceneEventEmitter.on(
      CrossSceneEvent.SCORE_RESET,
      this.onScoreReset,
      this,
    );

    this.events.once('shutdown', this.unsubscribeFromEvents, this);
  }

  onScoreReset() {
    this._highScoreLabelText.setVisible(false);
  }

  onScreenShakeRequest(screenShakeType) {
    this._vfxSystem.shakeScreen(screenShakeType);
  }

  createLivesTextString(value) {
    return `Lives: ${value ?? 0}`;
  }

  onUpdateScore(nextPointsValue) {
    this._scoreValueText.text = String(nextPointsValue);
    if (this._highScoreLabelText.visible) {
      return;
    }

    const storedHighScore = this.game.registry.get(RegistryKey.HIGH_SCORE);
    if (nextPointsValue > storedHighScore) {
      this._highScoreLabelText.setVisible(true);
    }
  }

  onUpdateLives(nextLivesValue) {
    this._healthBar.setLives(nextLivesValue);
  }

  onPause() {
    this.scene.launch(SceneKey.PAUSE_MENU);
  }

  unsubscribeFromEvents() {
    crossSceneEventEmitter.off(
      CrossSceneEvent.UPDATE_SCORE,
      this.onUpdateScore,
      this,
    );

    crossSceneEventEmitter.off(
      CrossSceneEvent.UPDATE_LIVES,
      this.onUpdateLives,
      this,
    );

    crossSceneEventEmitter.off(
      CrossSceneEvent.SHAKE_SCREEN,
      this.onScreenShakeRequest,
      this,
    );

    this._pauseButton.off('pointerup', this.onPause, this);
    crossSceneEventEmitter.emit(CrossSceneEvent.HUD_DESTROYED);
  }
}
