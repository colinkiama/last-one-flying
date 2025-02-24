export class AudioSystem {
  _soundManager;

  constructor(soundManager) {
    this._soundManager = soundManager;
  }

  play(key, options) {
    const audio = this.getOrAddAudio(key, options);
    if (!audio) {
      console.error(`Audio not found using the key: '${key}'`);
    }

    audio.play();
  }

  get(key) {
    return this._soundManager.get(key);
  }

  getOrAddAudio(key, options) {
    return this._soundManager.get(key) ?? this._soundManager.add(key, options);
  }

  stop(key) {
    const audio = this._soundManager.get(key);
    if (!audio) {
      console.error(`Audio not found using the key: '${key}'`);
    }

    audio.stop();
  }
}
