import { Math as PhaserMath } from 'phaser';
import { createMovementKeys } from '../utils/input.js';
import { POINTER_DEADZONE } from '../constants/movement.js';

export class MovementSystem {
    scene;
    _player;
    _movementKeys;

    constructor (scene, player) {
        this.scene = scene;
        this._player = player;
        this._movementKeys = createMovementKeys(this.scene.input.keyboard);
    }

    activatePointerMovement () {
        this.scene.input.on('pointermove', this.onPointerMove.bind(this));
    }

    handlePlayerMovement () {
        const { up, down, left, right } = this._movementKeys;

        if (left.isDown) {
            this._player.setAngularVelocity(-400);
        } else if (right.isDown) {
            this._player.setAngularVelocity(400);
        } else {
            this._player.setAngularVelocity(0);
        }

        if (up.isDown) {
            this.scene.physics.velocityFromRotation(this._player.rotation, 300, this._player.body.velocity);
        } else if (down.isDown) {
            this.scene.physics.velocityFromRotation(this._player.rotation, -300, this._player.body.velocity);
        } else {
            this._player.setVelocity(0);
        }

        // Set body size based on rotation boundaries (due to limitation of arcade physics body not supporting rotation)
        const verticalBoundaries = [Math.PI / 2, -Math.PI / 2 ];
        const horizontalBoundaries = [0, -Math.PI, Math.PI];

        let verticalDifference, horizontalDifference = Number.MAX_VALUE;

        verticalDifference = verticalBoundaries.map(
            (num) => Math.abs(this._player.rotation - num)
        ).reduce((lastValue, currentValue) => {
            return currentValue < lastValue ? currentValue : lastValue
        }, Number.MAX_VALUE);

        horizontalDifference = horizontalBoundaries.map(
            (num) => Math.abs(this._player.rotation - num)
        ).reduce((lastValue, currentValue) => {
            return currentValue < lastValue ? currentValue : lastValue
        }, Number.MAX_VALUE);

        if ((verticalDifference < horizontalDifference)) {
            if (this._player.body.width !== 24) {
                this._player.setBodySize(24, 32, 8);
            }
        } else if (this._player.body.width.x !== 32) {
            this._player.setBodySize(32, 24, 8);
        }

        this.scene.physics.world.wrap(this._player, this._player.width / 2);
    }

    onPointerMove(pointer) {
        if (this.isInDeadzone(pointer.worldX, pointer.worldY)) {
            return;
        }
        
        const targetAngle = PhaserMath.Angle.Between(this._player.x, this._player.y, pointer.worldX, pointer.worldY);
        this._player.setRotation(targetAngle);
    }

    isInDeadzone(x, y) {
        return x >= this._player.x - POINTER_DEADZONE
            && x <= this._player.x + POINTER_DEADZONE
            && y >= this._player.y - POINTER_DEADZONE
            && y <= this._player.y + POINTER_DEADZONE;    
    }
}

