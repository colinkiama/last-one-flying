import { Scene } from 'phaser';
import { SceneKey } from '../constants/scene.js';
import { LocalStorageKey, RegistryKey } from '../constants/data.js';
import { MenuSystem } from '../systems/menuSystem.js';
import { Injector } from '../utils/injector.js';
import { DependencyKey } from '../constants/injector.js';
import { AudioKey, SoundFXKey } from '../constants/audio.js';

const PROGRESS_BAR_WIDTH = 300;
const PROGRESS_BAR_HEIGHT = 32;
const SCENES_TO_LOAD = [
  'MainMenu',
  'Battle',
  'HUD',
  'PauseMenu',
  'GameOver',
  'Credits',
  'Controls',
];

let dependencyInjector;

export class Preloader extends Scene {
  sceneImports;
  sceneLoaderPromise;
  playButton;
  progressBar;
  progressBarFill;

  /** @type {MenuSystem} */
  _menuSystem;

  constructor() {
    super('Preloader');
  }

  init() {
    //  A simple progress bar. This is the outline of the bar.

    const progressBarX = this.cameras.main.width / 2;
    const progressBarY = this.cameras.main.height / 2;
    this.progressBar = this.add
      .rectangle(
        progressBarX,
        progressBarY,
        PROGRESS_BAR_WIDTH,
        PROGRESS_BAR_HEIGHT,
      )
      .setStrokeStyle(1, 0xffffff);

    //  This is the progress bar itself. It will increase in size from the left based on the % of progress.
    this.progressBarFill = this.add.rectangle(
      progressBarX - PROGRESS_BAR_WIDTH / 2 + 1,
      progressBarY,
      0,
      PROGRESS_BAR_HEIGHT - 3,
      0xffffff,
    );

    //  Use the 'progress' event emitted by the LoaderPlugin to update the loading bar
    this.load.on('progress', (progress) => {
      //  Update the progress bar (our bar is 464px wide, so 100% = 464px)
      this.progressBarFill.width = (PROGRESS_BAR_WIDTH - 3) * progress;
    });

    dependencyInjector = new Injector();

    //  Inject our CSS (for Usuzi Font)
    const element = document.createElement('style');
    document.head.appendChild(element);
    const sheet = element.sheet;
    const styles =
      '@font-face { font-family: "usuzi"; src: url("assets/fonts/usuzi.woff2") format("woff"); }\n';
    sheet.insertRule(styles, 0);
  }

  preload() {
    this.load.script('webfont', 'vendor/webfontloader.js');

    //  Load the assets for the game - Replace with your own assets
    this.load.setPath('assets');
    this.load.audio(AudioKey.MAIN_THEME, [
      'audio/main-theme.opus',
      'audio/main-theme.ogg',
      'audio/main-theme.mp3',
    ]);

    this.load.audio(AudioKey.BATTLE_THEME, [
      'audio/battle-theme.opus',
      'audio/battle-theme.mp3',
    ]);

    this.load.audio(AudioKey.LOW_HEALTH_WARNING, [
      'audio/low-health-warning.opus',
      'audio/low-health-warning.mp3',
    ]);

    this.load.audio(SoundFXKey.EXPLOSION, [
      'audio/explosion.opus',
      'audio/explosion.mp3',
    ]);

    this.load.audio(SoundFXKey.ENEMY_LASER_FIRE, [
      'audio/enemy-laser.opus',
      'audio/enemy-laser.mp3',
    ]);

    this.load.audio(SoundFXKey.PLAYER_LASER_FIRE, [
      'audio/player-laser.opus',
      'audio/player-laser.mp3',
    ]);

    this.load.audio(SoundFXKey.STAT_REVEAL, [
      'audio/stat-reveal.opus',
      'audio/stat-reveal.mp3',
    ]);

    this.load.audio(SoundFXKey.ITEM_HOVER, [
      'audio/item-hover.opus',
      'audio/item-hover.mp3',
    ]);

    this.load.audio(SoundFXKey.ITEM_SELECTION, [
      'audio/item-selection.opus',
      'audio/item-selection.mp3',
    ]);

    this.load.image('logo', 'last-one-flying-logo.png');
    this.load.image('player', 'player.png');
    this.load.image('player-laser-beam', 'player-laser-beam.png');
    this.load.image('enemy-laser-beam', 'enemy-laser-beam.png');
    this.load.image('explosion', 'explosion.png');
    this.load.image('basic-enemy', 'basic-enemy.png');
    this.load.image('health-icon', 'health-icon.png');
    this.load.image('pause-button', 'pause-button.png');

    this.load.spritesheet('health-point', 'health-point.png', {
      frameWidth: 53,
      frameHeight: 32,
    });

    this.sceneImports = [];
    SCENES_TO_LOAD.map((sceneName) =>
      this.sceneImports.push(import(`../scenes/${sceneName}.js`)),
    );
    this.sceneLoaderPromise = Promise.all(this.sceneImports);
  }

  create() {
    const storedHighScore = window.localStorage.getItem(
      LocalStorageKey.HIGH_SCORE,
    );

    this.registry.set(RegistryKey.HIGH_SCORE, storedHighScore ?? 0);

    //  When all the assets have loaded, it's often worth creating global objects here that the rest of the game can use.
    //  For example, you can define global animations here, so we can use them in other scenes.

    WebFont.load({
      custom: {
        families: ['usuzi'],
      },
      active: async () => {
        const { AudioSystem } = await import('../systems/audioSystem.js');
        dependencyInjector.register(
          DependencyKey.AUDIO_SYSTEM,
          new AudioSystem(this.sound),
        );

        const importResults = await this.sceneLoaderPromise;
        SCENES_TO_LOAD.map((sceneName, i) => {
          const loadedModule = importResults[i];
          const addedScene = this.scene.add(sceneName, loadedModule[sceneName]);
          addedScene.injector = dependencyInjector;

          if (addedScene.setupDependencies) {
            addedScene.setupDependencies();
          }
        });

        this.progressBar.setVisible(false);
        this.progressBarFill.setVisible(false);

        this._menuSystem = new MenuSystem(this, dependencyInjector, {
          muted: true,
        });
        this._menuSystem.start(
          [
            {
              key: 'sound-preference',
              title: {
                type: 'text',
                value: 'Play Sound?',
              },
              items: [
                {
                  label: 'Yes',
                  action: this.startGameWithSound,
                },
                {
                  label: 'No',
                  action: this.startGameMuted,
                },
              ],
            },
          ],
          'sound-preference',
        );
      },
    });
  }

  startGameWithSound() {
    this.registry.set(RegistryKey.PLAY_SOUND, true);
    this.scene.start(SceneKey.MAIN_MENU);
  }

  startGameMuted() {
    this.registry.set(RegistryKey.PLAY_SOUND, false);
    this.sound.setMute(true);
    this.scene.start(SceneKey.MAIN_MENU);
  }
}
