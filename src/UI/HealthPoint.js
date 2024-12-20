import { GameObjects } from 'phaser';

export class HealthPoint extends GameObjects.Sprite {
    constructor(scene, x, y, texture) {
        super(scene, x, y, texture);
    }
}