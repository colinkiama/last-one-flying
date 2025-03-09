import { Scene } from 'phaser';
import { crossSceneEventEmitter } from '../utils/events.js';
import { CrossSceneEvent } from '../constants/events.js';
import { MenuSystem } from '../systems/menuSystem.js';
import { SceneKey } from '../constants/scene.js';
import { COLORS } from '../constants/menu.js';
import { Explosion } from '../poolObjects/Explosion.js';
import { VFXSystem } from '../systems/vfxSystem.js';
import { DependencyKey } from '../constants/injector.js';
import { SoundFXKey } from '../constants/audio.js';
import { ScreenShakeType } from '../constants/vfx.js';

export class GameOver extends Scene {
  injector;
  _audioSystem;
  /** @type {MenuSystem} */
  _menuSystem;
  _renderedStatsObjects;
  _tweenTimeline;
  _explosionPool;
  _vfxSystem;
  _statsContainer;
  _newHighScoreBlinkTimer;

  constructor() {
    super(SceneKey.GAME_OVER);
  }

  setupDependencies() {
    this._audioSystem = this.injector.get(DependencyKey.AUDIO_SYSTEM);
  }

  create(data) {
    const { score, time, oldHighScore } = data;
    crossSceneEventEmitter.emit(CrossSceneEvent.PAUSE_GAME);
    this._explosionPool = this.add.group({
      classType: Explosion,
      maxSize: 1,
      runChildUpdate: true,
    });

    this._vfxSystem = new VFXSystem(this, {
      explosionPool: this._explosionPool,
    });

    this.cameras.main.setBackgroundColor(0xaa000000);
    this._renderedStatsObjects = {};
    this._statsContainer = this.add.container();
    this._statsContainer.add(this._renderStats(data));

    const isNewHighScore = score > oldHighScore;

    this._menuSystem = new MenuSystem(this);
    this._menuSystem.start(
      [
        {
          key: 'pause',
          title: {
            type: 'text',
            value: 'Game Over',
          },
          customContent: this._statsContainer,
          items: [
            {
              label: 'Play Again',
              action: this.resetGame,
            },
            {
              label: 'Back To Main Menu',
              action: this.quitGame,
            },
          ],
        },
      ],
      'pause',
    );

    const timeline = this.add.timeline([
      {
        at: 500,
        run: () => {
          this._audioSystem.playSFX(SoundFXKey.STAT_REVEAL);
          this.revealStat('score');
        },
      },
      {
        at: 1250,
        run: () => {
          this._audioSystem.playSFX(SoundFXKey.STAT_REVEAL);
          this.revealStat('time');
        },
      },
      isNewHighScore
        ? {
            at: 2750,
            run: () => {
              this._vfxSystem.shakeScreen(ScreenShakeType.HIGH_SCORE);
              crossSceneEventEmitter.emit(CrossSceneEvent.NEW_HIGH_SCORE_REVEAL);
              this._audioSystem.playSFX(SoundFXKey.EXPLOSION);
              this.revealStat('highScore', {
                showExplosion: true,
                showNewHighScoreLabel: true,
              });
            },
          }
        : {
            at: 2000,
            run: () => {
              this._audioSystem.playSFX(SoundFXKey.STAT_REVEAL);
              this.revealStat('highScore');
            },
          },
    ]);

    timeline.play();
  }

  revealStat(key, options) {
    const localOptions = options || {};
    const { showExplosion = false, showNewHighScoreLabel = false } =
      localOptions;
    const items = this._renderedStatsObjects[key];
    if (!items) {
      return;
    }

    if (showExplosion) {
      const firstItem = items[0];
      this._vfxSystem.createFireworkExplosion(
        firstItem.x,
        firstItem.y + firstItem.height + this._statsContainer.getBounds().top,
      );
    }

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (i === 2 && showNewHighScoreLabel) {
        continue;
      }

      item.setVisible(true);
    }

    if (showNewHighScoreLabel) {
      const newHighScoreLabel = items[2];
      this._newHighScoreBlinkTimer = this.time.addEvent({
        delay: 500,
        callback: () =>
          newHighScoreLabel.setVisible(!newHighScoreLabel.visible),
        loop: true,
      });
    }
  }

  resetGame() {
    this.unsubscribeFromEvents();
    this._menuSystem.shutDownCurrentMenu();
    crossSceneEventEmitter.emit(CrossSceneEvent.RESET_GAME);
    this.scene.stop(this);
  }

  quitGame() {
    this.unsubscribeFromEvents();
    this._menuSystem.shutDownCurrentMenu();
    crossSceneEventEmitter.emit(CrossSceneEvent.QUIT_GAME);
    this.scene.stop(this);
  }

  unsubscribeFromEvents() {
    if (this._newHighScoreBlinkTimer) {
      this.time.removeEvent(this._newHighScoreBlinkTimer.remove());
    }
  }

  showQuitGameConfirmation() {
    this._menuSystem.push('quit-game-confirmation');
  }

  _renderStats(stats) {
    const { score, time, oldHighScore } = stats;
    let lastRenderedItem = null;
    const renderedItems = [];

    // 1. Render Score
    const renderedScore = this._renderStatItem({
      label: 'Score',
      value: score,
    });

    this._renderedStatsObjects.score = renderedScore;
    renderedItems.push(...renderedScore);
    lastRenderedItem = renderedScore[renderedScore.length - 1];

    // 2. Render Time
    const renderedTime = this._renderStatItem(
      {
        label: 'Time',
        value: time,
      },
      {
        lastRenderedItem,
      },
    );

    this._renderedStatsObjects.time = renderedTime;
    renderedItems.push(...renderedTime);
    lastRenderedItem = renderedTime[renderedTime.length - 1];

    // 3. Render High Score
    const renderedHighScore = this._renderStatItem(
      {
        label: 'High Score',
        value: Math.max(score, oldHighScore),
      },
      {
        lastRenderedItem,
        isHighScore: score > oldHighScore,
      },
    );

    this._renderedStatsObjects.highScore = renderedHighScore;
    renderedItems.push(...renderedHighScore);
    lastRenderedItem = renderedHighScore[renderedHighScore.length - 1];

    return renderedItems;
  }

  _renderStatItem(item, options) {
    const localOptions = options || {};
    const { lastRenderedItem = null, isHighScore = false } = localOptions;
    const y = lastRenderedItem
      ? lastRenderedItem.y + lastRenderedItem.height + 12
      : 0;

    const statLabel = this.add
      .text(this.cameras.main.width / 2, y, item.label, {
        fontFamily: 'usuzi',
        fontSize: 20,
        color: COLORS.foreground,
      })
      .setVisible(false)
      .setOrigin(0.5, 0);

    const statValue = this.add
      .text(
        this.cameras.main.width / 2,
        statLabel.y + statLabel.height,
        item.value,
        {
          fontFamily: 'usuzi',
          fontSize: 24,
          color: COLORS.foreground,
        },
      )
      .setVisible(false)
      .setOrigin(0.5, 0);

    let newLabel = null;
    if (isHighScore) {
      newLabel = this.add
        .text(
          this.cameras.main.width / 2,
          statValue.y + statValue.height + 2,
          'NEW',
          {
            fontFamily: 'usuzi',
            fontSize: 12,
            color: COLORS.foreground,
          },
        )
        .setVisible(false)
        .setOrigin(0.5, 0);
    }

    return [statLabel, statValue, newLabel].filter((item) => !!item);
  }

  async popMenu() {
    await this._menuSystem.pop();
  }
}
