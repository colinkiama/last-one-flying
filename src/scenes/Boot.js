import { Scene } from 'phaser';
import { SceneKey } from '../constants/scene.js';
import { LocalStorageKey, RegistryKey } from '../constants/data.js';

export class Boot extends Scene {
  constructor() {
    super(SceneKey.BOOT);
  }

  preload() {
    //  The Boot Scene is typically used to load in any assets you require for your Preloader, such as a game logo or background.
    //  The smaller the file size of the assets, the better, as the Boot Scene itself has no preloader.
  }

  create() {
    const storedHighScore = window.localStorage.getItem(
      LocalStorageKey.HIGH_SCORE,
    );
    this.game.registry.set(RegistryKey.HIGH_SCORE, storedHighScore ?? 0);
    console.log(
      'Stored High score:',
      this.game.registry.get(RegistryKey.HIGH_SCORE),
    );
    this.scene.start(SceneKey.PRELOADER);
  }
}
