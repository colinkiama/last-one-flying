import { Physics, Math as PhaserMath } from 'phaser';
const LASER_SHOT_SPEED = 250;

export default class LaserBeam extends Physics.Arcade.Image {
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
            this.setBodySize(1, 8);
        }

        this.scene.physics.velocityFromRotation(this.rotation, LASER_SHOT_SPEED, this.body.velocity);
    }
}
