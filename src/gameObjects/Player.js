import { Physics } from 'phaser';

export class Player extends Physics.Arcade.Image {
  constructor(scene, x, y, texture, frame) {
    super(scene, x, y, texture, frame);
    scene.add.existing(this);
    scene.physics.world.enable(this);
  }

  spawn(x, y) {
    this.enableBody(true, x, y, true, true);
  }
}
