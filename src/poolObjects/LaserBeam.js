import { Physics, Math as PhaserMath } from 'phaser';
const LASER_SHOT_SPEED = 250;
const LIFESPAN = 2000; // In milliseconds

export class LaserBeam extends Physics.Arcade.Image {
  lifespan;

  fire(x, y, config) {
    const { isVertical = false, rotation = 0 } = config || {
      isVertical: false,
      rotation: 0,
    };

    this.enableBody(true, x, y, true, true);

    this.setRotation(rotation);

    if (isVertical) {
      this.setBodySize(this.height, this.width);
    } else {
      this.setBodySize(this.width, this.height);
    }

    this.scene.physics.velocityFromRotation(
      this.rotation,
      LASER_SHOT_SPEED,
      this.body.velocity,
    );
    this.lifespan = LIFESPAN;
  }

  update(time, delta) {
    this.lifespan -= delta;

    if (this.lifespan <= 0) {
      this.disableBody(true, true);
    }
  }
}
