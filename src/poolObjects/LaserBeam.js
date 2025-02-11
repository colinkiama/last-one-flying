import { Physics, Math as PhaserMath } from 'phaser';
import {
  PLAYER_LASER_BEAM_SPEED,
  PLAYER_LASER_LIFE_SPAN,
} from '../constants/combat.js';
const LIFESPAN = 2000; // In milliseconds

export class LaserBeam extends Physics.Arcade.Image {
  lifespan;

  fire(x, y, config) {
    const {
      isVertical = false,
      rotation = 0,
      laserBeamSpeed = PLAYER_LASER_BEAM_SPEED,
      lifespan = PLAYER_LASER_LIFE_SPAN,
    } = config || {
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
      laserBeamSpeed,
      this.body.velocity,
    );
    this.lifespan = lifespan;
  }

  update(time, delta) {
    this.lifespan -= delta;

    if (this.lifespan <= 0) {
      this.disableBody(true, true);
    }
  }
}
