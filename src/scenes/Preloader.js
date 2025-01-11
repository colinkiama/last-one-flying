import { Scene, GameObjects } from 'phaser';
import { SceneKey } from '../constants/scene.js';

export class Preloader extends Scene {
  constructor() {
    super('Preloader');
  }

  init() {
    //  Inject our CSS (for Usuzi Font)
    const element = document.createElement('style');
    document.head.appendChild(element);
    const sheet = element.sheet;
    const styles =
      '@font-face { font-family: "usuzi"; src: url("assets/fonts/usuzi.woff2") format("woff"); }\n';
    sheet.insertRule(styles, 0);

    //  A simple progress bar. This is the outline of the bar.
    this.add.rectangle(512, 384, 468, 32).setStrokeStyle(1, 0xffffff);

    //  This is the progress bar itself. It will increase in size from the left based on the % of progress.
    const bar = this.add.rectangle(512 - 230, 384, 4, 28, 0xffffff);

    //  Use the 'progress' event emitted by the LoaderPlugin to update the loading bar
    this.load.on('progress', (progress) => {
      //  Update the progress bar (our bar is 464px wide, so 100% = 464px)
      bar.width = 4 + 460 * progress;
    });
  }

  preload() {
    this.load.script('webfont', 'vendor/webfontloader.js');

    //  Load the assets for the game - Replace with your own assets
    this.load.setPath('assets');

    this.load.image('logo', 'last-one-flying-logo.png');
    this.load.image('player', 'player.png');
    this.load.image('laser-beam', 'laser-beam.png');
    this.load.image('enemy-laser-beam', 'enemy-laser-beam.png');
    this.load.image('explosion', 'explosion.png');
    this.load.image('basic-enemy', 'basic-enemy.png');
    this.load.image('health-icon', 'health-icon.png');
    this.load.image('pause-button', 'pause-button.png');
    this.load.spritesheet('health-point', 'health-point.png', {
      frameWidth: 53,
      frameHeight: 32,
    });
  }

  create() {
    //  When all the assets have loaded, it's often worth creating global objects here that the rest of the game can use.
    //  For example, you can define global animations here, so we can use them in other scenes.

    //  Move to the MainMenu. You could also swap this for a Scene Transition, such as a camera fade.
    // this.scene.start('MainMenu');

    WebFont.load({
      custom: {
        families: ['usuzi'],
      },
      active: () => {
        this.scene.start(SceneKey.MAIN_MENU);
      },
    });
  }
}
