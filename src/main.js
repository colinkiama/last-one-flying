import { Boot } from './scenes/Boot.js';
import { Battle } from './scenes/Battle.js';
import { GameOver } from './scenes/GameOver.js';
import { MainMenu } from './scenes/MainMenu.js';
import { Preloader } from './scenes/Preloader.js';
import { Credits } from './scenes/Credits.js';
import { HUD } from './scenes/HUD.js';
import { AUTO, Scale, Game } from 'phaser';

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
  scene: [Boot, Preloader, MainMenu, Battle, Credits, HUD, GameOver],
};

export default new Game(config);
