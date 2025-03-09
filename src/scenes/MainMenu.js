import { Scene } from 'phaser';
import {
  COLORS,
  WEBSITE_URL,
  MENU_ITEM_CONFIG,
  HOVER_TWEEN_CONFIG,
} from '../constants/menu.js';
import { SceneKey } from '../constants/scene.js';
import { onButtonHover, onButtonOut } from '../utils/ui.js';
import { RegistryKey } from '../constants/data.js';
import { DependencyKey } from '../constants/injector.js';
import { AudioKey } from '../constants/audio.js';
import { MenuSystem } from '../systems/menuSystem.js';

export class MainMenu extends Scene {
  injector;
  _audioSystem;
  /** @type {MenuSystem} */
  _menuSystem;

  constructor() {
    super(SceneKey.MAIN_MENU);
  }

  setupDependencies() {
    this._audioSystem = this.injector.get(DependencyKey.AUDIO_SYSTEM);
  }

  create(data) {
    if (
      data.playMusic &&
      !this._audioSystem.get(AudioKey.MAIN_THEME)?.isPlaying
    ) {
      this._audioSystem.play(AudioKey.MAIN_THEME);
    }

    this._menuSystem = new MenuSystem(this);
    this._menuSystem.start(
      [
        {
          key: 'main-menu',
          title: {
            type: 'image',
            value: 'logo',
          },
          items: [
            {
              label: 'Play',
              action: this.startNewGame,
            },
            // // TODO: Set text based on sound playback prefernce value
            // // in local storage
            {
              label: 'Sound: On',
              action: this.onSoundToggle,
            },
            {
              label: 'Credits',
              action: this.showCredits,
            },
          ],
          footerItems: [
            {
              label: 'Colin Kiama - 2025',
              action: onFooterCreditsClick,
            },
          ],
        },
      ],
      'main-menu',
    );

    this.events.once('shutdown', () => {
      this._menuSystem.shutDownCurrentMenu();
    });
  }
  showCredits() {
    this.scene.start(SceneKey.CREDITS);
  }

  startNewGame() {
    if (this._audioSystem.get(AudioKey.MAIN_THEME)?.isPlaying) {
      this._audioSystem.stop(AudioKey.MAIN_THEME);
    }

    this.scene.start(SceneKey.BATTLE);
  }

  onSoundToggle() {
    // TODO:
    // - Set sound playback preference in local storage
    // - Update soundToggle button text to either "Sound: On" or "Sound: Off"
    //   based on the current sound playback preference value
  }
}

function onFooterCreditsClick() {
  window.open(WEBSITE_URL, '_blank');
}
