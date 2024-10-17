import { Scene, Math as PhaserMath, Time } from 'phaser';
import { createCombatKeys, SpawnManager, MovementManager } from '../utils';
import { LaserBeam, BasicEnemy, Explosion } from '../poolObjects';
import crossSceneEventEmitter from '../utils'

const MICROSECONDS_IN_MILLISECOND = 1000;
const LASER_SHOT_DELAY = 250 // In milliseconds

const ScoreUpdateType = {
    ENEMY_HIT: 'enemy-hit'
};

export class Game extends Scene
{
    _combatKeys;
    _player;
    _basicEnemies;
    _laserBeams;
    _enemyLaserBeams;
    _nextShotTime;
    _explosions;
    _enemyShotTimerEvent;
    _score;
    _enemySpawnTimerEvent;
    _last_enemy_hit_time;
    _enemySpawnManager;
    _movementManager;

    constructor ()
    {
        super('Game');
    }

    create ()
    {
        this._score = 0;
        this._last_enemy_hit_time = 0;

        this.cameras.main.setBackgroundColor(0x000000);
        this._player = this.spawnPlayer();
        this._nextShotTime = 0;
        this._combatKeys = createCombatKeys(this.input.keyboard);

        this._laserBeams = this.physics.add.group({
            classType: LaserBeam,
            maxSize: 50,
            runChildUpdate: true
        });

        this._enemyLaserBeams = this.physics.add.group({
            classType: LaserBeam,
            maxSize: 500,
            runChildUpdate: true
        });

        this._basicEnemies = this.physics.add.group({
            classType: BasicEnemy,
            maxSize: 50,
            runChildUpdate: true,
        });

        this._explosions = this.add.group({
            classType: Explosion,
            maxSize: 50,
            runChildUpdate: true
        });

        this._enemySpawnManager = new SpawnManager(this, this._player, this._basicEnemies);
        this._movementManager = new MovementManager(this, this._player);

        this.physics.add.overlap(
            this._basicEnemies,
            this._laserBeams,
            (enemy, laserBeam) => {
                explodeShip(this._explosions.get(), enemy);
                this.updateScore('enemy-hit');
                this.cameras.main.shake(200, 0.01);
                laserBeam.disableBody(true, true);
                this._last_enemy_hit_time = this.time.now;
            }
        )

        this.physics.add.collider(
            this._basicEnemies,
            this._player,
            (enemy, player) => {
                explodeShip(this._explosions.get(), enemy);
                const activeEnemies = this._basicEnemies.getMatching('active', true);
                const closestEnemy = activeEnemies.reduce((lastEnemy, currentEnemy, index) => {
                    if (!lastEnemy) {
                        return currentEnemy;
                    }

                    return Math.abs(player.x - currentEnemy.x) < Math.abs(player.x - lastEnemy.x) ? currentEnemy : lastEnemy;
                }, null);

                explodeShip(this._explosions.get(), player);
                this.cameras.main.shake(500, 0.01);
                this.spawnPlayer({ enemy: closestEnemy });
            }
        )

        this.physics.add.overlap(
            this._player,
            this._enemyLaserBeams,
            (player, laserBeam) => {
                const deathPosition = {
                    x: player.x,
                    y: player.y
                };

                const activeEnemies = this._basicEnemies.getMatching('active', true);
                const closestEnemy = activeEnemies.reduce((lastEnemy, currentEnemy, index) => {
                    if (!lastEnemy) {
                        return currentEnemy;
                    }

                    return Math.abs(player.x - currentEnemy.x) < Math.abs(player.x - lastEnemy.x) ? currentEnemy : lastEnemy;
                }, null);

                explodeShip(this._explosions.get(), player);
                this.cameras.main.shake(500, 0.01);
                laserBeam.disableBody(true, true);
                this.spawnPlayer({ enemy: closestEnemy });
            }
        )

        this._enemyShotTimerEvent = new Time.TimerEvent ({
            delay: 2000,
            loop: true,
            callback: () => {
                const activeEnemies = this._basicEnemies.getMatching('active', true);
                for (let i = 0; i < activeEnemies.length; i++) {
                    const enemy = activeEnemies[i];
                    const enemyLaserBeam = this._enemyLaserBeams.get();

                    if (enemyLaserBeam) {
                        const rotatedShipHeadOffset = new PhaserMath.Vector2(
                            enemy.width * enemy.originX + enemyLaserBeam.width,
                            0
                        ).rotate(enemy.rotation);

                        enemyLaserBeam.fire(
                            enemy.x + rotatedShipHeadOffset.x,
                            enemy.y + rotatedShipHeadOffset.y,
                            {
                                isVertical: enemy.body.width === 24,
                                rotation: enemy.rotation
                            }
                        );
                    }
                }
            }
        });

        this._enemySpawnTimerEvent = new Time.TimerEvent({
            delay: 500,
            startAt: 500,
            loop: true,
            callback: () => {
                this._enemySpawnManager.spawn()
            }
        })

        this.time.addEvent(this._enemyShotTimerEvent);
        this.time.addEvent(this._enemySpawnTimerEvent);
        this.input.on('pointermove', this.onPointerMove.bind(this));

        this.scene.launch('HUD');
    }

