import { Boot } from './scenes/Boot.js';
import { Battle } from './scenes/Battle.js';
import { GameOver } from './scenes/GameOver.js';
import { MainMenu } from './scenes/MainMenu.js';
import { Preloader } from './scenes/Preloader.js';
import { Credits } from './scenes/Credits.js';
import { HUD } from './scenes/HUD.js';
import { AUTO, Scale, Game } from 'phaser';
import { TOUCH_CONTROLS_KEY } from './constants/data.js';
import { VirtualJoyStickPlugin } from 'virtualjoystick';

//  Find out more information about the Game Config at:
//  https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
const config = {
  type: AUTO,
  width: 640,
  height: 360,
  parent: 'game-container',
  backgroundColor: '#000000',
  disableContextMenu: true,
  pixelArt: true,
  scale: {
    mode: Scale.FIT,
    autoCenter: Scale.CENTER_BOTH,
  },
  physics: {
    default: 'arcade',
  },
  input: {
    activePointers: 2,
  },
  scene: [Boot, Preloader, MainMenu, Battle, Credits, HUD, GameOver],
  plugins: {
    global: [
      {
        key: 'rexVirtualJoystick',
        plugin: VirtualJoyStickPlugin,
        start: true,
      },
    ],
  },
};

const game = new Game(config);

document.body.addEventListener('pointerdown', onPointerDown);

function onPointerDown(event) {
  const currentValue = game.registry.get(TOUCH_CONTROLS_KEY);
  const pointerType = event.pointerType;
  if (!currentValue && pointerType === 'touch') {
    game.registry.set(TOUCH_CONTROLS_KEY, true);
    document.addEventListener('keydown', onKeyDown);
  } else if (currentValue && pointerType !== 'touch') {
    game.registry.set(TOUCH_CONTROLS_KEY, false);
  }
}

function onKeyDown(event) {
  const currentValue = game.registry.get(TOUCH_CONTROLS_KEY);
  if (currentValue) {
    document.removeEventListener('keydown', onKeyDown);
    game.registry.set(TOUCH_CONTROLS_KEY, false);
  }
}

game.scale.on('orientationchange', (_orientation) => {
  // Ensure that the game canvas always fits the screen
  // whenever the orientation changes
  game.scale.setGameSize(640, 360);
});

export default game;
