import { Data, Scene } from 'phaser';
import { WEBSITE_URL } from '../constants/menu.js';
import { SceneKey } from '../constants/scene.js';
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

  create() {
    if (!this._audioSystem.get(AudioKey.MAIN_THEME)?.isPlaying) {
      this._audioSystem.play(AudioKey.MAIN_THEME);
    }

    this._menuSystem = new MenuSystem(this, this.injector);
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
            {
              label: 'Toggle Full Screen',
              action: this.onFullScreenToggle,
            },
            {
              name: 'sound-toggle',
              label: `Sound: ${this.sound.mute ? 'Off' : 'On'}`,
              action: this.onSoundToggle,
            },
            {
              label: 'Controls',
              action: this.showControls,
            },
            {
              label: 'Credits',
              action: this.showCredits,
            },
          ],
          footerItems: [
            {
              label: 'Colin Kiama - 2025',
              action: this.onFooterCreditsClick,
            },
          ],
        },
      ],
      'main-menu',
    );

    this.registry.events.on(Data.Events.CHANGE_DATA, this.onDataChanged, this);

    this.events.once('shutdown', () => {
      this.registry.events.off(
        Data.Events.CHANGE_DATA,
        this.onDataChanged,
        this,
      );
      this._menuSystem.shutDownCurrentMenu();
    });
  }

  showControls() {
    this.scene.start(SceneKey.CONTROLS, {
      returnScene: SceneKey.MAIN_MENU,
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

  onDataChanged(_parent, key, value) {
    switch (key) {
      case RegistryKey.PLAY_SOUND:
        if (value) {
          this.sound.setMute(false);
          this._menuSystem.updateItemText('sound-toggle', 'Sound: On');
        } else {
          this.sound.setMute(true);
          this._menuSystem.updateItemText('sound-toggle', 'Sound: Off');
        }

        break;
      default:
        break;
    }
  }

  onSoundToggle() {
    this.registry.toggle(RegistryKey.PLAY_SOUND);
  }

  onFullScreenToggle() {
    this.scale.toggleFullscreen();
  }

  onFooterCreditsClick() {
    window.open(WEBSITE_URL, '_blank');
  }
}