    update () {
        this._movementManager.handlePlayerMovement();

        const { shoot, useAbility, cycleAbilities } = this._combatKeys;
        const activePointer = this.input.activePointer;
        const shootButtonPressed = shoot.isDown || activePointer.primaryDown;

        if (shootButtonPressed && this.time.now >= this._nextShotTime) {
            this._nextShotTime = this.time.now + LASER_SHOT_DELAY;
            const laserBeam = this._laserBeams.get();
            if (laserBeam) {
                const rotatedShipHeadOffset = new PhaserMath.Vector2(
                    this._player.width * this._player.originX + laserBeam.width,
                    0
                ).rotate(this._player.rotation);

                this.cameras.main.shake(100, 0.005);
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

        this.followPlayer();
    }

    updateScore (updateType) {
        switch (updateType) {
            case ScoreUpdateType.ENEMY_HIT:
                this._score += 100;
                break;
        }

        crossSceneEventEmitter.emit('update-score', this._score);
    }

    followPlayer () {
        const activeEnemies = this._basicEnemies.getMatching('active', true);
        const targetX = this._player.x;
        const targetY = this._player.y;

        for (let i = 0; i < activeEnemies.length; i++) {
            const enemy = activeEnemies[i];

            const targetAngle = Phaser.Math.Angle.Between(enemy.x, enemy.y, targetX, targetY);
            const rotation = Phaser.Math.Angle.RotateTo(enemy.rotation, targetAngle, 0.05 * Math.PI);
            enemy.setRotation(rotation);

            this.physics.moveToObject(enemy, this._player, 40);
        }
    }

    onPointerMove(pointer) {
        const targetAngle = Phaser.Math.Angle.Between(this._player.x, this._player.y, pointer.worldX, pointer.worldY);
        const rotation = this._player.setRotation(targetAngle);
    }


    spawnPlayer (payload) {
        const { enemy: enemy = null } = payload ?? {};
        if (!this._player) {
            return this.physics.add.sprite(320, 180, 'player').setBodySize(32,24, 8).setOrigin(0.5, 0.5);
        }

        if (!enemy) {
            this._player.enableBody(true, 320, PhaserMath.RND.between(100, 300), true, true);
            return;
        }

        const minDistanceFromEnemy = 200;

        // 50% of being left or right of enemy.
        const xPosition1 = PhaserMath.RND.between(0, enemy.x - minDistanceFromEnemy);
        const xPosition2 = PhaserMath.RND.between(enemy.x + minDistanceFromEnemy, this.cameras.main.width);

        let playerX = PhaserMath.RND.frac() >= 0.5 ? xPosition2 : xPosition1;
        let playerY = Phaser.Math.RND.between(this._player.height, this.cameras.main.height - this._player.height);

        this._player.enableBody(true, playerX, playerY, true, true);
    }
}

function explodeShip (explosion, ship) {
    // In scenarios where there are no inactive items in the explosions pool, you
    // don't display an explosion.
    if (!explosion) {
        return;
    }

    ship.disableBody(true, true);

    explosion
    .enable()
    .setConfig({
        lifespan: 1000,
        speed: { min: 150, max: 250 },
        scale: { start: 2, end: 0 },
        gravityY: 150,
        emitting: false,
        texture: 'explosion'
    }).explode(20, ship.x, ship.y);

}
