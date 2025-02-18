import { Scene } from 'phaser';
import { SceneKey } from '../constants/scene.js';
import { LocalStorageKey, RegistryKey } from '../constants/data.js';
import { COLORS, MENU_ITEM_CONFIG } from '../constants/menu.js';
import { onButtonHover, onButtonOut } from '../utils/ui.js';

const PROGRESS_BAR_WIDTH = 300;
const PROGRESS_BAR_HEIGHT = 32;
const SCENES_TO_LOAD = [
  'MainMenu',
  'Battle',
  'HUD',
  'PauseMenu',
  'GameOver',
  'Credits',
];

export class Preloader extends Scene {
  sceneImports;
  sceneLoaderPromise;
  playButton;

  constructor() {
    super('Preloader');
  }

  init() {
    //  A simple progress bar. This is the outline of the bar.

    const progressBarX = this.cameras.main.width / 2;
    const progressBarY = this.cameras.main.height / 2;
    this.add
      .rectangle(
        progressBarX,
        progressBarY,
        PROGRESS_BAR_WIDTH,
        PROGRESS_BAR_HEIGHT,
      )
      .setStrokeStyle(1, 0xffffff);

    //  This is the progress bar itself. It will increase in size from the left based on the % of progress.
    const bar = this.add.rectangle(
      progressBarX - PROGRESS_BAR_WIDTH / 2 + 1,
      progressBarY,
      0,
      PROGRESS_BAR_HEIGHT - 3,
      0xffffff,
    );

    //  Use the 'progress' event emitted by the LoaderPlugin to update the loading bar
    this.load.on('progress', (progress) => {
      //  Update the progress bar (our bar is 464px wide, so 100% = 464px)
      bar.width = (PROGRESS_BAR_WIDTH - 3) * progress;
    });

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
    this.load.audio('main-theme', [
      'audio/main-theme.opus',
      'audio/main-theme.ogg',
      'audio/main-theme.mp3',
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

    this.game.registry.set(RegistryKey.HIGH_SCORE, storedHighScore ?? 0);

    //  When all the assets have loaded, it's often worth creating global objects here that the rest of the game can use.
    //  For example, you can define global animations here, so we can use them in other scenes.

    //  Move to the MainMenu. You could also swap this for a Scene Transition, such as a camera fade.
    // this.scene.start('MainMenu');

    const playButtonX = this.cameras.main.width / 2;
    const playButtonY = this.cameras.main.height / 2;

    WebFont.load({
      custom: {
        families: ['usuzi'],
      },
      active: async () => {
        const importResults = await this.sceneLoaderPromise;
        SCENES_TO_LOAD.map((sceneName, i) => {
          const loadedModule = importResults[i];
          this.scene.add(sceneName, loadedModule[sceneName]);
        });

        this.playButton = this.add
          .text(playButtonX, playButtonY + PROGRESS_BAR_HEIGHT + 16, 'PLAY', {
            fontSize: 24,
            color: COLORS.foreground,
            fontFamily: 'usuzi',
          })
          .setOrigin(0.5, 0.5)
          .setInteractive(MENU_ITEM_CONFIG)
          .setVisible(true)
          .on('pointerover', onButtonHover)
          .on('pointerout', onButtonOut)
          .on('pointerup', () => this.scene.start(SceneKey.MAIN_MENU));
      },
    });
  }
}
