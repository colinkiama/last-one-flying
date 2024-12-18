import { ScreenShakeType } from '../constants';

export class VFXSystem {
    scene;
    _explosionPool;

    constructor (scene, pools) {
        const { explosionPool } = pools;
        this.scene = scene;
        this._explosionPool = explosionPool;
    }

    // TODO: Screen Shake methods...

    makeShipExplosion (ship) {
        // In scenarios where there are no inactive items in the explosions pool, you
        // don't display an explosion.
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
            texture: 'explosion'
        }).explode(20, ship.x, ship.y);
    }

    shakeScreen (screenShakeType) {
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
