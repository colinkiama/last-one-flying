import { Scene } from 'phaser';
import {
  MILLISECONDS_IN_SECOND,
  SECONDS_IN_MINUTE,
} from '../constants/time.js';

export class Stopwatch {
  _timer;
  _elapsedTime; // Elapsed Time in Milliseconds

  /**
   *
   * @param {Scene} scene
   */
  constructor(scene) {
    this._elapsedTime = 0;
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

  reset() {
    this._elapsedTime = 0;
    this._timer.reset({
      delay: 100,
      loop: true,
      callback: this.updateElapsedTime,
      callbackScope: this,
    });
  }

  /**
   * Return elapsed time in the format `m:ss`
   */
  get formattedElapsedTime() {
    let remaningTime = this._elapsedTime;
    const minsPart = Math.trunc(
      remaningTime / (SECONDS_IN_MINUTE * MILLISECONDS_IN_SECOND),
    );
    remaningTime -= minsPart * SECONDS_IN_MINUTE * MILLISECONDS_IN_SECOND;
    const secondsPart = Math.trunc(remaningTime / MILLISECONDS_IN_SECOND);

    return `${minsPart}:${secondsPart.toString().padStart(2, '0')}`;
  }
}
