import { Data, Scene } from 'phaser';
import { crossSceneEventEmitter } from '../utils/events.js';
import { CrossSceneEvent } from '../constants/events.js';
import { MenuSystem } from '../systems/menuSystem.js';
import { SceneKey } from '../constants/scene.js';
import { RegistryKey } from '../constants/data.js';

export class PauseMenu extends Scene {
  injector;
  /** @type {MenuSystem} */
  _menuSystem;
  _audioSystem;

  constructor() {
    super(SceneKey.PAUSE_MENU);
  }

  create(data) {
    if (!data.isReturning) {
      crossSceneEventEmitter.emit(CrossSceneEvent.PAUSE_GAME);
    }

    this.cameras.main.setBackgroundColor(0xaa000000);
    this._menuSystem = new MenuSystem(this, this.injector);
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
              action: this.onFullScreenToggle,
            },
            {
              label: 'Controls',
              action: this.showControls,
            },
            {
              name: 'sound-toggle',
              label: `Sound: ${this.sound.mute ? 'Off' : 'On'}`,
              action: this.onSoundToggle,
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
      returnScene: SceneKey.PAUSE_MENU,
    });
  }

  resumeGame() {
    this._menuSystem.shutDownCurrentMenu();
    crossSceneEventEmitter.emit(CrossSceneEvent.RESUME_GAME);
    this.scene.stop(this);
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
