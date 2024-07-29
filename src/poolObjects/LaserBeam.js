import { Physics, Math as PhaserMath } from 'phaser';
const LASER_SHOT_SPEED = 250;
const LIFESPAN = 2000; // In milliseconds

export default class LaserBeam extends Physics.Arcade.Image {
    lifespan

    constructor (scene) {
        super(scene, 0, 0, 'laser-beam');
    }

    fire (x, y, config) {
        const { isVertical = false, rotation = 0 } = config || { isVertical: false, rotation: 0 } ;

        this.enableBody(
            true,
            x,
            y,
            true,
            true
        );

        this.setRotation(rotation);

        if (isVertical) {
            this.setBodySize(this.height, this.width);
        }

        this.scene.physics.velocityFromRotation(this.rotation, LASER_SHOT_SPEED, this.body.velocity);
        this.lifespan = LIFESPAN
    }

    update (time, delta) {
        this.lifespan -= delta;
        this.scene.physics.world.wrap(this, this.width / 2);

        if (this.lifespan <= 0) {
            this.disableBody(true, true);
        }
    }
}
