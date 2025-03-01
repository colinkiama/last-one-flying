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
    const hadLoopMarkerStored = this._loopMarkers.has(key);

    if (!hadLoopMarkerStored) {
      const marker =
        audio.markers[loopMarkerConfig.name] ??
        audio.addMarker(loopMarkerConfig);
      this._loopMarkers.set(key, marker);

      audio.on('complete', playLoopMarkerOnCompletion, {
        audio: audio,
        markerName: loopMarkerConfig.name,
      });
    }

    audio.play(options ?? undefined);
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
    const audio = this._soundManager.get(key);
    return this._soundManager.get(key) ?? this._soundManager.add(key, options);
  }

  stop(key) {
    const audio = this.get(key);
    audio.stop();
  }

  unsubscribeFromEvents() {
    const keys = this._loopMarkers.keys().toArray();
    keys.forEach((key) => {
      const audio = this._soundManager.get(key);
      audio.off('complete', playLoopMarkerOnCompletion, {
        audio: audio,
        markerName: this._loopMarkers.get(key).name,
      });
      this._loopMarkers.delete(key);
    });
  }
}

function playLoopMarkerOnCompletion() {
  const { audio, markerName } = this;
  audio.play(markerName);
}
