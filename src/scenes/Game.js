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
        this.cameras.main.setBackgroundColor(0x222222);
        this.player = this.physics.add.sprite(320, 180, 'player').setBodySize(32,24, 8).setOrigin(0.5, 0.5);
        this.movementKeys = createMovementKeys(this.input.keyboard);
    }

    update () {
        const { up, down, left, right } = this.movementKeys;

        if (left.isDown) {
            this.player.setAngularVelocity(-400);
        } else if (right.isDown) {
            this.player.setAngularVelocity(400);
        } else {
            this.player.setAngularVelocity(0);
        }

        if (up.isDown) {
            this.physics.velocityFromRotation(this.player.rotation, 300, this.player.body.velocity);
        } else if (down.isDown) {
            this.physics.velocityFromRotation(this.player.rotation, -300, this.player.body.velocity);
        } else {
            this.player.setVelocity(0);
        }

        if (isPositiveRotation(this.player.rotation)) {
            if (this.player.rotation >= Math.PI / 2) {
                this.player.setBodySize(24, 32, 0);
            } else {
                this.player.setBodySize(32, 24, 0);
            }
        } else {
            if (this.player.rotation < - Math.PI / 2) {
                this.player.setBodySize(32, 24, 0);
            } else {
                this.player.setBodySize(24, 32, 0);
            }
        }


        console.log("Player rotation:", this.player.rotation);

        this.physics.world.wrap(this.player, 32);
    }
}

function isPositiveRotation(rotationValue) {
    if (rotationValue >= 0) {
        return true;
    }

    return false;
}
