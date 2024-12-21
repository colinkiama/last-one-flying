import { GameObjects } from 'phaser';

export class HealthPoint extends GameObjects.Sprite {
    constructor(scene, x, y, texture) {
        super(scene, x, y, texture);
    }

    flicker() {
        this.play('flicker');
    }

    illuminate() {
        this.stop();
        this.setFrame(0);
    }

    dim() {
        this.stop();
        this.setFrame(1);
    }
}
