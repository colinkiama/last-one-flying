import { Physics } from 'phaser';

const STARTING_X = 320;
const STARTING_Y = 180;

export class Player extends Physics.Arcade.Image {
  constructor(scene) {
    super(scene, STARTING_X, STARTING_Y, 'player');
    scene.add.existing(this);
    scene.physics.world.enable(this);
  }

  spawn(x, y) {
    this.enableBody(true, x, y, true, true);
  }
}
