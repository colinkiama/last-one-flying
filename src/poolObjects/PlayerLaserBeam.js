import { LaserBeam } from './LaserBeam.js';

export class PlayerLaserBeam extends LaserBeam {
  update(time, delta) {
    this.lifespan -= delta;
    this.scene.physics.world.wrap(this, this.width / 2);

    if (this.lifespan <= 0) {
      this.disableBody(true, true);
    }
  }
}
