import * as Phaser from 'phaser';
/**
 * @typedef {Object} LoopConfig
 * @property {Phaser.Types.Sound.SoundConfig} initialPlayback
 * @property {Phaser.Types.Sound.SoundConfig} loopPlayback
 */

export class AudioSystem {
  /**
   * @type {Phaser.Sound.BaseSoundManager}
   */
  _soundManager;

  /**
   * @type {Map<string, LoopConfig>}
   */
  _loopConfigs;

  constructor(soundManager) {
    this._soundManager = soundManager;
    this._loopConfigs = new Map();
  }

  play(key, options) {
    const audio = this.getOrAddAudio(key, options);
    audio.play();
  }

  pause(key) {
    const audio = this.get(key);
    audio.play();
  }

  resume(key) {
    const audio = this.get(key);
    audio.resume();
  }

  get(key) {
    const audio = this.get(key);
    if (!audio) {
      throw new Error(`Audio not found using the key: '${key}'`);
    }

    return this._soundManager.get(key);
  }

  getOrAddAudio(key, options) {
    return this._soundManager.get(key) ?? this._soundManager.add(key, options);
  }

  stop(key) {
    const audio = this.get(key);
    audio.stop();
  }
}
