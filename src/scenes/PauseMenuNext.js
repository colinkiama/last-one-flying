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
              action: () => {
                crossSceneEventEmitter.emit(CrossSceneEvent.RESUME_GAME);
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
      ],
      'pause',
    );
  }
}
