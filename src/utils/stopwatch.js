import { Scene } from 'phaser';
import { MILLISECONDS_IN_SECOND, SECONDS_IN_MINUTE } from '../constants/time';

export class Stopwatch {
  _timer;
  _elapsedTime; // Elapsed Time in Milliseconds

  /**
   *
   * @param {Scene} scene
   */
  constructor(scene) {
    this._timer = scene.time.addEvent({
      delay: 100,
      loop: true,
      callback: this.updateElapsedTime,
      callbackScope: this,
    });
  }

  pause() {
    this._timer.paused = true;
  }

  play() {
    this._timer.paused = false;
  }

  updateElapsedTime() {
    this._elapsedTime += this._timer.getElapsed();
  }

  stop() {
    this._timer.reset({
      delay: 100,
      loop: true,
      paused: true,
    });
  }

  /**
   * Return elapsed time in the format `m:ss`
   */
  get formattedElapsedTime() {
    let remaningTime = this._elapsedTime;
    const minsPart =
      remaningTime / (SECONDS_IN_MINUTE * MILLISECONDS_IN_SECOND);
    remaningTime -= minsPart * SECONDS_IN_MINUTE * MILLISECONDS_IN_SECOND;
    const secondsPart = remaningTime / MILLISECONDS_IN_SECOND;

    return `${minsPart}:${secondsPart.toString().substring(0, 2).padStart(2, '0')}`;
  }
}
