import { Physics, Math as PhaserMath } from 'phaser';
const LASER_SHOT_SPEED = 250;
const LIFESPAN = 2000; // In milliseconds

export default class BasicEnemy extends Physics.Arcade.Sprite {
    lifespan

    constructor (scene) {
        super(scene, 0, 0, 'basic-enemy');
    }

    spawn (x, y) {
        this.enableBody(
            true,
            x,
            y,
            true,
            true
        );
    }

    update (time, delta) {
    }
}
