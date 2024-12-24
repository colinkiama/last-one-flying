import { ScreenShakeType } from '../constants/vfx.js';

export class VFXSystem {
  scene;
  _explosionPool;

  constructor(scene, pools) {
    const internalPools = pools || {};
    const { explosionPool = undefined } = internalPools;
    this.scene = scene;

    if (explosionPool) {
      this._explosionPool = explosionPool;
    }
  }

  makeShipExplosion(ship) {
    // In scenarios where there are no inactive items in the explosions pool, you
    // don't display an explosion.
    if (!this._explosionPool) {
      throw new Error(
        'Cannot create ship explosions without explosion pool being defined in VFXSystem constructor',
      );
    }

    const explosion = this._explosionPool.get();
    if (!explosion) {
      return;
    }

    explosion
      .enable()
      .setConfig({
        lifespan: 1000,
        speed: { min: 150, max: 250 },
        scale: { start: 2, end: 0 },
        gravityY: 150,
        emitting: false,
        texture: 'explosion',
      })
      .explode(20, ship.x, ship.y);
  }

  shakeScreen(screenShakeType) {
    switch (screenShakeType) {
      case ScreenShakeType.PLAYER_FIRE:
        this.scene.cameras.main.shake(100, 0.005);
        break;
      case ScreenShakeType.ENEMY_DEATH:
        this.scene.cameras.main.shake(200, 0.01);
        break;
      case ScreenShakeType.PLAYER_DEATH:
        this.scene.cameras.main.shake(500, 0.01);
        break;
    }
  }
}
