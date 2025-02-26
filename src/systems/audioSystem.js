import * as Phaser from 'phaser';

export class AudioSystem {
  /**
   * @type {Phaser.Sound.BaseSoundManager}
   */
  _soundManager;
  _loopMarkers;

  constructor(soundManager) {
    this._soundManager = soundManager;
    this._loopMarkers = new Map();
  }

  play(key, options) {
    const audio = this.getOrAddAudio(key, options);
    audio.play();
  }

  playSFX(key, options) {
    this._soundManager.play(key, options);
  }

  playLoop(key, options, loopMarkerConfig) {
    const audio = this.getOrAddAudio(key, options);
    this._loopMarkers.get(key) ?? this._loopMarkers.set(key, audio.addMarker(loopMarkerConfig));

    audio.play();
    audio.once("complete", () => {
      audio.play(loopMarkerConfig.name);
    });
  }

  pause(key) {
    const audio = this.get(key);
    audio.pause();
  }

  resume(key) {
    const audio = this.get(key);
    audio.resume();
  }

  get(key) {
    const audio = this._soundManager.get(key);
    return audio;
  }

  getOrAddAudio(key, options) {
    return this._soundManager.get(key) ?? this._soundManager.add(key, options);
  }

  stop(key) {
    const audio = this.get(key);
    audio.stop();
  }
}
