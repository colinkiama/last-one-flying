import { Scene } from 'phaser';
import { crossSceneEventEmitter } from '../utils/events.js';
import { CrossSceneEvent } from '../constants/events.js';
import { MenuSystem } from '../systems/menuSystem.js';
import { SceneKey } from '../constants/scene.js';
import { COLORS } from '../constants/menu.js';

export class GameOver extends Scene {
  /** @type {MenuSystem} */
  _menuSystem;

  constructor() {
    super(SceneKey.GAME_OVER);
  }

  create(data) {
    const { score, time, oldHighScore } = data;
    crossSceneEventEmitter.emit(CrossSceneEvent.PAUSE_GAME);
    this.cameras.main.setBackgroundColor(0xaa000000);
    const statsContainer = this.add.container();
    statsContainer.add(this._renderStats(data));
    this._menuSystem = new MenuSystem(this);
    this._menuSystem.start(
      [
        {
          key: 'pause',
          title: {
            type: 'text',
            value: 'Game Over',
          },
          customContent: statsContainer,
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
  }

  resetGame() {
    this._menuSystem.shutDownCurrentMenu();
    crossSceneEventEmitter.emit(CrossSceneEvent.RESET_GAME);
    this.scene.stop(this);
  }

  quitGame() {
    this._menuSystem.shutDownCurrentMenu();
    crossSceneEventEmitter.emit(CrossSceneEvent.QUIT_GAME);
    this.scene.stop(this);
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
    renderedItems.push(...renderedScore);
    lastRenderedItem = renderedScore[renderedScore.length - 1];

    // 2. Render Time

    // 3. Render High Score (TODO: Introduce a delay and an explosion effect when player gets new high score!)

    return renderedItems;
  }

  _renderStatItem(item, options) {
    const localOptions = options || {};
    const { lastRenderedItem = null } = localOptions;
    const y = lastRenderedItem
      ? lastRenderedItem.y + lastRenderedItem.height / 2 + 24
      : 0;

    const statLabel = this.add
      .text(this.cameras.main.width / 2, y, item.label, {
        fontFamily: 'usuzi',
        fontSize: 24,
        color: COLORS.foreground,
      })
      .setOrigin(0.5, 0);

    const statValue = this.add
      .text(
        this.cameras.main.width / 2,
        statLabel.y + statLabel.height / 2 + 12,
        item.value,
        {
          fontFamily: 'usuzi',
          fontSize: 32,
          color: COLORS.foreground,
        },
      )
      .setOrigin(0.5, 0);

    return [statLabel, statValue];
  }

  async popMenu() {
    await this._menuSystem.pop();
  }
}
