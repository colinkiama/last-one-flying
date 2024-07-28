import { Scene, Math as PhaserMath } from 'phaser';
import { createMovementKeys, createCombatKeys } from '../utils';

const LASER_BEAM_WIDTH = 8;
const MICROSECONDS_IN_MILLISECOND = 1000;
const LASER_SHOT_DELAY = 250 // In milliseconds
export class Game extends Scene
{
    movementKeys;
    player
    laserBeams;
    nextShotTime
    constructor ()
    {
        super('Game');
    }

    create ()
    {
        this.cameras.main.setBackgroundColor(0x222222);
        this.player = this.physics.add.sprite(320, 180, 'player').setBodySize(32,24, 8).setOrigin(0.5, 0.5);
        this.movementKeys = createMovementKeys(this.input.keyboard);
        this.combatKeys = createCombatKeys(this.input.keyboard);
        this.laserBeams = this.physics.add.group({
            collideWorldBounds: true
        });
        this.nextShotTime = 0;
    }

    update () {
        this.handlePlayerMovement();

        const { shoot, useAbility, cycleAbilities } = this.combatKeys;

        if (shoot.isDown && this.time.now >= this.nextShotTime) {
            this.nextShotTime = this.time.now + LASER_SHOT_DELAY;
            const rotatedShipHeadOffset = new PhaserMath.Vector2(
                this.player.width * this.player.originX + LASER_BEAM_WIDTH,
                0
            ).rotate(this.player.rotation);

            const laserBeam = this.physics.add.image(
                this.player.x + rotatedShipHeadOffset.x,
                this.player.y + rotatedShipHeadOffset.y,
                'laser-beam'
            );

            laserBeam.setRotation(this.player.rotation);

            if (this.player.body.width === 24) {
                laserBeam.setBodySize(1, 8);
            }

            const speed = 250;
            this.laserBeams.add(laserBeam);
            this.physics.velocityFromRotation(this.player.rotation, speed, laserBeam.body.velocity);
        }
    }

    handlePlayerMovement() {
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

        // Set body size based on rotation boundaries (due to limitation of arcade physics body not supporting rotation)
        const verticalBoundaries = [Math.PI / 2, -Math.PI / 2 ];
        const horizontalBoundaries = [0, -Math.PI, Math.PI];

        const verticalDifferences = verticalBoundaries.map(
            (num) => Math.abs(this.player.rotation - num)
        );
        const horizontalDifferences = horizontalBoundaries.map(
            (num) => Math.abs(this.player.rotation - num)
        );

        let verticalDifference, horizontalDifference = Math.MAX;

        verticalDifference = verticalBoundaries.map(
            (num) => Math.abs(this.player.rotation - num)
        ).reduce((lastValue, currentValue) => {
            return currentValue < lastValue ? currentValue : lastValue
        }, Number.MAX_VALUE);

        horizontalDifference = horizontalBoundaries.map(
            (num) => Math.abs(this.player.rotation - num)
        ).reduce((lastValue, currentValue) => {
            return currentValue < lastValue ? currentValue : lastValue
        }, Number.MAX_VALUE);

        if ((verticalDifference < horizontalDifference)) {
            if (this.player.body.width !== 24) {
                this.player.setBodySize(24, 32, 8);
            }
        } else if (this.player.body.width.x !== 32) {
            this.player.setBodySize(32, 24, 8);
        }

        this.physics.world.wrap(this.player, 32);
    }
}

function isPositiveRotation(rotationValue) {
    if (rotationValue >= 0) {
        return true;
    }

    return false;
}
