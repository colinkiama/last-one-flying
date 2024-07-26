import { Scene } from 'phaser';
import { createMovementKeys } from '../utils';

export class Game extends Scene
{
    movementKeys;
    player
    constructor ()
    {
        super('Game');
    }

    create ()
    {
        this.cameras.main.setBackgroundColor(0xffffff);
        this.player = this.physics.add.sprite(320, 180, 'player').setOrigin(0.5, 0.5).setAlpha(1);
        this.movementKeys = createMovementKeys(this.input.keyboard);
    }

    update () {
        const { up, down, left, right } = this.movementKeys;

        if (left.isDown) {
            this.player.setAngularVelocity(-100);
        } else if (right.isDown) {
            this.player.setAngularVelocity(100);
        } else {
            this.player.setAngularVelocity(0);
        }

        if (up.isDown) {
            this.physics.velocityFromRotation(this.player.rotation, 100, this.player.body.velocity);
        } else if (down.isDown) {
            this.physics.velocityFromRotation(this.player.rotation, -100, this.player.body.velocity);
        } else {
            this.player.setVelocity(0);
        }
    }
}
