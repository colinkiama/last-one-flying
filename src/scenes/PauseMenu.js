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
  _menuSystem;

  constructor() {
    super('PauseMenu');
  }

  create() {
    this._menuSystem = new MenuSystem(
      this,
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
              action: {
                type: 'custom',
                value: resumeGame,
              },
            },
            {
              label: 'Sound: On',
            },
            {
              label: 'Back To Main Menu',
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
            },
          ],
        },
      ],
      'pause',
    );
  }
}

function resumeGame() {
  crossSceneEventEmitter.emit(CrossSceneEvent.RESUME_GAME);
  this.scene.stop(this);
}
