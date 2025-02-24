export class AudioSystem {
  _soundManager;
  _audioCache;

  constructor(soundManager) {
    this._soundManager = soundManager;
    this._audioCache = new Map();
  }

  play(key, options) {
    const audio = this.getOrAddAudio(key, options);
    if (!audio) {
      console.error(`Audio not found using the key: '${key}'`);
    }

    audio.play();
  }

  get(key) {
    return this._audioCache.get(key);
  }

  getOrAddAudio(key, options) {
    return this._audioCache.get(key) ?? this._soundManager.add(key, options);
  }

  stop(key) {
    const audio = this._audioCache.get(key);
    if (!audio) {
      console.error(`Audio not found using the key: '${key}'`);
    }

    audio.stop();
  }
}
