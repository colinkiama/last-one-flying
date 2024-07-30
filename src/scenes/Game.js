import { Scene, Math as PhaserMath } from 'phaser';
import { createMovementKeys, createCombatKeys } from '../utils';
import { LaserBeam, TestEnemy } from '../poolObjects';

const MICROSECONDS_IN_MILLISECOND = 1000;
const LASER_SHOT_DELAY = 250 // In milliseconds
export class Game extends Scene
{
    _movementKeys;
    __combatKeys;

    _player;
    _testEnemies;
    _laserBeams;
    _nextShotTime;

    constructor ()
    {
        super('Game');
    }

    create ()
    {
        this.cameras.main.setBackgroundColor(0x000000);
        this._player = this.physics.add.sprite(320, 180, 'player').setBodySize(32,24, 8).setOrigin(0.5, 0.5);
        this._nextShotTime = 0;
        this._movementKeys = createMovementKeys(this.input.keyboard);
        this._combatKeys = createCombatKeys(this.input.keyboard);

        this._laserBeams = this.physics.add.group({
            classType: LaserBeam,
            maxSize: 50,
            runChildUpdate: true
        });

        this._testEnemies = this.physics.add.group({
            classType: TestEnemy,
            maxSize: 50,
            runChildUpdate: true,
        })

        this.physics.add.overlap(
            this._testEnemies,
            this._laserBeams,
            (enemy, laserBeam) => {
                console.log("Enemy Hit!");
                enemy.disableBody(true, true);
                laserBeam.disableBody(true, true);
            }
        )

        const startingEnemy = this._testEnemies.get();
        if (startingEnemy) {
            startingEnemy.spawn(400, 200);
        }
    }

    update () {
        this.handlePlayerMovement();

        const { shoot, useAbility, cycleAbilities } = this._combatKeys;

        if (shoot.isDown && this.time.now >= this._nextShotTime) {
            this._nextShotTime = this.time.now + LASER_SHOT_DELAY;
            const laserBeam = this._laserBeams.get();
            if (laserBeam) {
                const rotatedShipHeadOffset = new PhaserMath.Vector2(
                    this._player.width * this._player.originX + laserBeam.width,
                    0
                ).rotate(this._player.rotation);

                laserBeam.fire(
                    this._player.x + rotatedShipHeadOffset.x,
                    this._player.y + rotatedShipHeadOffset.y,
                    {
                        isVertical: this._player.body.width === 24,
                        rotation: this._player.rotation
                    }
                );
            }
        }
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
            this.physics.velocityFromRotation(this._player.rotation, 300, this._player.body.velocity);
        } else if (down.isDown) {
            this.physics.velocityFromRotation(this._player.rotation, -300, this._player.body.velocity);
        } else {
            this._player.setVelocity(0);
        }

        // Set body size based on rotation boundaries (due to limitation of arcade physics body not supporting rotation)
        const verticalBoundaries = [Math.PI / 2, -Math.PI / 2 ];
        const horizontalBoundaries = [0, -Math.PI, Math.PI];

        const verticalDifferences = verticalBoundaries.map(
            (num) => Math.abs(this._player.rotation - num)
        );
        const horizontalDifferences = horizontalBoundaries.map(
            (num) => Math.abs(this._player.rotation - num)
        );

        let verticalDifference, horizontalDifference = Math.MAX;

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

        this.physics.world.wrap(this._player, this._player.width / 2);
    }
}

