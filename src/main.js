import { AUTO, Scale, Game } from 'phaser';
import { VirtualJoyStickPlugin } from 'virtualjoystick';
import { RegistryKey } from './constants/data.js';
import { Preloader } from './scenes/Preloader.js';

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
  scene: [Preloader],
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
  const currentValue = game.registry.get(RegistryKey.TOUCH_CONTROLS);
  const pointerType = event.pointerType;
  if (!currentValue && pointerType === 'touch') {
    game.registry.set(RegistryKey.TOUCH_CONTROLS, true);
    document.addEventListener('keydown', onKeyDown);
  } else if (currentValue && pointerType !== 'touch') {
    game.registry.set(RegistryKey.TOUCH_CONTROLS, false);
  }
}

function onKeyDown(event) {
  const currentValue = game.registry.get(RegistryKey.TOUCH_CONTROLS);
  if (currentValue) {
    document.removeEventListener('keydown', onKeyDown);
    game.registry.set(RegistryKey.TOUCH_CONTROLS, false);
  }
}

game.scale.on('orientationchange', (_orientation) => {
  // Ensure that the game canvas always fits the screen
  // whenever the orientation changes
  game.scale.setGameSize(640, 360);
});

export default game;
