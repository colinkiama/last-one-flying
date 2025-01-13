import { Scene } from 'phaser';
import { crossSceneEventEmitter } from '../utils/events.js';
import { CrossSceneEvent } from '../constants/events.js';
import { MenuSystem } from '../systems/menuSystem.js';
import { SceneKey } from '../constants/scene.js';

export class GameOver extends Scene {
  /** @type {MenuSystem} */
  _menuSystem;

  constructor() {
    super(SceneKey.GAME_OVER);
  }

  create(data) {
    const { score, oldHighScore, time } = data;
    crossSceneEventEmitter.emit(CrossSceneEvent.PAUSE_GAME);
    this.cameras.main.setBackgroundColor(0xaa000000);
    this._menuSystem = new MenuSystem(this);
    this._menuSystem.start(
      [
        {
          key: 'pause',
          title: {
            type: 'text',
            value: 'Game Over',
          },
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

  async popMenu() {
    await this._menuSystem.pop();
  }
}
