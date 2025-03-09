import { Scene } from 'phaser';
import { crossSceneEventEmitter } from '../utils/events.js';
import { CrossSceneEvent } from '../constants/events.js';
import { MenuSystem } from '../systems/menuSystem.js';
import { SceneKey } from '../constants/scene.js';

export class PauseMenu extends Scene {
  /** @type {MenuSystem} */
  _menuSystem;

  constructor() {
    super(SceneKey.PAUSE_MENU);
  }

  create() {
    crossSceneEventEmitter.emit(CrossSceneEvent.PAUSE_GAME);
    this.cameras.main.setBackgroundColor(0xaa000000);
    this._menuSystem = new MenuSystem(this);
    this._menuSystem.start(
      [
        {
          key: 'pause',
          title: {
            type: 'text',
            value: 'Game Paused',
          },
          items: [
            {
              label: 'Resume',
              action: this.resumeGame,
            },
            {
              label: 'Toggle Full Screen',
              action: this.onFullScreenToggle
            },
            {
              label: 'Sound: On',
            },
            {
              label: 'Back To Main Menu',
              action: this.showQuitGameConfirmation,
            },
          ],
        },
        {
          key: 'quit-game-confirmation',
          title: { type: 'text', value: 'All Progress Will Be Lost!' },
          parent: 'pause',
          summary: 'Are you sure?',
          items: [
            {
              label: 'no',
              action: this.popMenu,
            },
            {
              label: 'yes',
              action: this.quitGame,
            },
          ],
        },
      ],
      'pause',
    );

    this.input.keyboard.once('keyup-P', () => {
      this.resumeGame();
    });
  }

  resumeGame() {
    this._menuSystem.shutDownCurrentMenu();
    crossSceneEventEmitter.emit(CrossSceneEvent.RESUME_GAME);
    this.scene.stop(this);
  }

  onFullScreenToggle() {
    this.scale.toggleFullscreen();
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
