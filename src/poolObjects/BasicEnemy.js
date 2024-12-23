import { Physics, Math as PhaserMath } from 'phaser';
const LASER_SHOT_SPEED = 250;
const LIFESPAN = 2000; // In milliseconds

export class BasicEnemy extends Physics.Arcade.Image {
  lifespan;

  spawn(x, y) {
    this.enableBody(true, x, y, true, true);
  }

  update(time, delta) {}
}
