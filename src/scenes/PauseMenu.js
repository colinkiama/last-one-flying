import { Scene } from 'phaser';
import {
  COLORS,
  WEBSITE_URL,
  MENU_ITEM_CONFIG,
  HOVER_TWEEN_CONFIG,
} from '../constants/menu.js';

import { crossSceneEventEmitter } from '../utils/events.js';
import { CrossSceneEvent } from '../constants/events.js';
import { MenuSystem } from '../systems/menuSystem.js';

export class PauseMenu extends Scene {
  /** @type {MenuSystem} */
  _menuSystem;

  constructor() {
    super('PauseMenu');
  }

  create() {
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
  }

  resumeGame() {
    crossSceneEventEmitter.emit(CrossSceneEvent.RESUME_GAME);
    this.scene.stop(this);
  }

  quitGame() {
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
